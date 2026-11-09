import { z } from "zod";
import { dbGet, dbRun, nowIso, transaction } from "./db";
import { categories } from "./site";
import { isCategory } from "./products";

const categorySlugs = categories.map((category) => category.slug) as [
  string,
  ...string[],
];

const feedProductSchema = z.object({
  sku: z.string().trim().min(1).max(80),
  slug: z
    .string()
    .trim()
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  name: z.string().trim().min(2).max(180),
  brand: z.string().trim().min(1).max(80),
  category: z.enum(categorySlugs),
  description: z.string().trim().min(20).max(4000),
  specs: z.record(z.string().max(60), z.string().max(300)).default({}),
  price: z.number().positive().max(1_000_000),
  compareAt: z.number().positive().max(1_000_000).optional(),
  stock: z.number().int().min(0).max(1_000_000),
  image: z.string().trim().max(2000).optional(),
  featured: z.boolean().optional(),
  sourceUrl: z.string().trim().max(2000).optional(),
});

export const priceFeedSchema = z.object({
  currency: z.literal("EUR").default("EUR"),
  observedAt: z.string().datetime().optional(),
  products: z.array(feedProductSchema).min(1).max(2000),
  purgeDemo: z.boolean().optional().default(false),
});

export type PriceFeed = z.infer<typeof priceFeedSchema>;

function safeHttpsUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export async function syncPriceFeed(raw: unknown) {
  const feed = priceFeedSchema.parse(raw);
  const observedAt = feed.observedAt
    ? new Date(feed.observedAt).toISOString()
    : nowIso();

  const result = {
    created: 0,
    updated: 0,
    observations: 0,
    removedDemo: 0,
    skipped: 0,
  };

  await transaction(async () => {
    if (feed.purgeDemo) {
      result.removedDemo = (
        await dbRun("DELETE FROM products WHERE is_demo = 1")
      ).changes;
    }

    for (const item of feed.products) {
      if (!isCategory(item.category)) {
        result.skipped += 1;
        continue;
      }

      const existing = await dbGet<{
        id: number;
        slug: string;
        price_cents: number;
      }>("SELECT id, slug, price_cents FROM products WHERE sku = ?", item.sku);

      const priceCents = Math.round(item.price * 100);
      const compareAtCents =
        item.compareAt && item.compareAt > item.price
          ? Math.round(item.compareAt * 100)
          : null;
      const image = safeHttpsUrl(item.image) ?? "";
      const sourceUrl = safeHttpsUrl(item.sourceUrl);
      const now = nowIso();

      if (existing) {
        await dbRun(
          `UPDATE products SET
             name = ?, brand = ?, category = ?, description = ?,
             specs_json = ?, price_cents = ?, compare_at_cents = ?,
             currency = 'EUR', stock = ?, image = ?, featured = ?,
             is_demo = 0, source = 'feed', source_url = ?, updated_at = ?
           WHERE id = ?`,
          item.name,
          item.brand,
          item.category,
          item.description,
          JSON.stringify(item.specs),
          priceCents,
          compareAtCents,
          item.stock,
          image,
          item.featured ? 1 : 0,
          sourceUrl,
          now,
          existing.id,
        );
        result.updated += 1;

        const last = await dbGet<{ price_cents: number; recorded_at: string }>(
          `SELECT price_cents, recorded_at FROM price_history
           WHERE product_id = ? ORDER BY recorded_at DESC LIMIT 1`,
          existing.id,
        );
        const lastAt = last ? new Date(last.recorded_at).getTime() : 0;
        const stale = Date.now() - lastAt > 12 * 60 * 60 * 1000;
        if (!last || last.price_cents !== priceCents || stale) {
          await dbRun(
            "INSERT INTO price_history (product_id, price_cents, recorded_at, source) VALUES (?, ?, ?, 'feed')",
            existing.id,
            priceCents,
            observedAt,
          );
          result.observations += 1;
        }
      } else {
        let slug = item.slug ?? slugify(item.name);
        if (!slug) slug = `product-${item.sku.toLowerCase()}`;
        const slugTaken = await dbGet<{ id: number }>(
          "SELECT id FROM products WHERE slug = ?",
          slug,
        );
        if (slugTaken) {
          result.skipped += 1;
          continue;
        }

        const inserted = await dbRun(
          `INSERT INTO products (
             sku, slug, name, brand, category, description, specs_json,
             price_cents, compare_at_cents, currency, stock, reserved, image,
             featured, is_demo, source, source_url, created_at, updated_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'EUR', ?, 0, ?, ?, 0, 'feed', ?, ?, ?)`,
          item.sku,
          slug,
          item.name,
          item.brand,
          item.category,
          item.description,
          JSON.stringify(item.specs),
          priceCents,
          compareAtCents,
          item.stock,
          image,
          item.featured ? 1 : 0,
          sourceUrl,
          now,
          now,
        );
        await dbRun(
          "INSERT INTO price_history (product_id, price_cents, recorded_at, source) VALUES (?, ?, ?, 'feed')",
          inserted.lastInsertRowid,
          priceCents,
          observedAt,
        );
        result.created += 1;
        result.observations += 1;
      }
    }
  });

  return result;
}
