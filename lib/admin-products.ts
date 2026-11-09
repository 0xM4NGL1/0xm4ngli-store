import { z } from "zod";
import { dbAll, dbGet, dbRun, nowIso, transaction } from "./db";
import { mapProduct } from "./products";
import { categories, categoryBySlug } from "./site";
import type { Product, ProductRow } from "./types";
import { ApiError } from "./security";

const categorySlugs = categories.map((category) => category.slug) as [
  string,
  ...string[],
];

export const adminProductSchema = z.object({
  sku: z.string().trim().min(1).max(80),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes."),
  name: z.string().trim().min(2).max(180),
  brand: z.string().trim().min(1).max(80),
  category: z.enum(categorySlugs),
  description: z.string().trim().min(20).max(4000),
  specs: z.record(z.string().max(60), z.string().max(300)).default({}),
  sizes: z
    .array(z.string().trim().min(1).max(30))
    .max(30)
    .default([]),
  price: z.number().positive().max(1_000_000),
  compareAt: z.number().positive().max(1_000_000).optional(),
  stock: z.number().int().min(0).max(1_000_000),
  image: z.string().trim().max(2000).optional(),
  featured: z.boolean().default(false),
  sourceUrl: z.string().trim().max(2000).optional(),
});

export type AdminProductInput = z.infer<typeof adminProductSchema>;

function safeHttpsUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function listAllProducts(): Promise<Product[]> {
  return (
    await dbAll<ProductRow>(
      "SELECT * FROM products ORDER BY updated_at DESC, id DESC",
    )
  ).map(mapProduct);
}

async function assertUnique(input: AdminProductInput, id?: number) {
  const sku = await dbGet<{ id: number }>(
    "SELECT id FROM products WHERE sku = ? AND id <> ?",
    input.sku,
    id ?? -1,
  );
  if (sku) throw new ApiError("That SKU is already used by another product.", 409);
  const slug = await dbGet<{ id: number }>(
    "SELECT id FROM products WHERE slug = ? AND id <> ?",
    input.slug,
    id ?? -1,
  );
  if (slug) throw new ApiError("That URL slug is already used by another product.", 409);
}

export async function createManualProduct(input: AdminProductInput) {
  return transaction(async () => {
    await assertUnique(input);
    const now = nowIso();
    const fallbackImage =
      categoryBySlug[input.category as keyof typeof categoryBySlug]?.image ?? "";
    const image = safeHttpsUrl(input.image) ?? fallbackImage;
    const priceCents = Math.round(input.price * 100);
    const compareAtCents =
      input.compareAt && input.compareAt > input.price
        ? Math.round(input.compareAt * 100)
        : null;

    const result = await dbRun(
      `INSERT INTO products (
         sku, slug, name, brand, category, description, specs_json,
         sizes_json, price_cents, compare_at_cents, currency, stock, reserved,
         image, featured, is_demo, source, source_url, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'EUR', ?, 0, ?, ?, 0, 'manual', ?, ?, ?)`,
      input.sku,
      input.slug,
      input.name,
      input.brand,
      input.category,
      input.description,
      JSON.stringify(input.specs),
      JSON.stringify(input.sizes),
      priceCents,
      compareAtCents,
      input.stock,
      image,
      input.featured ? 1 : 0,
      safeHttpsUrl(input.sourceUrl),
      now,
      now,
    );

    await dbRun(
      "INSERT INTO price_history (product_id, price_cents, recorded_at, source) VALUES (?, ?, ?, 'manual')",
      result.lastInsertRowid,
      priceCents,
      now,
    );

    const product = await dbGet<ProductRow>(
      "SELECT * FROM products WHERE id = ?",
      result.lastInsertRowid,
    );
    if (!product) throw new Error("Product creation failed.");
    return mapProduct(product);
  });
}

export async function updateManualProduct(id: number, input: AdminProductInput) {
  return transaction(async () => {
    const existing = await dbGet<ProductRow>(
      "SELECT * FROM products WHERE id = ?",
      id,
    );
    if (!existing) throw new ApiError("Product not found.", 404);
    await assertUnique(input, id);

    const now = nowIso();
    const fallbackImage =
      categoryBySlug[input.category as keyof typeof categoryBySlug]?.image ?? "";
    const image = safeHttpsUrl(input.image) ?? (existing.image || fallbackImage);
    const priceCents = Math.round(input.price * 100);
    const compareAtCents =
      input.compareAt && input.compareAt > input.price
        ? Math.round(input.compareAt * 100)
        : null;

    await dbRun(
      `UPDATE products SET
         sku = ?, slug = ?, name = ?, brand = ?, category = ?, description = ?,
         specs_json = ?, sizes_json = ?, price_cents = ?, compare_at_cents = ?,
         stock = ?, image = ?, featured = ?, is_demo = 0, source = 'manual',
         source_url = ?, updated_at = ?
       WHERE id = ?`,
      input.sku,
      input.slug,
      input.name,
      input.brand,
      input.category,
      input.description,
      JSON.stringify(input.specs),
      JSON.stringify(input.sizes),
      priceCents,
      compareAtCents,
      input.stock,
      image,
      input.featured ? 1 : 0,
      safeHttpsUrl(input.sourceUrl),
      now,
      id,
    );

    if (existing.price_cents !== priceCents) {
      await dbRun(
        "INSERT INTO price_history (product_id, price_cents, recorded_at, source) VALUES (?, ?, ?, 'manual')",
        id,
        priceCents,
        now,
      );
    }

    const product = await dbGet<ProductRow>(
      "SELECT * FROM products WHERE id = ?",
      id,
    );
    if (!product) throw new Error("Product update failed.");
    return mapProduct(product);
  });
}

export async function deleteManualProduct(id: number) {
  const row = await dbGet<{ name: string }>(
    "SELECT name FROM products WHERE id = ?",
    id,
  );
  if (!row) throw new ApiError("Product not found.", 404);
  await dbRun("DELETE FROM products WHERE id = ?", id);
  return row.name;
}

export async function purgeStarterProducts() {
  const result = await dbRun(
    "DELETE FROM products WHERE source IN ('starter', 'demo') OR is_demo = 1",
  );
  return result.changes;
}
