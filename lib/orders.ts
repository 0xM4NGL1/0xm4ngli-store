import { dbAll, dbGet, dbRun, nowIso, transaction } from "./db";
import { getProductById } from "./products";
import { site } from "./site";
import type {
  Order,
  OrderItemSnapshot,
  OrderStatus,
  PaymentMethod,
} from "./types";
import { newId, newToken } from "./auth";
import { ApiError } from "./security";

type OrderRow = {
  id: string;
  public_token: string;
  user_id: string | null;
  email: string | null;
  status: OrderStatus;
  subtotal_cents: number;
  shipping_cents: number;
  support_cents: number;
  total_cents: number;
  currency: string;
  items_json: string;
  shipping_json: string | null;
  payment_method: PaymentMethod;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
};

type CartSnapshotLine = { productId: number; quantity: number };

export type ShippingAddress = {
  name: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    postal_code: string;
    country: string;
  };
};

function mapOrder(row: OrderRow): Order {
  let items: OrderItemSnapshot[] = [];
  let shipping: Record<string, unknown> | null = null;
  try {
    items = JSON.parse(row.items_json) as OrderItemSnapshot[];
  } catch {
    items = [];
  }
  try {
    shipping = row.shipping_json
      ? (JSON.parse(row.shipping_json) as Record<string, unknown>)
      : null;
  } catch {
    shipping = null;
  }
  return {
    id: row.id,
    publicToken: row.public_token,
    userId: row.user_id,
    email: row.email,
    status: row.status,
    subtotalCents: row.subtotal_cents,
    shippingCents: row.shipping_cents,
    supportCents: row.support_cents,
    totalCents: row.total_cents,
    currency: row.currency,
    items,
    shipping,
    paymentMethod: row.payment_method,
    paymentReference: row.payment_reference,
    createdAt: row.created_at,
    paidAt: row.paid_at,
  };
}

export async function releaseExpiredOrders() {
  const twoHoursAgo = new Date(
    Date.now() - 2 * 60 * 60 * 1000,
  ).toISOString();
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const rows = await dbAll<{ id: string }>(
    `SELECT id FROM orders WHERE status = 'pending' AND (
       (payment_method <> 'bank_transfer' AND created_at < ?)
       OR (payment_method = 'bank_transfer' AND created_at < ?)
     )`,
    twoHoursAgo,
    sevenDaysAgo,
  );
  for (const row of rows) await cancelPendingOrder(row.id);
}

