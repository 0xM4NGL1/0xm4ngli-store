import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdminPage } from "@/lib/admin";
import { listAllProducts } from "@/lib/admin-products";
import { formatPrice } from "@/lib/format";
import { AdminShell } from "@/components/admin-shell";
import { AdminDeleteProduct } from "@/components/admin-delete-product";
import { AdminPurgeStarter } from "@/components/admin-purge-starter";
import { ProductImage } from "@/components/product-image";

export const metadata: Metadata = {
  title: "Admin products",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage() {
  await requireAdminPage();
  const products = await listAllProducts();
  const manual = products.filter((product) => product.source === "manual").length;
  const feed = products.filter((product) => product.source === "feed").length;
  const seeded = products.filter(
    (product) => product.source === "starter" || product.source === "demo",
  ).length;

  return (
    <AdminShell
      title="Products"
      description="Add real stock, real photos and real prices. This is your catalogue."
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          <span className="rounded-full border border-[#c4b5fd]/12 px-2.5 py-1">{products.length} total</span>
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/5 px-2.5 py-1 text-cyan-200">{manual} manual</span>
          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/5 px-2.5 py-1 text-emerald-200">{feed} feed</span>
          <span className="rounded-full border border-amber-300/20 bg-amber-300/5 px-2.5 py-1 text-amber-200">{seeded} seeded</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {seeded > 0 && <AdminPurgeStarter />}
          <Link href="/admin/products/new" className="neon-button inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-black uppercase tracking-wide">
            <Plus size={14} aria-hidden="true" /> Add real product
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[#c4b5fd]/18 p-10 text-center">
          <p className="text-lg font-bold text-white">No products yet</p>
          <p className="mt-2 text-sm text-slate-400">Add your first real product with actual stock and a licensed photo.</p>
          <Link href="/admin/products/new" className="neon-button mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-black uppercase tracking-wide">
            <Plus size={14} aria-hidden="true" /> Add product
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-[#c4b5fd]/12">
          <div className="hidden grid-cols-[minmax(0,2.4fr)_1fr_0.8fr_0.8fr_auto] gap-4 border-b border-[#c4b5fd]/12 bg-[#0b051d]/70 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 lg:grid">
            <span>Product</span>
            <span>Source</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Actions</span>
          </div>
          <ul className="divide-y divide-[#c4b5fd]/12">
            {products.map((product) => (
              <li key={product.id} className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,2.4fr)_1fr_0.8fr_0.8fr_auto] lg:items-center">
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-lg border border-[#c4b5fd]/12 bg-slate-900">
                    <ProductImage src={product.image} alt={product.name} sizes="64px" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{product.name}</p>
                    <p className="mt-0.5 truncate font-mono text-[10px] text-slate-500">{product.sku} · {product.slug}</p>
                    <p className="mt-0.5 text-[10px] text-slate-600">{product.category}</p>
                  </div>
                </div>
                <span className="w-fit rounded-full border border-[#c4b5fd]/12 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {product.source}
                </span>
                <span className="text-sm font-bold text-white">{formatPrice(product.priceCents, product.currency)}</span>
                <span className={product.available > 0 ? "text-sm text-emerald-200" : "text-sm text-rose-300"}>
                  {product.available}
                </span>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/products/${product.id}/edit`} className="rounded-lg border border-cyan-300/25 px-2.5 py-1.5 text-[11px] font-semibold text-cyan-100 hover:bg-cyan-300/10">
                    Edit
                  </Link>
                  <AdminDeleteProduct id={product.id} name={product.name} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AdminShell>
  );
}
