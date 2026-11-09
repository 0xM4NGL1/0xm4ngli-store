import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { dbAll, dbGet, dbRun, nowIso } from "./db";
import { getCurrentUser } from "./auth";
import { getProductById, getProductsByIds } from "./products";
import { site } from "./site";
import type { CartLine, CartSummary, Product } from "./types";
import { ApiError } from "./security";

const CART_COOKIE = "m4_cart";
const MAX_LINES = 20;
const MAX_QUANTITY = 10;

type RawLine = { productId: number; quantity: number };

function secret() {
  const value =
    process.env.CART_SECRET ??
    process.env.SESSION_SECRET ??
    "development-only-cart-secret-change-me";
  return value;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function encodeLines(lines: RawLine[]) {
  const payload = Buffer.from(JSON.stringify(lines), "utf8").toString(
    "base64url",
  );
  return `${payload}.${sign(payload)}`;
}

function decodeLines(value: string): RawLine[] {
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return [];
  const expected = sign(payload);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return [];

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (line): line is RawLine =>
          typeof line === "object" &&
          line !== null &&
          Number.isInteger((line as RawLine).productId) &&
          Number.isInteger((line as RawLine).quantity),
      )
      .map((line) => ({
        productId: line.productId,
        quantity: Math.min(MAX_QUANTITY, Math.max(1, line.quantity)),
      }))
      .slice(0, MAX_LINES);
  } catch {
    return [];
  }
}

async function readGuestLines(): Promise<RawLine[]> {
  const jar = await cookies();
  const value = jar.get(CART_COOKIE)?.value;
  return value ? decodeLines(value) : [];
}

