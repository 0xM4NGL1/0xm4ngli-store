import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Package } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/orders";
import { formatDateTime, formatPrice, formatShippingAddress } from "@/lib/format";

export const metadata: Metadata = {
  title: "Your orders",
  robots: { index: false, follow: false },
};

const statusStyles: Record<string, string> = {
  paid: "bg-emerald-300/10 text-emerald-200",
  pending: "bg-cyan-300/10 text-cyan-200",
  cancelled: "bg-rose-300/10 text-rose-200",
  failed: "bg-rose-300/10 text-rose-200",
  refunded: "bg-amber-300/10 text-amber-200",
};

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/orders");
  const orders = await getOrdersForUser(user.id);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
            Purchase history
          </p>
          <h2 className="mt-1 text-2xl font-black text-white">Your orders</h2>
        </div>
        <p className="text-xs text-slate-500">{orders.length} total</p>
      </div>

      {orders.length === 0 ? (
        <div className="mt-6 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 p-8 text-center">
          <Package size={34} className="text-slate-600" aria-hidden="true" />
          <h3 className="mt-4 text-lg font-bold text-white">No orders yet</h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
            When you buy something, the order and its items will appear here.
          </p>
          <Link
            href="/shop"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-slate-950 hover:bg-fuchsia-300"
          >
            Find something <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => {
            const address = formatShippingAddress(order.shipping);
            return (
              <details
                key={order.id}
                className="neon-card group overflow-hidden rounded-2xl bg-[#0a0d19]"
              >
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-mono text-xs text-slate-300">{order.id}</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {formatDateTime(order.createdAt)} ·{" "}
                      {order.items.length > 0
                        ? `${order.items.length} ${order.items.length === 1 ? "item" : "items"}`
                        : "Support contribution"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusStyles[order.status] ?? "bg-white/5 text-slate-300"}`}>
                      {order.status === "pending" && order.paymentMethod === "bank_transfer"
                        ? "Awaiting transfer"
                        : order.status}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {formatPrice(order.totalCents, order.currency)}
                    </span>
                    <ArrowRight
                      size={15}
                      className="text-slate-600 transition group-open:rotate-90"
                      aria-hidden="true"
                    />
                  </div>
                </summary>
                <div className="border-t border-white/10 p-4">
                  <ul className="space-y-2">
                    {order.items.length === 0 && (
                      <li className="flex justify-between gap-3 text-sm">
                        <span className="text-slate-300">Voluntary support</span>
                        <span className="font-semibold text-fuchsia-200">
                          {formatPrice(order.supportCents, order.currency)}
                        </span>
                      </li>
                    )}
                    {order.items.map((item) => (
                      <li key={item.sku} className="flex justify-between gap-3 text-sm">
                        <span className="text-slate-300">
                          <span className="text-slate-500">{item.quantity} × </span>
                          {item.name}
                        </span>
                        <span className="font-semibold text-white">
                          {formatPrice(item.unitPriceCents * item.quantity, order.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {address.length > 0 && (
                    <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs leading-5 text-slate-400">
                      <p className="font-semibold text-slate-300">Shipping to</p>
                      <p className="mt-1">{address.join(", ")}</p>
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
                    <Link
                      href={`/checkout/success?token=${encodeURIComponent(order.publicToken)}`}
                      className="font-semibold text-cyan-200 hover:text-cyan-100"
                    >
                      Open order page
                    </Link>
                    <Link href="/legal/shipping" className="text-slate-400 hover:text-slate-200">
                      Returns
                    </Link>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
