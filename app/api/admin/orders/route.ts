import { getOrdersByStatus } from "@/lib/orders";
import { adminConfigured, isAdminAuthorized } from "@/lib/admin";
import type { OrderStatus } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!adminConfigured()) {
    return Response.json({ error: "Admin API is disabled." }, { status: 503 });
  }
  if (!await isAdminAuthorized(request)) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }

  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status") ?? "pending";
  const allowed: OrderStatus[] = ["pending", "paid", "cancelled", "failed", "refunded"];
  const status = allowed.includes(statusParam as OrderStatus)
    ? (statusParam as OrderStatus)
    : "pending";

  const orders = await getOrdersByStatus(status, 200);
  return Response.json(
    {
      status,
      count: orders.length,
      orders: orders.map((order) => ({
        id: order.id,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentReference: order.paymentReference,
        email: order.email,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
        totalCents: order.totalCents,
        supportCents: order.supportCents,
        currency: order.currency,
        items: order.items,
        shipping: order.shipping,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
