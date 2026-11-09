import { getCurrentUser } from "@/lib/auth";
import { getCartSummary } from "@/lib/cart";
import { getOrdersForUser } from "@/lib/orders";
import { getWishlistProducts } from "@/lib/wishlist";
import { dbGet } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  const [cart, orders, wishlist] = await Promise.all([
    getCartSummary(),
    getOrdersForUser(user.id),
    getWishlistProducts(user.id),
  ]);
  const newsletter = await dbGet<{
    status: string;
    consent_version: string;
    created_at: string;
    confirmed_at: string | null;
    unsubscribed_at: string | null;
  }>(
    `SELECT status, consent_version, created_at, confirmed_at, unsubscribed_at
     FROM newsletter_subscribers WHERE email = ?`,
    user.email,
  );

  const payload = {
    exportedAt: new Date().toISOString(),
    dataController: {
      name: process.env.LEGAL_NAME ?? "0xm4ngli",
      contact: process.env.CONTACT_EMAIL ?? "hello@0xm4ngli.store",
      note: "This export contains the personal data linked to your account. Order records may be retained after account deletion where tax law requires it.",
    },
    account: {
      name: user.name,
      email: user.email,
      marketingConsent: user.marketingConsent,
      createdAt: user.createdAt,
    },
    cart: cart.lines.map((line) => ({
      product: line.product.name,
      sku: line.product.sku,
      quantity: line.quantity,
      unitPriceCents: line.product.priceCents,
    })),
    wishlist: wishlist.map((product) => ({
      product: product.name,
      sku: product.sku,
      slug: product.slug,
    })),
    orders: orders.map((order) => ({
      id: order.id,
      status: order.status,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      currency: order.currency,
      subtotalCents: order.subtotalCents,
      shippingCents: order.shippingCents,
      totalCents: order.totalCents,
      items: order.items,
      shipping: order.shipping,
    })),
    newsletter: newsletter ?? null,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="0xm4ngli-data-export-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