export async function createPendingOrder(input: {
  userId: string | null;
  email: string | null;
  lines: CartSnapshotLine[];
  shippingCents: number;
  supportCents?: number;
  paymentMethod?: PaymentMethod;
  shipping?: ShippingAddress | null;
}) {
  if (input.lines.length === 0) {
    throw new ApiError("Your cart is empty.", 409);
  }
  const supportCents = Math.max(0, Math.round(input.supportCents ?? 0));
  const paymentMethod = input.paymentMethod ?? "bank_transfer";

  return transaction(async () => {
    const items: OrderItemSnapshot[] = [];
    let subtotal = 0;

    for (const line of input.lines) {
      const product = await getProductById(line.productId);
      if (!product) throw new ApiError("A product in your cart is unavailable.", 409);
      if (line.quantity < 1 || line.quantity > 10) {
        throw new ApiError("Invalid quantity.", 422);
      }
      if (product.available < line.quantity) {
        throw new ApiError(
          `${product.name} only has ${product.available} left in stock.`,
          409,
        );
      }
      subtotal += product.priceCents * line.quantity;
      items.push({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        sku: product.sku,
        unitPriceCents: product.priceCents,
        quantity: line.quantity,
      });
    }

    const shipping =
      subtotal >= site.freeShippingThresholdCents ? 0 : input.shippingCents;
    const total = subtotal + shipping + supportCents;
    const id = newId("ord");
    const token = newToken();
    const createdAt = nowIso();

    await dbRun(
      `INSERT INTO orders
        (id, public_token, user_id, email, status, subtotal_cents,
         shipping_cents, support_cents, total_cents, currency, items_json,
         shipping_json, payment_method, payment_reference, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      token,
      input.userId,
      input.email,
      subtotal,
      shipping,
      supportCents,
      total,
      site.currency,
      JSON.stringify(items),
      input.shipping ? JSON.stringify(input.shipping) : null,
      paymentMethod,
      paymentMethod === "bank_transfer" ? id : null,
      createdAt,
      createdAt,
    );

    for (const item of items) {
      await dbRun(
        `UPDATE products
         SET reserved = reserved + ?, updated_at = ?
         WHERE id = ? AND stock - reserved >= ?`,
        item.quantity,
        createdAt,
        item.productId,
        item.quantity,
      );
    }

    const row = await dbGet<OrderRow>("SELECT * FROM orders WHERE id = ?", id);
    if (!row) throw new Error("Order creation failed.");
    return mapOrder(row);
  });
}

export async function getOrderByToken(token: string) {
  const row = await dbGet<OrderRow>(
    "SELECT * FROM orders WHERE public_token = ?",
    token,
  );
  return row ? mapOrder(row) : null;
}

export async function getOrderById(id: string) {
  const row = await dbGet<OrderRow>("SELECT * FROM orders WHERE id = ?", id);
  return row ? mapOrder(row) : null;
}

export async function getOrdersForUser(userId: string) {
  return (
    await dbAll<OrderRow>(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      userId,
    )
  ).map(mapOrder);
}

export async function createSupportOrder(input: {
  userId: string | null;
  email: string | null;
  amountCents: number;
}) {
  const amount = Math.max(1, Math.min(50_000, Math.round(input.amountCents)));
  return transaction(async () => {
    const id = newId("sup");
    const token = newToken();
    const createdAt = nowIso();
    await dbRun(
      `INSERT INTO orders
        (id, public_token, user_id, email, status, subtotal_cents,
         shipping_cents, support_cents, total_cents, currency, items_json,
         shipping_json, payment_method, payment_reference, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'pending', 0, 0, ?, ?, ?, '[]', NULL,
               'bank_transfer', ?, ?, ?)`,
      id,
      token,
      input.userId,
      input.email,
      amount,
      amount,
      site.currency,
      id,
      createdAt,
      createdAt,
    );
    const row = await dbGet<OrderRow>("SELECT * FROM orders WHERE id = ?", id);
    if (!row) throw new Error("Support order creation failed.");
    return mapOrder(row);
  });
}

export async function getOrdersByStatus(status: OrderStatus, limit = 100) {
  return (
    await dbAll<OrderRow>(
      "SELECT * FROM orders WHERE status = ? ORDER BY created_at ASC LIMIT ?",
      status,
      limit,
    )
  ).map(mapOrder);
}

export async function markOrderPaid(
  orderId: string,
  details: {
    email?: string | null;
    shipping?: Record<string, unknown> | null;
    paymentReference?: string | null;
  } = {},
) {
  return transaction(async () => {
    const row = await dbGet<OrderRow>("SELECT * FROM orders WHERE id = ?", orderId);
    if (!row) throw new ApiError("Order not found.", 404);
    if (row.status === "paid") return mapOrder(row);
    if (row.status !== "pending") {
      throw new ApiError("Order is no longer payable.", 409);
    }

    const items = JSON.parse(row.items_json) as OrderItemSnapshot[];
    const paidAt = nowIso();

    for (const item of items) {
      await dbRun(
        `UPDATE products
         SET stock = MAX(0, stock - ?),
             reserved = MAX(0, reserved - ?),
             updated_at = ?
         WHERE id = ?`,
        item.quantity,
        item.quantity,
        paidAt,
        item.productId,
      );
    }

    await dbRun(
      `UPDATE orders
       SET status = 'paid', email = COALESCE(?, email), shipping_json = ?,
           payment_reference = COALESCE(?, payment_reference),
           paid_at = ?, updated_at = ?
       WHERE id = ?`,
      details.email ?? null,
      details.shipping ? JSON.stringify(details.shipping) : row.shipping_json,
      details.paymentReference ?? null,
      paidAt,
      paidAt,
      orderId,
    );

    if (row.user_id) {
      await dbRun("DELETE FROM cart_items WHERE user_id = ?", row.user_id);
    }

    const updated = await dbGet<OrderRow>(
      "SELECT * FROM orders WHERE id = ?",
      orderId,
    );
    if (!updated) throw new Error("Order update failed.");
    return mapOrder(updated);
  });
}

export async function cancelPendingOrder(orderId: string) {
  return transaction(async () => {
    const row = await dbGet<OrderRow>("SELECT * FROM orders WHERE id = ?", orderId);
    if (!row || row.status !== "pending") return false;
    const items = JSON.parse(row.items_json) as OrderItemSnapshot[];
    const now = nowIso();
    for (const item of items) {
      await dbRun(
        `UPDATE products
         SET reserved = MAX(0, reserved - ?), updated_at = ?
         WHERE id = ?`,
        item.quantity,
        now,
        item.productId,
      );
    }
    await dbRun(
      "UPDATE orders SET status = 'cancelled', updated_at = ? WHERE id = ?",
      now,
      orderId,
    );
    return true;
  });
}

export async function markOrderFailed(orderId: string) {
  await dbRun(
    "UPDATE orders SET status = 'failed', updated_at = ? WHERE id = ? AND status = 'pending'",
    nowIso(),
    orderId,
  );
}
