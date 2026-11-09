import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  Database,
  Globe,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import {
  getDealSignal,
  getPriceHistory,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/products";
import { getCurrentUser } from "@/lib/auth";
import { isWishlisted } from "@/lib/wishlist";
import { categoryBySlug, site } from "@/lib/site";
import { formatDate, formatDateTime, formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/product-image";
import { DealBadge, DropPill } from "@/components/deal-badge";
import { PurchasePanel } from "@/components/purchase-panel";
import { WishlistButton } from "@/components/wishlist-button";
import { PriceHistoryChart } from "@/components/price-history-chart";
import { ProductCard } from "@/components/product-card";

type PageProps = { params: Promise<{ slug: string }> };

const deliveryFormatter = new Intl.DateTimeFormat("en-IE", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

function addBusinessDays(days: number) {
  const date = new Date();
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const weekday = date.getDay();
    if (weekday !== 0 && weekday !== 6) added += 1;
  }
  return date;
}

function deliveryEstimate() {
  const earliest =
    site.dispatchBusinessDays + site.deliveryMinBusinessDays;
  const latest = site.dispatchBusinessDays + site.deliveryMaxBusinessDays;
  return `${deliveryFormatter.format(addBusinessDays(earliest))} – ${deliveryFormatter.format(addBusinessDays(latest))}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  const signal = await getDealSignal(product.id);
  const description = `${product.description} Current price ${formatPrice(product.priceCents, product.currency)}. ${signal.summary}`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    robots: product.isDemo ? { index: false, follow: true } : undefined,
    openGraph: {
      title: product.name,
      description,
      type: "website",
      url: `${site.url}/product/${product.slug}`,
      images: product.image ? [{ url: product.image }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [signal, history, related, user] = await Promise.all([
    getDealSignal(product.id),
    getPriceHistory(product.id, 180),
    getRelatedProducts(product, 4),
    getCurrentUser(),
  ]);
  const category = categoryBySlug[product.category];
  const saved = user ? await isWishlisted(user.id, product.id) : false;
  const discount =
    product.compareAtCents && product.compareAtCents > product.priceCents
      ? (product.compareAtCents - product.priceCents) / product.compareAtCents
      : null;
  const shippingCents =
    product.priceCents >= site.freeShippingThresholdCents
      ? 0
      : site.flatShippingCents;
  const freeShippingRemaining = Math.max(
    0,
    site.freeShippingThresholdCents - product.priceCents,
  );
  const delivery = deliveryEstimate();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand },
    image: product.image ? [product.image] : undefined,
    offers: {
      "@type": "Offer",
      url: `${site.url}/product/${product.slug}`,
      priceCurrency: product.currency,
      price: (product.priceCents / 100).toFixed(2),
      availability:
        product.available > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: site.name },
    },
  };

  return (
    <div className="container-m4 py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replaceAll("<", "\\u003c"),
        }}
      />

      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-cyan-200">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-cyan-200">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category}`} className="hover:text-cyan-200">
          {category?.name}
        </Link>
        <span>/</span>
        <span className="text-slate-300">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <div className="neon-card relative aspect-[4/3] overflow-hidden rounded-3xl bg-slate-900">
            <ProductImage
              src={product.image}
              alt={product.name}
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#04010c]/40 via-transparent to-transparent" />
            <span className="absolute left-4 top-4">
              <DealBadge signal={signal} size="md" />
            </span>
            {product.isDemo && (
              <span className="absolute right-4 top-4 rounded-full border border-amber-300/35 bg-[#2a1d05]/88 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-amber-200 backdrop-blur-md">
                Demo data
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: "Tracked shipping", value: "3–10 business days" },
              {
                icon: RotateCcw,
                label: "Returns",
                value: "14 days, EU right",
              },
              {
                icon: ShieldCheck,
                label: "Warranty",
                value: "Manufacturer + statutory",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="neon-card rounded-xl bg-[#0b051d]/70 p-3"
              >
                <item.icon size={16} className="text-cyan-300" aria-hidden="true" />
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {item.label}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-slate-300">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <div className="flex items-center gap-2">
              <Link
                href={`/shop?category=${product.category}`}
                className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300 hover:text-cyan-100"
              >
                {category?.name}
              </Link>
              <span className="text-slate-700">·</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                {product.brand}
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              {product.description}
            </p>

            <div className="mt-6 flex flex-wrap items-end gap-3">
              <p className="text-4xl font-black tracking-tight text-white">
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
            <p className="mt-1 text-xs text-slate-500">
              Tax included.{" "}
              {shippingCents === 0
                ? "Free tracked shipping."
                : `${formatPrice(shippingCents)} tracked shipping — free over ${formatPrice(site.freeShippingThresholdCents)}.`}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span
                className={
                  product.available > 0
                    ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-200"
                    : "inline-flex items-center gap-1.5 rounded-full bg-rose-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-rose-200"
                }
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                {product.available > 0 ? `In stock · ${product.available} available` : "Out of stock"}
              </span>
              <DropPill signal={signal} />
            </div>

            <div className="neon-card mt-6 rounded-2xl bg-[#0b051d] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    0xm4ngli buy signal
                  </p>
                  <p className="mt-1 text-lg font-black text-white">
                    {signal.verdict === "buy"
                      ? "Buy now"
                      : signal.verdict === "good"
                        ? "Good price"
                        : signal.verdict === "fair"
                          ? "Fair price"
                          : signal.verdict === "wait"
                            ? "Consider waiting"
                            : "Collecting data"}
                  </p>
                </div>
                <span className="font-mono text-2xl font-black text-cyan-200">
                  {signal.verdict === "collecting" ? "—" : signal.score}
                  {signal.verdict !== "collecting" && (
                    <span className="text-xs text-slate-500">/100</span>
                  )}
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#c4b5fd]/12">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300"
                  style={{ width: `${signal.score}%` }}
                />
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-400">{signal.summary}</p>
            </div>

            <div id="buy" className="neon-card mt-4 rounded-2xl bg-[#0b051d] p-4 md:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-[0.14em] text-white">
                    Make it yours
                  </h2>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    {product.sizes.length > 0
                      ? "Choose your size and quantity, then add it to the cart."
                      : "Choose a quantity, then add it to the cart."}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-emerald-200">
                  {product.available > 0 ? "Ready to ship" : "Sold out"}
                </span>
              </div>
              <div className="mt-4">
                <PurchasePanel
                  productId={product.id}
                  slug={product.slug}
                  available={product.available}
                  sizes={product.sizes}
                />
              </div>
            </div>
            <div className="mt-3">
              <WishlistButton
                productId={product.id}
                initial={saved}
                authenticated={Boolean(user)}
              />
            </div>

            <div className="neon-card mt-4 rounded-2xl bg-[#0b051d] p-4">
              <h2 className="flex items-center gap-2 text-sm font-black text-white">
                <Truck size={16} className="text-cyan-300" aria-hidden="true" />
                Delivery & returns
              </h2>
              <dl className="mt-3 space-y-3 text-xs">
                <div className="flex gap-3">
                  <dt className="w-28 shrink-0 text-slate-500">Estimated arrival</dt>
                  <dd className="text-slate-200">
                    <span className="font-semibold text-white">{delivery}</span>
                    <span className="block text-[11px] text-slate-500">
                      after dispatch
                    </span>
                  </dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-28 shrink-0 text-slate-500">Shipping</dt>
                  <dd className="text-slate-200">
                    {shippingCents === 0
                      ? "Free tracked shipping"
                      : `${formatPrice(shippingCents)} tracked shipping`}
                    {freeShippingRemaining > 0 && (
                      <span className="block text-[11px] text-slate-500">
                        Add {formatPrice(freeShippingRemaining)} more for free shipping.
                      </span>
                    )}
                  </dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-28 shrink-0 text-slate-500">Returns</dt>
                  <dd className="text-slate-200">
                    {site.returnsDays}-day returns ·{" "}
                    <Link href="/legal/shipping" className="text-cyan-200 underline underline-offset-2">
                      read the policy
                    </Link>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="neon-card mt-4 rounded-2xl bg-[#0b051d] p-4">
              <h2 className="text-sm font-black text-white">How buying works</h2>
              <ol className="mt-3 space-y-3 text-xs leading-5 text-slate-400">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-300/10 font-mono text-[10px] font-bold text-cyan-200">
                    1
                  </span>
                  <span>
                    <strong className="text-slate-200">Add it to your cart.</strong>{" "}
                    Choose your size and quantity where available.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-300/10 font-mono text-[10px] font-bold text-cyan-200">
                    2
                  </span>
                  <span>
                    <strong className="text-slate-200">Place the order.</strong> You
                    get the exact amount, our IBAN and a unique payment reference.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-300/10 font-mono text-[10px] font-bold text-cyan-200">
                    3
                  </span>
                  <span>
                    <strong className="text-slate-200">Send the transfer.</strong> We
                    match it, confirm the order and email tracking when it ships.
                  </span>
                </li>
              </ol>
            </div>

            <div className="mt-4 space-y-2 border-t border-[#c4b5fd]/12 pt-4 text-xs text-slate-500">
              <p className="flex items-center gap-2">
                <Globe size={13} className="text-cyan-300" aria-hidden="true" />
                Worldwide tracked shipping. {site.returnsDays}-day returns.
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck size={13} className="text-cyan-300" aria-hidden="true" />
                Statutory and manufacturer warranty apply.
              </p>
              <p className="flex items-center gap-2">
                <Database size={13} className="text-cyan-300" aria-hidden="true" />
                Price source: {product.source === "feed"
                  ? "authorised feed"
                  : product.source === "demo"
                    ? "demo feed"
                    : "0xm4ngli catalogue"}{" "}
                · updated {formatDateTime(product.updatedAt)}
              </p>
            </div>

            {product.isDemo && (
              <p className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/[0.05] p-3 text-[11px] leading-5 text-amber-200/80">
                This is demo catalogue data for evaluating the store. Connect an
                authorised feed before accepting real orders.
              </p>
            )}
          </div>
        </div>
      </div>

      <section className="mt-16 grid gap-6 lg:grid-cols-12" aria-labelledby="price-history-heading">
        <div className="lg:col-span-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">
                Price history
              </p>
              <h2 id="price-history-heading" className="mt-1 text-2xl font-black text-white">
                What it cost, what it costs now.
              </h2>
            </div>
            <Link
              href="/about#price-engine"
              className="text-xs text-slate-400 underline underline-offset-4 hover:text-cyan-200"
            >
              How this is calculated
            </Link>
          </div>
          <PriceHistoryChart
            points={history}
            signal={signal}
            currency={product.currency}
            productId={product.id}
          />
        </div>

        <div className="lg:col-span-4">
          <div className="neon-card rounded-2xl bg-[#0b051d] p-5">
            <h2 className="text-sm font-bold text-white">The numbers</h2>
            {signal.verdict === "collecting" ? (
              <>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-[#c4b5fd]/8 pb-2">
                    <dt className="text-slate-500">Current price</dt>
                    <dd className="font-mono font-bold text-emerald-300">
                      {formatPrice(product.priceCents, product.currency)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-500">Price observations</dt>
                    <dd className="font-mono font-bold text-slate-200">
                      {Math.min(signal.observations, 3)}/3
                    </dd>
                  </div>
                </dl>
                <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-slate-500">
                  <Clock size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                  The 90-day low, average, high and 30-day change appear after
                  three recorded prices. We do not backfill guesses.
                </p>
              </>
            ) : (
              <>
                <dl className="mt-4 space-y-3 text-sm">
                  {[
                    {
                      label: "90-day low",
                      value:
                        signal.low90Cents !== null
                          ? formatPrice(signal.low90Cents, product.currency)
                          : "Collecting",
                      accent: "text-emerald-300",
                    },
                    {
                      label: "90-day average",
                      value:
                        signal.average90Cents !== null
                          ? formatPrice(signal.average90Cents, product.currency)
                          : "Collecting",
                      accent: "text-slate-200",
                    },
                    {
                      label: "90-day high",
                      value:
                        signal.high90Cents !== null
                          ? formatPrice(signal.high90Cents, product.currency)
                          : "Collecting",
                      accent: "text-rose-300",
                    },
                    {
                      label: "30-day change",
                      value:
                        signal.change30Percent !== null
                          ? `${signal.change30Percent > 0 ? "+" : ""}${(signal.change30Percent * 100).toFixed(1)}%`
                          : "Collecting",
                      accent:
                        signal.change30Percent !== null && signal.change30Percent < 0
                          ? "text-emerald-300"
                          : "text-slate-200",
                    },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-3 border-b border-[#c4b5fd]/8 pb-2 last:border-0 last:pb-0">
                      <dt className="text-slate-500">{row.label}</dt>
                      <dd className={`font-mono font-bold ${row.accent}`}>{row.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-slate-500">
                  <Clock size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                  {signal.observations} observations in the last 90 days. Lowest
                  recorded:{" "}
                  {signal.lowestEverCents !== null
                    ? formatPrice(signal.lowestEverCents, product.currency)
                    : "—"}
                  .
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mt-14 grid gap-8 lg:grid-cols-12" aria-labelledby="specs-heading">
        <div className="lg:col-span-7">
          <h2 id="specs-heading" className="text-2xl font-black text-white">
            Specifications
          </h2>
          <dl className="neon-card mt-4 overflow-hidden rounded-2xl">
            {Object.entries(product.specs).map(([key, value], index) => (
              <div
                key={key}
                className={
                  index % 2 === 0
                    ? "grid grid-cols-2 gap-4 bg-[#0b051d]/75 px-4 py-3"
                    : "grid grid-cols-2 gap-4 bg-transparent px-4 py-3"
                }
              >
                <dt className="text-sm text-slate-500">{key}</dt>
                <dd className="text-sm text-slate-200">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-5">
          <h2 className="text-2xl font-black text-white">Buying & returns</h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-400">
            <p className="flex items-start gap-2">
              <BadgeCheck size={16} className="mt-1 shrink-0 text-cyan-300" aria-hidden="true" />
              Payment by bank transfer. We never ask for or store card details. You
              transfer the exact amount with your unique order reference.
            </p>
            <p className="flex items-start gap-2">
              <Truck size={16} className="mt-1 shrink-0 text-cyan-300" aria-hidden="true" />
              Orders are prepared after payment confirmation. Tracking is sent
              when the parcel leaves the warehouse.
            </p>
            <p className="flex items-start gap-2">
              <RotateCcw size={16} className="mt-1 shrink-0 text-cyan-300" aria-hidden="true" />
              EU consumers have a 14-day withdrawal right from delivery. See the{" "}
              <Link href="/legal/shipping" className="text-cyan-200 underline underline-offset-2">
                shipping & returns policy
              </Link>
              .
            </p>
            <p className="flex items-start gap-2">
              <ShieldCheck size={16} className="mt-1 shrink-0 text-cyan-300" aria-hidden="true" />
              Statutory warranty rights apply. This does not affect your
              manufacturer warranty.
            </p>
          </div>
          <div className="neon-outline mt-5 rounded-xl p-4 text-xs text-slate-500">
            Last checked {formatDate(product.updatedAt)} · SKU {product.sku}
            {product.sourceUrl && (
              <>
                {" · "}
                <a
                  href={product.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-cyan-200 underline underline-offset-2"
                >
                  Source
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="related-heading">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 id="related-heading" className="text-2xl font-black text-white md:text-3xl">
              More in {category?.name}
            </h2>
            <Link
              href={`/shop?category=${product.category}`}
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400 hover:text-cyan-200"
            >
              <ArrowLeft size={13} aria-hidden="true" /> Back to category
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((entry) => (
              <ProductCard key={entry.id} product={entry} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
