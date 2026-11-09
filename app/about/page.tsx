import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ChartNoAxesCombined,
  Database,
  Eye,
  Globe,
  Heart,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { site } from "@/lib/site";
import { isBankTransferConfigured } from "@/lib/payments";
import { getPriceObservationCount, getTotalProductCount } from "@/lib/products";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why 0xm4ngli exists: independent technology recommendations, recorded price history, authorised data sources and a privacy-first store.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [products, observations] = await Promise.all([
    getTotalProductCount(),
    getPriceObservationCount(),
  ]);
  const bankConfigured = isBankTransferConfigured();
  const stateLabel = site.demoCatalog
    ? "Demo catalogue · bank transfer checkout"
    : bankConfigured
      ? "Live catalogue · bank transfer checkout"
      : "Live catalogue · bank details not configured";

  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="hero-glow absolute inset-0" />
        <div className="container-m4 relative py-16 md:py-24">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">
              <Sparkles size={13} aria-hidden="true" />
              About 0xm4ngli
            </div>
            <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-[-0.06em] text-white md:text-7xl">
              I built the tech store
              <span className="text-gradient block">I wanted to use.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 md:text-lg">
              I&apos;m 0xm4ngli. This store exists for one practical reason: helping
              people get the best technology at the best price, without the
              sponsored rankings, fake urgency or data harvesting that make normal
              shopping exhausting.
            </p>
          </div>
        </div>
      </section>

      <section className="container-m4 py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
              The idea
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white md:text-4xl">
              Evidence, not hype.
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-8 text-slate-400">
              <p>
                Most product pages tell you what to buy and show a discount that may
                never have been a real price. I wanted the opposite: a place that
                shows what a product actually cost over time, says plainly whether
                now looks like a good moment, and admits when there is not enough
                data to know.
              </p>
              <p>
                That is why every product here carries recorded price observations
                and a buy signal as the data arrives. It is also why the store has no
                paid rankings. A retailer cannot pay to move up, and a brand cannot
                buy a better verdict.
              </p>
              <p>
                The same logic applies to privacy. If I do not need your data to sell
                you a laptop, I should not collect it. Accounts store the minimum,
                orders are paid by bank transfer with a unique reference, and you can
                export or delete your account without emailing support.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: ChartNoAxesCombined, value: String(products), label: "products tracked" },
                { icon: Database, value: observations.toLocaleString("en-IE"), label: "price observations" },
                { icon: Eye, value: "0", label: "tracking pixels" },
                { icon: Lock, value: "0", label: "card details stored" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-[#0a0d19] p-5"
                >
                  <item.icon size={18} className="text-cyan-300" aria-hidden="true" />
                  <p className="mt-4 text-3xl font-black text-white">{item.value}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs leading-6 text-slate-500">
              <p className="font-semibold text-slate-300">Current store state</p>
              <p className="mt-1">{stateLabel}</p>
              <p className="mt-2">
                Demo data is labelled. Nothing is presented as a live offer while it
                is illustrative.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#070913]">
        <div className="container-m4 py-16 md:py-24">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: BadgeCheck,
                title: "No paid rankings",
                text: "Sorting is based on catalogue data and price history. Sponsorship cannot change the order.",
              },
              {
                icon: Search,
                title: "Authorised data only",
                text: "Prices come from feeds we are permitted to use or our own stock system. No retailer API is scraped.",
              },
              {
                icon: ShieldCheck,
                title: "Privacy by default",
                text: "Essential cookies only, no analytics, no data sales, no cross-site tracking.",
              },
              {
                icon: Heart,
                title: "Built to help",
                text: "The goal is a good decision at a fair price, not a checkout at any cost.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-[#0a0d19] p-6">
                <item.icon size={22} className="text-cyan-300" aria-hidden="true" />
                <h2 className="mt-4 text-lg font-bold text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-400">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-m4 py-16 md:py-24" id="price-engine">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-fuchsia-300">
              Under the hood
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white md:text-4xl">
              How the buy signal works.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              It is deliberately simple and inspectable. Every product page shows
              the numbers behind the verdict.
            </p>
            <ol className="mt-6 space-y-5">
              {[
                {
                  step: "01",
                  title: "Record observations",
                  text: "Each authorised feed sync stores the price with a timestamp. Observations are never backfilled with invented values.",
                },
                {
                  step: "02",
                  title: "Calculate the 90-day context",
                  text: "Low, high and average over the last 90 days, plus the change over the last 30 days.",
                },
                {
                  step: "03",
                  title: "Score the current price",
                  text: "A 0–100 score rewards a low position in the range, a recent downward move and sitting at the 90-day low. Fewer than three observations means “collecting”, not a guess.",
                },
                {
                  step: "04",
                  title: "Translate it honestly",
                  text: "Buy, Good, Fair or Wait. It is a shopping aid, not a prediction or financial advice.",
                },
              ].map((item) => (
                <li key={item.step} className="flex gap-4">
                  <span className="font-mono text-[10px] font-bold text-cyan-300">{item.step}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <p className="mt-1 text-xs leading-6 text-slate-400">{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-[#0a0d19] p-6">
              <h3 className="text-sm font-bold text-white">The scoring model</h3>
              <pre className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-[#05060b] p-4 font-mono text-[11px] leading-6 text-cyan-100">
{`position = (price - low90) / (high90 - low90)
dropBoost = clamp(-change30 * 100, 0, 20)
score = clamp((1 - position) * 75 + dropBoost
              + (price <= low90 ? 5 : 0), 0, 100)

score >= 80 or price <= low90  -> BUY
score >= 60                    -> GOOD
score >= 40                    -> FAIR
otherwise                      -> WAIT
observations < 3               -> COLLECTING`}
              </pre>
              <p className="mt-4 text-xs leading-6 text-slate-500">
                The score is computed from the database on each page render. It is
                not an AI judgement and it does not use your personal data.
              </p>
              <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/[0.05] p-4 text-xs leading-6 text-amber-100/80">
                <strong className="text-amber-100">Limitations:</strong> history is
                only as good as the feed. A price may drop further, a product may go
                out of stock, and a low price may reflect a different configuration.
                Always check the specification and the final checkout price.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-m4 pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c1022] via-[#0b0a1b] to-[#071018] p-8 md:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-[80px]" />
          <div className="relative max-w-2xl">
            <Globe size={26} className="text-cyan-300" aria-hidden="true" />
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white">
              One store. A global view.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Technology pricing varies wildly by country. This store is built for
              worldwide delivery, transparent shipping and a checkout that gives you
              the bank details and a unique reference. No card details are ever
              requested. The catalogue and price engine can be fed from authorised
              suppliers in any market.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-xs font-black uppercase tracking-wide text-slate-950 hover:bg-fuchsia-300"
              >
                Shop the catalogue <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-xs font-bold text-slate-200 hover:border-cyan-300/40 hover:text-white"
              >
                Talk to me
              </Link>
            </div>
            <p className="mt-5 text-[11px] text-slate-600">
              {bankConfigured
                ? "Orders are paid by bank transfer with a unique reference. No card details are requested."
                : "Bank transfer details are not configured yet."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
