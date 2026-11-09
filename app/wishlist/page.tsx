import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Heart } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getWishlistProducts } from "@/lib/wishlist";
import { ProductCard } from "@/components/product-card";

export const metadata: Metadata = {
  title: "Your wishlist",
  robots: { index: false, follow: false },
};

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/wishlist");
  const products = await getWishlistProducts(user.id);

  return (
    <div className="container-m4 py-10 md:py-14">
      <nav aria-label="Breadcrumb" className="mb-5 text-xs text-slate-500">
        <Link href="/" className="hover:text-cyan-200">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/account" className="hover:text-cyan-200">Account</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-300">Wishlist</span>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-fuchsia-300">
            Saved for later
          </p>
          <h1 className="neon-text mt-2 text-4xl font-black tracking-[-0.05em] text-white">
            Your wishlist
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {products.length} saved {products.length === 1 ? "product" : "products"}. Each
            card keeps its live buy signal.
          </p>
        </div>
        <Link
          href="/shop?sort=drop"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-cyan-200 hover:text-white"
        >
          See current price drops <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="mt-8 flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 p-8 text-center">
          <Heart size={34} className="text-slate-600" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-bold text-white">Nothing saved yet</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
            Tap the heart on a product to keep it here. You can compare its price
            history before deciding.
          </p>
          <Link
            href="/shop"
            className="mt-5 rounded-lg bg-cyan-300 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-slate-950 hover:bg-fuchsia-300"
          >
            Browse the catalogue
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
