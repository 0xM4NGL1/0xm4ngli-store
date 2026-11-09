import { dbAll, dbGet } from "./db";
import { categories, type CategorySlug } from "./site";
import type {
  DealSignal,
  DealVerdict,
  PricePoint,
  Product,
  ProductRow,
} from "./types";
import { clamp } from "./format";

export function mapProduct(row: ProductRow): Product {
  let specs: Record<string, string> = {};
  try {
    specs = JSON.parse(row.specs_json) as Record<string, string>;
  } catch {
    specs = {};
  }

  return {
    id: row.id,
    sku: row.sku,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    category: row.category,
    description: row.description,
    specs,
    priceCents: row.price_cents,
    compareAtCents: row.compare_at_cents,
    currency: row.currency,
    stock: row.stock,
    available: Math.max(0, row.stock - row.reserved),
    image: row.image,
    featured: Boolean(row.featured),
    isDemo: Boolean(row.is_demo),
    source: row.source,
    sourceUrl: row.source_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type ProductSort =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "drop";

export type ProductFilters = {
  q?: string;
  category?: string;
  brand?: string;
  minPriceCents?: number;
  maxPriceCents?: number;
  inStock?: boolean;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
};

const categorySlugs = new Set(categories.map((category) => category.slug));

export function isCategory(value: string): value is CategorySlug {
  return categorySlugs.has(value as CategorySlug);
}

export async function listProducts(filters: ProductFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = clamp(filters.pageSize ?? 12, 1, 60);
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  const q = filters.q?.trim().slice(0, 120);
  if (q) {
    clauses.push(
      "(name LIKE ? ESCAPE '\\' OR brand LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\' OR sku LIKE ? ESCAPE '\\')",
    );
    const escaped = q.replace(/[\\%_]/g, (character) => `\\${character}`);
    const term = `%${escaped}%`;
    params.push(term, term, term, term);
  }

  if (filters.category && isCategory(filters.category)) {
    clauses.push("category = ?");
    params.push(filters.category);
  }

  if (filters.brand) {
    clauses.push("brand = ?");
    params.push(filters.brand);
  }

  if (typeof filters.minPriceCents === "number") {
    clauses.push("price_cents >= ?");
    params.push(filters.minPriceCents);
  }

  if (typeof filters.maxPriceCents === "number") {
    clauses.push("price_cents <= ?");
    params.push(filters.maxPriceCents);
  }

  if (filters.inStock) {
    clauses.push("(stock - reserved) > 0");
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const totalRow = await dbGet<{ count: number | bigint }>(
    `SELECT COUNT(*) AS count FROM products ${where}`,
    ...params,
  );
  const total = Number(totalRow?.count ?? 0);

  const sort = filters.sort ?? "featured";
  const orderBy =
    sort === "price-asc"
      ? "price_cents ASC, featured DESC"
      : sort === "price-desc"
        ? "price_cents DESC, featured DESC"
        : sort === "newest"
          ? "created_at DESC, id DESC"
          : "featured DESC, updated_at DESC, id ASC";

  const paginate = <T>(rows: T[]) =>
    rows.slice((page - 1) * pageSize, page * pageSize);

  if (sort === "drop") {
    const rows = (
      await dbAll<ProductRow>(`SELECT * FROM products ${where}`, ...params)
    ).map(mapProduct);
    const scored = (
      await Promise.all(
        rows.map(async (product) => ({
          product,
          signal: await getDealSignal(product.id),
        })),
      )
    )
      .sort((a, b) => {
        if (a.signal.score !== b.signal.score) {
          return b.signal.score - a.signal.score;
        }
        return (a.signal.change30Percent ?? 0) - (b.signal.change30Percent ?? 0);
      })
      .map((entry) => entry.product);

    return {
      products: paginate(scored),
      total,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  const rows = (
    await dbAll<ProductRow>(
      `SELECT * FROM products ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      ...params,
      pageSize,
      (page - 1) * pageSize,
    )
  ).map(mapProduct);

  return {
    products: rows,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const row = await dbGet<ProductRow>(
    "SELECT * FROM products WHERE slug = ?",
    slug,
  );
  return row ? mapProduct(row) : null;
}

export async function getProductById(id: number): Promise<Product | null> {
  const row = await dbGet<ProductRow>(
    "SELECT * FROM products WHERE id = ?",
    id,
  );
  return row ? mapProduct(row) : null;
}

export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const unique = [...new Set(ids)];
  const placeholders = unique.map(() => "?").join(", ");
  const rows = (
    await dbAll<ProductRow>(
      `SELECT * FROM products WHERE id IN (${placeholders})`,
      ...unique,
    )
  ).map(mapProduct);
  const byId = new Map(rows.map((product) => [product.id, product]));
  return ids
    .map((id) => byId.get(id))
    .filter((product): product is Product => Boolean(product));
}

export async function getRelatedProducts(product: Product, limit = 4) {
  return (
    await dbAll<ProductRow>(
      `SELECT * FROM products
       WHERE category = ? AND id <> ?
       ORDER BY featured DESC, updated_at DESC
       LIMIT ?`,
      product.category,
      product.id,
      limit,
    )
  ).map(mapProduct);
}

export async function getFeaturedProducts(limit = 8) {
  return (
    await dbAll<ProductRow>(
      "SELECT * FROM products WHERE featured = 1 ORDER BY updated_at DESC LIMIT ?",
      limit,
    )
  ).map(mapProduct);
}

export async function getNewestProducts(limit = 4) {
  return (
    await dbAll<ProductRow>(
      "SELECT * FROM products ORDER BY created_at DESC, id DESC LIMIT ?",
      limit,
    )
  ).map(mapProduct);
}

export async function getPriceHistory(
  id: number,
  days = 180,
): Promise<PricePoint[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const rows = await dbAll<{ price_cents: number; recorded_at: string }>(
    `SELECT price_cents, recorded_at
     FROM price_history
     WHERE product_id = ? AND recorded_at >= ?
     ORDER BY recorded_at ASC`,
    id,
    since,
  );
  return rows.map((row) => ({
    priceCents: row.price_cents,
    recordedAt: row.recorded_at,
  }));
}

export async function getDealSignal(productId: number): Promise<DealSignal> {
  const product = await getProductById(productId);
  const current = product?.priceCents ?? 0;
  const since90 = new Date(
    Date.now() - 90 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const points = await dbAll<{ price_cents: number; recorded_at: string }>(
    `SELECT price_cents, recorded_at FROM price_history
     WHERE product_id = ? AND recorded_at >= ?
     ORDER BY recorded_at ASC`,
    productId,
    since90,
  );
  const all = await dbAll<{ price_cents: number }>(
    "SELECT price_cents FROM price_history WHERE product_id = ?",
    productId,
  );

  const observations = points.length;
  const prices = points.map((point) => point.price_cents);
  if (current > 0) prices.push(current);

  if (observations < 3 || prices.length === 0) {
    return {
      verdict: "collecting",
      score: 0,
      low90Cents: null,
      high90Cents: null,
      average90Cents: null,
      change30Percent: null,
      observations,
      lowestEverCents: all.length
        ? Math.min(...all.map((row) => row.price_cents))
        : current || null,
      isLowest90: false,
      summary:
        "Still collecting price observations. The buy signal unlocks after a few feed syncs.",
    };
  }

  const low90 = Math.min(...prices);
  const high90 = Math.max(...prices);
  const average90 = Math.round(
    prices.reduce((total, price) => total + price, 0) / prices.length,
  );
  const lowestEver = all.length
    ? Math.min(...all.map((row) => row.price_cents))
    : low90;
  const isLowest90 = current <= low90;

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const older = points
    .filter((point) => new Date(point.recorded_at).getTime() <= thirtyDaysAgo)
    .at(-1);
  const change30Percent = older
    ? (current - older.price_cents) / older.price_cents
    : null;

  const range = high90 - low90;
  const position = range === 0 ? 0.5 : (current - low90) / range;
  const dropBoost =
    change30Percent === null ? 0 : clamp(-change30Percent * 100, 0, 20);
  const score = Math.round(
    clamp((1 - position) * 75 + dropBoost + (isLowest90 ? 5 : 0), 0, 100),
  );

  let verdict: DealVerdict;
  if (isLowest90 || score >= 80) verdict = "buy";
  else if (score >= 60) verdict = "good";
  else if (score >= 40) verdict = "fair";
  else verdict = "wait";

  const summary =
    verdict === "buy"
      ? "At or near the lowest recorded price in the last 90 days."
      : verdict === "good"
        ? "Below the 90-day average — a strong time to buy."
        : verdict === "fair"
          ? "Close to the typical 90-day price. Not a bad time, not the best."
          : "Above the 90-day average. Waiting may pay off.";

  return {
    verdict,
    score,
    low90Cents: low90,
    high90Cents: high90,
    average90Cents: average90,
    change30Percent,
    observations,
    lowestEverCents: lowestEver,
    isLowest90,
    summary,
  };
}

export async function getBiggestDrops(limit = 8) {
  const products = (
    await dbAll<ProductRow>("SELECT * FROM products")
  ).map(mapProduct);
  const scored = await Promise.all(
    products.map(async (product) => ({
      product,
      signal: await getDealSignal(product.id),
    })),
  );
  return scored
    .filter(
      (entry) =>
        entry.signal.observations >= 3 &&
        entry.signal.change30Percent !== null &&
        entry.signal.change30Percent < -0.01,
    )
    .sort(
      (a, b) =>
        (a.signal.change30Percent ?? 0) - (b.signal.change30Percent ?? 0),
    )
    .slice(0, limit);
}

export async function getBrands(category?: string) {
  const rows =
    category && isCategory(category)
      ? await dbAll<{ brand: string }>(
          "SELECT DISTINCT brand FROM products WHERE category = ? ORDER BY brand",
          category,
        )
      : await dbAll<{ brand: string }>(
          "SELECT DISTINCT brand FROM products ORDER BY brand",
        );
  return rows.map((row) => row.brand);
}

export async function getCategoryCounts() {
  const rows = await dbAll<{ category: string; count: number | bigint }>(
    "SELECT category, COUNT(*) AS count FROM products GROUP BY category",
  );
  return Object.fromEntries(
    rows.map((row) => [row.category, Number(row.count)]),
  ) as Record<string, number>;
}

export async function getCatalogPriceRange() {
  const row = await dbGet<{ min: number | null; max: number | null }>(
    "SELECT MIN(price_cents) AS min, MAX(price_cents) AS max FROM products",
  );
  return {
    minCents: Number(row?.min ?? 0),
    maxCents: Number(row?.max ?? 0),
  };
}

export async function getTotalProductCount() {
  const row = await dbGet<{ count: number | bigint }>(
    "SELECT COUNT(*) AS count FROM products",
  );
  return Number(row?.count ?? 0);
}

export async function getPriceObservationCount() {
  const row = await dbGet<{ count: number | bigint }>(
    "SELECT COUNT(*) AS count FROM price_history",
  );
  return Number(row?.count ?? 0);
}

export async function getIndexableProductSlugs() {
  return dbAll<{ slug: string; updated_at: string }>(
    "SELECT slug, updated_at FROM products WHERE is_demo = 0 ORDER BY updated_at DESC",
  );
}
