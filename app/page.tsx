import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ChartNoAxesCombined,
  Globe,
  Lock,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Truck,
} from "lucide-react";
import { categories, categoryBySlug, site } from "@/lib/site";
import {
  getBiggestDrops,
  getCategoryCounts,
  getDealSignal,
  getFeaturedProducts,
  getNewestProducts,
  getPriceHistory,
  getPriceObservationCount,
  getTotalProductCount,
} from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/product-image";
import { ProductCard } from "@/components/product-card";
import { DealBadge } from "@/components/deal-badge";
import { MiniSparkline } from "@/components/mini-sparkline";

function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
          {eyebrow}
        </p>
        <h2 className="neon-text mt-2 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl md:text-5xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            {description}
          </p>
        )}
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-300 transition hover:text-cyan-200"
        >
          {linkLabel}
          <ArrowRight
            size={15}
            className="transition group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const [
    productCount,
    observationCount,
    categoryCounts,
    drops,
    newArrivals,
    featuredList,
  ] = await Promise.all([
    getTotalProductCount(),
    getPriceObservationCount(),
    getCategoryCounts(),
    getBiggestDrops(4),
    getNewestProducts(4),
    getFeaturedProducts(1),
  ]);
  const featured = featuredList[0];
  const heroEntry =
    drops[0] ??
    (featured
      ? { product: featured, signal: await getDealSignal(featured.id) }
      : null);
  const heroHistory = heroEntry
    ? await getPriceHistory(heroEntry.product.id, 120)
    : [];

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="hero-glow absolute inset-0" />
        <div className="scanlines absolute inset-0 opacity-50" />
        <div className="hero-horizon" />
        <div className="container-m4 relative grid gap-14 pb-16 pt-14 lg:grid-cols-12 lg:items-center lg:pb-24 lg:pt-20">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">
              <Sparkles size={13} aria-hidden="true" />
              Independent price intelligence
            </div>
            <h1 className="neon-text-strong mt-6 max-w-3xl text-5xl font-black leading-[0.93] tracking-[-0.065em] text-white sm:text-6xl xl:text-7xl">
              Tech worth the wait.
              <span className="text-gradient block">Prices worth the drop.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
              A considered technology store with a difference: recorded price
              observations, a clear buy signal and no paid rankings. When there is
              not enough data, it says so. Buy when the price is right — or wait.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="neon-button group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-black uppercase tracking-[0.12em]"
              >
                Shop all tech
                <ArrowRight
                  size={17}
                  className="transition group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href="/shop?sort=drop"
                className="neon-outline inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-bold text-slate-200 transition hover:text-white"
              >
                <TrendingDown size={17} className="text-cyan-300" aria-hidden="true" />
                See price drops
              </Link>
            </div>

            <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-white/10 pt-6">
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">
                  Products tracked
                </dt>
                <dd className="neon-text mt-1 text-2xl font-black text-white">{productCount}</dd>
              </div>
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">
                  Price observations
                </dt>
                <dd className="neon-text mt-1 text-2xl font-black text-white">
                  {observationCount.toLocaleString("en-IE")}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">
                  Trackers
                </dt>
                <dd className="mt-1 text-2xl font-black text-emerald-300">0</dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-5">
            {heroEntry ? (
              <div className="relative mx-auto max-w-md">
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-cyan-400/15 via-transparent to-fuchsia-400/15 blur-2xl" />
                <div className="neon-card glass-strong relative overflow-hidden rounded-[1.6rem] p-3 shadow-2xl">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-900">
                    <ProductImage
                      src={heroEntry.product.image}
                      alt={heroEntry.product.name}
                      priority
                      sizes="(max-width: 1024px) 100vw, 480px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070812]/90 via-transparent to-transparent" />
                    <span className="absolute left-3 top-3">
                      <DealBadge signal={heroEntry.signal} />
                    </span>
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-200/80">
                          {categoryBySlug[heroEntry.product.category]?.name}
                        </p>
                        <p className="mt-1 text-sm font-bold leading-tight text-white">
                          {heroEntry.product.name}
                        </p>
                      </div>
                      <p className="text-xl font-black text-white">
                        {formatPrice(heroEntry.product.priceCents)}
                      </p>
                    </div>
                  </div>

                  <div className="px-2 pb-2 pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">
                          90-day low
                        </p>
                        <p className="neon-text text-lg font-black text-emerald-300">
                          {heroEntry.signal.low90Cents !== null
                            ? formatPrice(heroEntry.signal.low90Cents)
                            : "Collecting"}
                        </p>
                      </div>
                      <div className="w-40">
                        {heroHistory.length >= 2 ? (
                          <MiniSparkline
                            points={heroHistory}
                            color={
                              heroEntry.signal.verdict === "buy"
                                ? "#34d399"
                                : "#22d3ee"
                            }
                          />
                        ) : (
                          <p className="text-right font-mono text-[9px] uppercase leading-4 tracking-[0.12em] text-slate-600">
                            Awaiting
                            <br />
                            first syncs
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                      <p className="text-xs leading-5 text-slate-400">
                        {heroEntry.signal.summary}
                      </p>
                      <Link
                        href={`/product/${heroEntry.product.slug}`}
                        className="shrink-0 rounded-full border border-white/15 bg-white/[0.04] p-2 text-slate-200 transition hover:border-cyan-300/40 hover:text-white"
                        aria-label={`View ${heroEntry.product.name}`}
                      >
                        <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="neon-card glass-strong rounded-[1.6rem] p-8 text-center text-sm text-slate-400">
                Product data will appear here once a catalogue feed is connected.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white/[0.015]">
        <div className="container-m4 grid grid-cols-2 divide-x divide-white/10 py-5 sm:grid-cols-4">
          {[
            { icon: ShieldCheck, label: "GDPR-first by design" },
            { icon: Lock, label: "Card data never touches us" },
            { icon: Globe, label: "Worldwide delivery" },
            { icon: RotateCcw, label: "14-day returns" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-center gap-2 px-3 py-2 text-center"
            >
              <item.icon size={15} className="shrink-0 text-cyan-300" aria-hidden="true" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:text-[11px]">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="container-m4 py-16 md:py-24">
        <SectionHeading
          eyebrow="Browse"
          title="Everything tech, sorted."
          description="Eight focused categories. No infinite scroll, no sponsored placements."
          href="/shop"
          linkLabel="Shop all"
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/shop?category=${category.slug}`}
              className="neon-card card-hover group relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-900"
            >
              <ProductImage
                src={category.image}
                alt={category.name}
                className="opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05060b] via-[#05060b]/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                  {categoryCounts[category.slug] ?? 0} products
                </p>
                <p className="mt-1 text-base font-black tracking-tight text-white md:text-lg">
                  {category.name}
                </p>
              </div>
              <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-[#05060b]/60 text-slate-300 opacity-0 transition group-hover:opacity-100">
                <ArrowRight size={13} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#070913]">
        <div className="container-m4 py-16 md:py-24">
          <SectionHeading
            eyebrow="Price intelligence"
            title="Dropped this month."
            description="Ranked by the actual change in recorded price over the last 30 days — not by who paid for placement."
            href="/shop?sort=drop"
            linkLabel="All price drops"
          />
          {drops.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {drops.map((entry) => (
                <ProductCard key={entry.product.id} product={entry.product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-slate-400">
              No verified price drops yet. The engine needs a little more history.
            </div>
          )}
        </div>
      </section>

      <section className="container-m4 py-16 md:py-24" id="price-engine">
        <div className="neon-card relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a0d1d] via-[#0c0a1c] to-[#071018] p-6 md:p-12">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[90px]" />
          <div className="relative grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-fuchsia-300">
                The engine
              </p>
              <h2 className="neon-text mt-3 text-3xl font-black tracking-[-0.04em] text-white md:text-4xl">
                A buy signal built from evidence.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                The code records price observations from authorised feeds, then
                compares today&apos;s price with the 90-day low, high, average and
                30-day movement. If there is not enough data, it says so. It never
                invents a trend.
              </p>
              <Link
                href="/about#price-engine"
                className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200 hover:text-white"
              >
                How the engine works <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:col-span-7">
              {[
                {
                  icon: ChartNoAxesCombined,
                  step: "01",
                  title: "Observe",
                  text: "Ingest prices from an authorised feed or your own stock system.",
                },
                {
                  icon: Search,
                  step: "02",
                  title: "Compare",
                  text: "Position today's price inside its 90-day range and 30-day trend.",
                },
                {
                  icon: BadgeCheck,
                  step: "03",
                  title: "Decide",
                  text: "Get Buy, Good, Fair or Wait — with the evidence attached.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-white/10 bg-[#05060b]/45 p-5"
                >
                  <div className="flex items-center justify-between">
                    <item.icon size={19} className="text-cyan-300" aria-hidden="true" />
                    <span className="font-mono text-[10px] text-slate-600">{item.step}</span>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-slate-400">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-m4 pb-16 md:pb-24">
        <SectionHeading
          eyebrow="Just landed"
          title="New in."
          description="The latest additions to the catalogue."
          href="/shop?sort=newest"
          linkLabel="See everything"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="container-m4 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Truck,
              title: "Shipping that makes sense",
              text: `Flat ${formatPrice(site.flatShippingCents)} worldwide, free over ${formatPrice(site.freeShippingThresholdCents)}. Tracking included.`,
            },
            {
              icon: ShieldCheck,
              title: "Payments handled properly",
              text: "Bank transfer checkout. We never request card details — you pay directly from your bank with a unique reference.",
            },
            {
              icon: Lock,
              title: "Your data, your call",
              text: "Export or delete your account from your profile. No tracking pixels, no data sales.",
            },
          ].map((item) => (
            <div key={item.title} className="neon-card rounded-2xl bg-white/[0.02] p-6">
              <item.icon size={22} className="text-cyan-300" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-bold text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-400">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
