import { cache } from "react";
import { getCurrentUserCached } from "./auth";
import { dbAll, dbGet, dbRun, nowIso } from "./db";
import { getProductsByIds } from "./products";
import type { Product } from "./types";

export async function getWishlistProducts(userId: string): Promise<Product[]> {
  const rows = await dbAll<{ product_id: number }>(
    `SELECT product_id FROM wishlist_items
     WHERE user_id = ? ORDER BY added_at DESC`,
    userId,
  );
  return getProductsByIds(rows.map((row) => row.product_id));
}

export async function getWishlistCount(userId: string) {
  const row = await dbGet<{ count: number | bigint }>(
    "SELECT COUNT(*) AS count FROM wishlist_items WHERE user_id = ?",
    userId,
  );
  return Number(row?.count ?? 0);
}

export const getWishlistProductIds = cache(async (userId: string) => {
  const rows = await dbAll<{ product_id: number }>(
    "SELECT product_id FROM wishlist_items WHERE user_id = ?",
    userId,
  );
  return new Set(rows.map((row) => row.product_id));
});

export const getViewerWishlist = cache(async () => {
  const user = await getCurrentUserCached();
  if (!user) {
    return { authenticated: false as const, productIds: new Set<number>() };
  }
  return {
    authenticated: true as const,
    productIds: await getWishlistProductIds(user.id),
  };
});

export async function isWishlisted(userId: string, productId: number) {
  return Boolean(
    await dbGet<{ found: number }>(
      "SELECT 1 AS found FROM wishlist_items WHERE user_id = ? AND product_id = ?",
      userId,
      productId,
    ),
  );
}

export async function toggleWishlist(userId: string, productId: number) {
  const existing = await isWishlisted(userId, productId);
  if (existing) {
    await dbRun(
      "DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?",
      userId,
      productId,
    );
    return false;
  }
  await dbRun(
    "INSERT INTO wishlist_items (user_id, product_id, added_at) VALUES (?, ?, ?)",
    userId,
    productId,
    nowIso(),
  );
  return true;
}
