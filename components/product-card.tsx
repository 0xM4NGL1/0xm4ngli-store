import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { categoryBySlug } from "@/lib/site";
import { getDealSignal } from "@/lib/products";
import { ProductImage } from "./product-image";
import { DealBadge, DropPill } from "./deal-badge";
import { AddToCartButton } from "./add-to-cart-button";

export async function ProductCard({ product }: { product: Product }) {
  const signal = await getDealSignal(product.id);
  const category = categoryBySlug[product.category];
  const discount =
    product.compareAtCents && product.compareAtCents > product.priceCents
      ? (product.compareAtCents - product.priceCents) / product.compareAtCents
      : null;

  return (
    <article className="card-hover group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a0d19]">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-slate-900"
        aria-label={`View ${product.name}`}
      >
        <ProductImage
          src={product.image}
          alt={product.name}
          className="transition duration-700 ease-out group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080a14] via-transparent to-transparent opacity-80" />
        <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-[#05060b]/70 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-200 backdrop-blur">
          {category?.name ?? product.category}
        </span>
        <span className="absolute right-3 top-3">
          <DealBadge signal={signal} />
        </span>
        <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-[#05060b]/70 text-slate-300 opacity-0 transition group-hover:opacity-100">
          <ArrowUpRight size={15} aria-hidden="true" />
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
            {product.brand}
          </p>
          <DropPill signal={signal} />
        </div>
        <h3 className="mt-1.5 text-[15px] font-bold leading-snug text-slate-100 transition group-hover:text-cyan-100">
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-lg font-black tracking-tight text-white">
                {formatPrice(product.priceCents, product.currency)}
              </p>
              <div className="flex items-center gap-2">
                {product.compareAtCents &&
                  product.compareAtCents > product.priceCents && (
                    <span className="text-xs text-slate-500 line-through">
                      {formatPrice(product.compareAtCents, product.currency)}
                    </span>
                  )}
                {discount && (
                  <span className="font-mono text-[10px] font-bold text-emerald-300">
                    −{Math.round(discount * 100)}%
                  </span>
                )}
              </div>
            </div>
            <div className="w-28 shrink-0">
              <AddToCartButton
                productId={product.id}
                available={product.available}
                variant="compact"
                label={product.available > 0 ? "Add" : "Sold out"}
              />
            </div>
          </div>
          <p className="mt-3 flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
            <span
              className={
                signal.verdict === "buy"
                  ? "h-1.5 w-1.5 rounded-full bg-emerald-300"
                  : signal.verdict === "good"
                    ? "h-1.5 w-1.5 rounded-full bg-cyan-300"
                    : signal.verdict === "fair"
                      ? "h-1.5 w-1.5 rounded-full bg-amber-300"
                      : signal.verdict === "wait"
                        ? "h-1.5 w-1.5 rounded-full bg-rose-300"
                        : "h-1.5 w-1.5 rounded-full bg-slate-500"
              }
              aria-hidden="true"
            />
            {signal.summary}
          </p>
        </div>
      </div>
    </article>
  );
}
