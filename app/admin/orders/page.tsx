import type { Metadata } from "next";
import Link from "next/link";
import { Clock, PackageCheck } from "lucide-react";
import { requireAdminPage } from "@/lib/admin";
import { getOrdersByStatus } from "@/lib/orders";
import {
  formatDateTime,
  formatPrice,
  formatShippingAddress,
} from "@/lib/format";
import { AdminShell } from "@/components/admin-shell";
import { AdminOrderActions } from "@/components/admin-order-actions";

export const metadata: Metadata = {
  title: "Admin orders",
  robots: { index: false, follow: false },
};

function OrderItems({ items }: { items: { sku: string; name: string; quantity: number; unitPriceCents: number }[] }) {
  if (items.length === 0) return <p className="text-xs text-fuchsia-200">Voluntary support contribution</p>;
  return (
    <ul className="space-y-1 text-xs">
      {items.map((item) => (
        <li key={item.sku} className="flex justify-between gap-3">
          <span className="text-slate-400">{item.quantity} × {item.name}</span>
          <span className="font-mono text-slate-300">{formatPrice(item.unitPriceCents * item.quantity)}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function AdminOrdersPage() {
  await requireAdminPage();
  const [pending, paid] = await Promise.all([
    getOrdersByStatus("pending", 200),
    getOrdersByStatus("paid", 100),
  ]);

  return (
    <AdminShell
      title="Orders and bank transfers"
      description="Match the reference on your bank statement, then mark the order paid."
    >
      <section>
        <h2 className="flex items-center gap-2 text-lg font-black text-white">
          <Clock size={18} className="text-cyan-300" aria-hidden="true" />
          Pending transfers
          <span className="rounded-full bg-cyan-300/10 px-2 py-0.5 text-[10px] text-cyan-200">{pending.length}</span>
        </h2>
        {pending.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-white/15 p-6 text-sm text-slate-500">
            No pending bank transfers. New orders appear here immediately.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {pending.map((order) => (
              <article key={order.id} className="neon-card rounded-2xl bg-[#0a0d19] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-slate-300">{order.id}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{formatDateTime(order.createdAt)} · {order.email ?? "no email"}</p>
                    <p className="mt-1 text-[11px] text-slate-500">Reference: <span className="font-mono text-cyan-200">{order.paymentReference ?? order.id}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-white">{formatPrice(order.totalCents, order.currency)}</p>
                    {order.supportCents > 0 && <p className="text-[10px] text-fuchsia-200">incl. {formatPrice(order.supportCents, order.currency)} support</p>}
                  </div>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <OrderItems items={order.items} />
                  {formatShippingAddress(order.shipping).length > 0 && (
                    <p className="text-[11px] leading-5 text-slate-500">
                      <span className="font-semibold text-slate-400">Ship to:</span>{" "}
                      {formatShippingAddress(order.shipping).join(", ")}
                    </p>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
                  <Link href={`/checkout/success?token=${encodeURIComponent(order.publicToken)}`} className="text-[11px] font-semibold text-cyan-200 hover:text-white">
                    Open order page
                  </Link>
                  <AdminOrderActions orderId={order.id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-black text-white">
          <PackageCheck size={18} className="text-emerald-300" aria-hidden="true" />
          Paid
          <span className="rounded-full bg-emerald-300/10 px-2 py-0.5 text-[10px] text-emerald-200">{paid.length}</span>
        </h2>
        {paid.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-white/15 p-6 text-sm text-slate-500">
            No paid orders yet. Mark a matched transfer as paid above.
          </p>
        ) : (
          <div className="mt-3 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10">
            {paid.slice(0, 30).map((order) => (
              <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-mono text-xs text-slate-300">{order.id}</p>
                  <p className="text-[10px] text-slate-500">{order.paidAt ? formatDateTime(order.paidAt) : formatDateTime(order.createdAt)} · {order.email ?? "no email"}</p>
                </div>
                <p className="text-sm font-bold text-emerald-200">{formatPrice(order.totalCents, order.currency)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminShell>
  );
}
