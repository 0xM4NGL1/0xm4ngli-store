"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Ruler, Sparkles, X } from "lucide-react";
import type { DealSignal, PricePoint, Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { categoryBySlug } from "@/lib/site";
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

const signalLabel: Record<DealSignal["verdict"], string> = {
  buy: "Buy now",
  good: "Good price",
  fair: "Fair price",
  wait: "Consider waiting",
  collecting: "Collecting data",
};

export type ProductCardViewProps = {
  product: Product;
  signal: DealSignal;
  history: PricePoint[];
  saved: boolean;
  authenticated: boolean;
};

function isInteractive(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    Boolean(target.closest("a,button,input,select,textarea"))
  );
}

export function ProductCardView({
  product,
  signal,
  history,
  saved,
  authenticated,
}: ProductCardViewProps) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  const openDrawer = useCallback(() => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    setOpen(true);
    window.requestAnimationFrame(() => setVisible(true));
  }, []);

  const closeDrawer = useCallback(() => {
    setVisible(false);
    closeTimer.current = window.setTimeout(() => setOpen(false), 280);
  }, []);

  useEffect(
    () => () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKeyDown);
    const focusTimer = window.setTimeout(() => closeButton.current?.focus(), 80);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [open, closeDrawer]);

  const category = categoryBySlug[product.category];
  const hasMarketHistory = history.some((point) => point.source?.startsWith("market"));
  const discount =
    product.compareAtCents && product.compareAtCents > product.priceCents
      ? (product.compareAtCents - product.priceCents) / product.compareAtCents
      : null;
  const sparkColor = sparkColors[signal.verdict];

  return (
    <>
      <article
        onClick={(event) => {
          if (!isInteractive(event.target)) openDrawer();
        }}
        className="neon-card card-hover group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-[#0b051d]"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
          <button
            type="button"
            onClick={openDrawer}
            aria-haspopup="dialog"
            aria-label={`Quick view ${product.name}`}
            className="absolute inset-0 block w-full text-left"
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
            <span className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#05060b]/75 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-slate-200 opacity-0 backdrop-blur transition group-hover:opacity-100">
              <Sparkles size={11} aria-hidden="true" />
              Quick view
            </span>
          </button>
          <div className="card-actions absolute bottom-3 right-3 z-10 flex items-center gap-2">
            <WishlistButton
              productId={product.id}
              initial={saved}
              authenticated={authenticated}
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
            <button
              type="button"
              onClick={openDrawer}
              aria-haspopup="dialog"
              className="text-left"
            >
              {product.name}
            </button>
          </h3>

          <div className="mt-4">
            <div className="flex items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">
              <span>
                {hasMarketHistory ? "90-day market price" : "90-day recorded price"}
              </span>
              <span>{history.length >= 2 ? `${history.length} pts` : "collecting"}</span>
            </div>
            {history.length >= 2 ? (
              <MiniSparkline points={history} color={sparkColor} />
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

      {open && (
        <div className="fixed inset-0 z-[90]">
          <div
            className={`absolute inset-0 bg-[#03040a]/70 backdrop-blur-sm transition-opacity duration-300 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeDrawer();
            }}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={`${product.name} quick view`}
            className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0b051d] shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              visible ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-cyan-300">
                  Quick view
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {category?.name ?? product.category}
                </p>
              </div>
              <button
                ref={closeButton}
                type="button"
                onClick={closeDrawer}
                aria-label="Close quick view"
                className="rounded-full border border-white/10 bg-white/[0.03] p-2 text-slate-300 transition hover:border-cyan-300/40 hover:text-white"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-900">
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  sizes="(max-width: 768px) 100vw, 480px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05060b]/35 via-transparent to-transparent" />
                <span className="absolute left-3 top-3">
                  <DealBadge signal={signal} />
                </span>
              </div>

              <div className="mt-5 flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    {product.brand}
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-white">
                    {product.name}
                  </h2>
                </div>
                <DropPill signal={signal} />
              </div>

              <div className="mt-3 flex flex-wrap items-end gap-3">
                <p className="text-3xl font-black tracking-tight text-white">
                  {formatPrice(product.priceCents, product.currency)}
                </p>
                {product.compareAtCents && product.compareAtCents > product.priceCents && (
                  <p className="pb-1 text-sm text-slate-500 line-through">
                    {formatPrice(product.compareAtCents, product.currency)}
                  </p>
                )}
                {discount && (
                  <span className="mb-1 rounded-md bg-emerald-300/10 px-2 py-1 font-mono text-xs font-bold text-emerald-200">
                    −{Math.round(discount * 100)}%
                  </span>
                )}
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {product.description}
              </p>

              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-white">
                    {signalLabel[signal.verdict]}
                  </p>
                  <p className="font-mono text-xl font-black text-cyan-200">
                    {signal.verdict === "collecting" ? "—" : signal.score}
                    {signal.verdict !== "collecting" && (
                      <span className="text-xs text-slate-500">/100</span>
                    )}
                  </p>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  {signal.summary}
                </p>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">
                  <span>90-day price history</span>
                  <span>
                    {history.length >= 2 ? `${history.length} observations` : "collecting"}
                  </span>
                </div>
                {history.length >= 2 ? (
                  <MiniSparkline
                    points={history}
                    color={sparkColor}
                    width={380}
                    height={110}
                    className="mt-1 h-28 w-full"
                  />
                ) : (
                  <div className="mt-1 flex h-28 items-center justify-center rounded-lg border border-dashed border-white/10 px-4 text-center text-xs text-slate-600">
                    No recorded prices yet. The chart appears as real observations arrive.
                  </div>
                )}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    {
                      label: "90d low",
                      value:
                        signal.low90Cents !== null
                          ? formatPrice(signal.low90Cents, product.currency)
                          : "—",
                      tone: "text-emerald-300",
                    },
                    {
                      label: "90d avg",
                      value:
                        signal.average90Cents !== null
                          ? formatPrice(signal.average90Cents, product.currency)
                          : "—",
                      tone: "text-slate-200",
                    },
                    {
                      label: "90d high",
                      value:
                        signal.high90Cents !== null
                          ? formatPrice(signal.high90Cents, product.currency)
                          : "—",
                      tone: "text-rose-300",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-lg border border-white/10 bg-white/[0.02] px-2 py-2 text-center"
                    >
                      <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-slate-600">
                        {stat.label}
                      </p>
                      <p className={`mt-1 font-mono text-xs font-bold ${stat.tone}`}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {Object.keys(product.specs).length > 0 && (
                <dl className="mt-5 overflow-hidden rounded-xl border border-white/10">
                  {Object.entries(product.specs)
                    .slice(0, 4)
                    .map(([key, value], index) => (
                      <div
                        key={key}
                        className={`grid grid-cols-[110px_1fr] gap-3 px-4 py-2.5 text-xs ${
                          index % 2 === 0 ? "bg-white/[0.025]" : ""
                        }`}
                      >
                        <dt className="text-slate-500">{key}</dt>
                        <dd className="text-slate-200">{value}</dd>
                      </div>
                    ))}
                </dl>
              )}

              {product.sizes.length > 0 && (
                <div className="mt-5">
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">
                    Available sizes
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <span
                        key={size}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-slate-300"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 flex flex-col gap-2">
                {product.sizes.length > 0 ? (
                  <Link
                    href={`/product/${product.slug}`}
                    className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-cyan-300 to-fuchsia-300 px-5 py-3.5 text-sm font-black uppercase tracking-[0.08em] text-slate-950 transition hover:brightness-110"
                  >
                    Choose a size
                  </Link>
                ) : (
                  <AddToCartButton
                    productId={product.id}
                    available={product.available}
                    variant="primary"
                  />
                )}
                <WishlistButton
                  productId={product.id}
                  initial={saved}
                  authenticated={authenticated}
                />
              </div>

              <Link
                href={`/product/${product.slug}`}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-300 transition hover:border-cyan-300/40 hover:text-white"
              >
                View full product page
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