async function writeGuestLines(lines: RawLine[]) {
  const jar = await cookies();
  const compact = lines
    .filter((line) => line.quantity > 0)
    .slice(0, MAX_LINES);
  if (compact.length === 0) {
    jar.set(CART_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    return;
  }
  jar.set(CART_COOKIE, encodeLines(compact), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
}

async function readUserLines(userId: string): Promise<RawLine[]> {
  const rows = await dbAll<{ product_id: number; quantity: number }>(
    `SELECT product_id, quantity FROM cart_items
     WHERE user_id = ? ORDER BY added_at DESC`,
    userId,
  );
  return rows.map((row) => ({ productId: row.product_id, quantity: row.quantity }));
}

export async function readCartLines(): Promise<RawLine[]> {
  const user = await getCurrentUser();
  return user ? readUserLines(user.id) : readGuestLines();
}

export async function getCartSummary(): Promise<CartSummary> {
  const lines = await readCartLines();
  const products = await getProductsByIds(lines.map((line) => line.productId));
  const byId = new Map(products.map((product) => [product.id, product]));

  const resolved = lines
    .map((line) => {
      const product = byId.get(line.productId);
      return product
        ? { product, quantity: Math.min(line.quantity, MAX_QUANTITY) }
        : null;
    })
    .filter((line): line is CartLine => Boolean(line));

  const itemCount = resolved.reduce((total, line) => total + line.quantity, 0);
  const subtotalCents = resolved.reduce(
    (total, line) => total + line.product.priceCents * line.quantity,
    0,
  );
  const shippingCents =
    subtotalCents === 0 || subtotalCents >= site.freeShippingThresholdCents
      ? 0
      : site.flatShippingCents;

  return {
    lines: resolved,
    itemCount,
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
    freeShippingRemainingCents: Math.max(
      0,
      site.freeShippingThresholdCents - subtotalCents,
    ),
  };
}

function validate(product: Product, quantity: number) {
  if (quantity < 1 || quantity > MAX_QUANTITY) {
    throw new ApiError(`Choose a quantity between 1 and ${MAX_QUANTITY}.`, 422);
  }
  if (product.available < quantity) {
    throw new ApiError(
      product.available === 0
        ? "This product is currently unavailable."
        : `Only ${product.available} left in stock.`,
      409,
    );
  }
}

export async function addCartItem(productId: number, quantity = 1) {
  const product = await getProductById(productId);
  if (!product) throw new ApiError("Product not found.", 404);
  const user = await getCurrentUser();

  if (user) {
    const existing = await dbGet<{ quantity: number }>(
      "SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?",
      user.id,
      productId,
    );
    const nextQuantity = Math.min(
      MAX_QUANTITY,
      (existing?.quantity ?? 0) + quantity,
    );
    validate(product, nextQuantity);
    await dbRun(
      `INSERT INTO cart_items (user_id, product_id, quantity, added_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, product_id)
       DO UPDATE SET quantity = excluded.quantity`,
      user.id,
      productId,
      nextQuantity,
      nowIso(),
    );
  } else {
    const lines = await readGuestLines();
    const existing = lines.find((line) => line.productId === productId);
    const nextQuantity = Math.min(
      MAX_QUANTITY,
      (existing?.quantity ?? 0) + quantity,
    );
    validate(product, nextQuantity);
    if (existing) existing.quantity = nextQuantity;
    else if (lines.length >= MAX_LINES) {
      throw new ApiError("Your cart is full.", 409);
    } else {
      lines.unshift({ productId, quantity: nextQuantity });
    }
    await writeGuestLines(lines);
  }

  return getCartCount();
}

export async function updateCartItem(productId: number, quantity: number) {
  const user = await getCurrentUser();
  if (quantity <= 0) return removeCartItem(productId);

  const product = await getProductById(productId);
  if (!product) throw new ApiError("Product not found.", 404);
  validate(product, quantity);

  if (user) {
    await dbRun(
      "UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?",
      quantity,
      user.id,
      productId,
    );
  } else {
    const lines = await readGuestLines();
    const existing = lines.find((line) => line.productId === productId);
    if (!existing) throw new ApiError("This item is not in your cart.", 404);
    existing.quantity = quantity;
    await writeGuestLines(lines);
  }

  return getCartCount();
}

export async function removeCartItem(productId: number) {
  const user = await getCurrentUser();
  if (user) {
    await dbRun(
      "DELETE FROM cart_items WHERE user_id = ? AND product_id = ?",
      user.id,
      productId,
    );
  } else {
    const lines = (await readGuestLines()).filter(
      (line) => line.productId !== productId,
    );
    await writeGuestLines(lines);
  }
  return getCartCount();
}

export async function clearCart() {
  const user = await getCurrentUser();
  if (user) {
    await dbRun("DELETE FROM cart_items WHERE user_id = ?", user.id);
  } else {
    await writeGuestLines([]);
  }
}

export async function getCartCount() {
  const lines = await readCartLines();
  return lines.reduce((total, line) => total + line.quantity, 0);
}

export async function mergeGuestCartIntoAccount(userId: string) {
  const guestLines = await readGuestLines();
  if (guestLines.length === 0) return;
  const products = await getProductsByIds(guestLines.map((line) => line.productId));
  const byId = new Map(products.map((product) => [product.id, product]));

  for (const line of guestLines) {
    const product = byId.get(line.productId);
    if (!product || product.available < 1) continue;
    const existing = await dbGet<{ quantity: number }>(
      "SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?",
      userId,
      line.productId,
    );
    const quantity = Math.min(
      MAX_QUANTITY,
      product.available,
      (existing?.quantity ?? 0) + line.quantity,
    );
    if (quantity < 1) continue;
    await dbRun(
      `INSERT INTO cart_items (user_id, product_id, quantity, added_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, product_id) DO UPDATE SET quantity = excluded.quantity`,
      userId,
      line.productId,
      quantity,
      nowIso(),
    );
  }

  await writeGuestLines([]);
}

export function validateCartLineQuantity(quantity: number) {
  return Number.isInteger(quantity) && quantity >= 1 && quantity <= MAX_QUANTITY;
}

export { MAX_QUANTITY };
