import Link from "next/link";
import { Ruler } from "lucide-react";
import type { DealSignal, Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { categoryBySlug } from "@/lib/site";
import { getDealSignal, getPriceHistory } from "@/lib/products";
import { getViewerWishlist } from "@/lib/wishlist";
import { ProductImage } from "./product-image";
import { DealBadge, DropPill } from "./deal-badge";
import { AddToCartButton } from "./add-to-cart-button";
import { WishlistButton } from "./wishlist-button";
import { MiniSparkline } from "./mini-sparkline";

const sparkColors: Record<DealSignal["verdict"], string> = {
  buy: "#4dffa8",
  good: "#34f4ff",
  fair: "#ffc247",
  wait: "#ff6d93",
  collecting: "#6d619a",
};

export async function ProductCard({ product }: { product: Product }) {
  const [signal, history, viewer] = await Promise.all([
    getDealSignal(product.id),
    getPriceHistory(product.id, 90),
    getViewerWishlist(),
  ]);
  const category = categoryBySlug[product.category];
  const discount =
    product.compareAtCents && product.compareAtCents > product.priceCents
      ? (product.compareAtCents - product.priceCents) / product.compareAtCents
      : null;

  return (
    <article className="neon-card card-hover group relative flex h-full flex-col overflow-hidden rounded-2xl bg-[#0b051d]">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 block"
          aria-label={`View ${product.name}`}
        >
          <ProductImage
            src={product.image}
            alt={product.name}
            className="transition duration-700 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080316] via-transparent to-transparent opacity-80" />
          <span className="neon-chip absolute left-3 top-3 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-100 backdrop-blur">
            {category?.name ?? product.category}
          </span>
          <span className="absolute right-3 top-3">
            <DealBadge signal={signal} />
          </span>
        </Link>
        <div className="card-actions absolute bottom-3 right-3 z-10 flex items-center gap-2">
          <WishlistButton
            productId={product.id}
            initial={viewer.productIds.has(product.id)}
            authenticated={viewer.authenticated}
            compact
          />
          {product.sizes.length > 0 ? (
            <Link
              href={`/product/${product.slug}`}
              aria-label={`Choose a size for ${product.name}`}
              title="Choose a size"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#c4b5fd]/18 bg-[#04010c]/80 text-slate-200 backdrop-blur transition hover:border-cyan-300/50 hover:bg-cyan-300/15 hover:text-cyan-100"
            >
              <Ruler size={15} aria-hidden="true" />
            </Link>
          ) : (
            <AddToCartButton
              productId={product.id}
              available={product.available}
              variant="icon"
            />
          )}
        </div>
      </div>

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

        <div className="mt-4">
          <div className="flex items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">
            <span>90-day recorded price</span>
            <span>{history.length >= 2 ? `${history.length} pts` : "collecting"}</span>
          </div>
          {history.length >= 2 ? (
            <MiniSparkline points={history} color={sparkColors[signal.verdict]} />
          ) : (
            <div className="mt-0.5 flex h-14 items-center justify-center rounded-md border border-dashed border-[#c4b5fd]/12 text-[10px] text-slate-600">
              No recorded prices yet
            </div>
          )}
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="neon-text text-lg font-black tracking-tight text-white">
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
              {product.sizes.length > 0 ? (
                <Link
                  href={`/product/${product.slug}`}
                  className="flex w-full items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-2.5 text-xs font-bold text-cyan-100 transition hover:bg-cyan-300/20"
                >
                  Choose size
                </Link>
              ) : (
                <AddToCartButton
                  productId={product.id}
                  available={product.available}
                  variant="compact"
                  label={product.available > 0 ? "Add" : "Sold out"}
                />
              )}
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
