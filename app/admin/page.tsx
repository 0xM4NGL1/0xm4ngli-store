import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Package,
  ReceiptText,
  TrendingUp,
} from "lucide-react";
import { requireAdminPage } from "@/lib/admin";
import { getOrdersByStatus } from "@/lib/orders";
import {
  getPriceObservationCount,
  getTotalProductCount,
} from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { AdminShell } from "@/components/admin-shell";

export const metadata: Metadata = {
  title: "Admin overview",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  await requireAdminPage();
  const [productCount, observationCount, pending, paid] = await Promise.all([
    getTotalProductCount(),
    getPriceObservationCount(),
    getOrdersByStatus("pending", 200),
    getOrdersByStatus("paid", 200),
  ]);
  const pendingTotal = pending.reduce((sum, order) => sum + order.totalCents, 0);
  const paidTotal = paid.reduce((sum, order) => sum + order.totalCents, 0);

  return (
    <AdminShell
      title="Store overview"
      description="Real orders, real stock and real bank transfers. No card data."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Package, label: "Products", value: String(productCount), href: "/admin/products" },
          { icon: Clock, label: "Pending transfers", value: String(pending.length), href: "/admin/orders" },
          { icon: ReceiptText, label: "Paid orders", value: String(paid.length), href: "/admin/orders" },
          { icon: TrendingUp, label: "Price observations", value: String(observationCount), href: "/admin/products" },
        ].map((item) => (
          <Link key={item.label} href={item.href} className="neon-card rounded-2xl bg-[#0b051d] p-5 transition hover:brightness-110">
            <item.icon size={18} className="text-cyan-300" aria-hidden="true" />
            <p className="neon-text mt-4 text-3xl font-black text-white">{item.value}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="neon-card rounded-2xl bg-[#0b051d] p-5">
          <h2 className="text-sm font-bold text-white">Money waiting</h2>
          <p className="mt-2 text-2xl font-black text-cyan-200">{formatPrice(pendingTotal)}</p>
          <p className="mt-1 text-xs text-slate-500">Across {pending.length} pending bank transfers.</p>
          <Link href="/admin/orders" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-cyan-200 hover:text-white">
            Match transfers <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>
        <div className="neon-card rounded-2xl bg-[#0b051d] p-5">
          <h2 className="text-sm font-bold text-white">Paid to date</h2>
          <p className="mt-2 text-2xl font-black text-emerald-200">{formatPrice(paidTotal)}</p>
          <p className="mt-1 text-xs text-slate-500">Only orders you marked paid are counted.</p>
          <Link href="/admin/products" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-cyan-200 hover:text-white">
            Manage products <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="neon-outline mt-4 rounded-2xl p-4 text-xs leading-6 text-slate-400">
        <p className="font-semibold text-slate-200">Operating checklist</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Add your real products under Products and set the exact stock.</li>
          <li>Remove the starter catalogue when your own products are in place.</li>
          <li>Check your bank statement daily and match the order reference.</li>
          <li>Set <code>ADMIN_TOKEN</code>, <code>CART_SECRET</code> and <code>CRON_SECRET</code> in the deployment.</li>
        </ul>
      </div>
    </AdminShell>
  );
}
