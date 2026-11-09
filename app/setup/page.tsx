import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Code2, Database, ShieldCheck } from "lucide-react";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Connect the database",
  robots: { index: false, follow: false },
};

export default function SetupPage() {
  return (
    <div className="container-m4 py-16 md:py-24">
      <div className="neon-card mx-auto max-w-2xl rounded-3xl bg-[#0a0d19] p-8 md:p-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-300/10 text-cyan-300">
          <Database size={26} aria-hidden="true" />
        </div>
        <p className="mt-5 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
          Deployment setup
        </p>
        <h1 className="neon-text mt-2 text-3xl font-black tracking-[-0.04em] text-white md:text-4xl">
          The store is deployed. The database is not connected yet.
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          Vercel functions do not keep a local SQLite file. Connect Turso once,
          add two environment variables, and the full storefront, accounts, orders
          and bank-transfer checkout will run on persistent data.
        </p>

        <ol className="mt-6 space-y-4 text-sm leading-6 text-slate-300">
          <li className="flex gap-3">
            <span className="font-mono text-cyan-300">01</span>
            <span>
              Create a free Turso database with{" "}
              <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-cyan-100">
                ./scripts/setup-turso.sh
              </code>{" "}
              or the Turso dashboard.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-cyan-300">02</span>
            <span>
              In Vercel → Project → Settings → Environment Variables, add{" "}
              <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-cyan-100">
                TURSO_DATABASE_URL
              </code>{" "}
              and{" "}
              <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-cyan-100">
                TURSO_AUTH_TOKEN
              </code>
              . Add{" "}
              <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-cyan-100">
                APP_URL=https://0xm4ngli-store.vercel.app
              </code>
              , <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-cyan-100">CART_SECRET</code>,{" "}
              <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-cyan-100">ADMIN_TOKEN</code>{" "}
              and <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-cyan-100">CRON_SECRET</code>.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-cyan-300">03</span>
            <span>Redeploy. The schema migrates automatically on the first request.</span>
          </li>
        </ol>

        <div className="mt-6 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.05] p-4 text-xs leading-6 text-emerald-100/80">
          <p className="flex items-center gap-2 font-semibold text-emerald-100">
            <ShieldCheck size={15} aria-hidden="true" /> Payments are bank transfer only
          </p>
          <p className="mt-1">
            No card details are requested. The official bank details are published
            in the repository and on the support page. The database only stores
            products, accounts, carts and orders.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/support"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-xs font-black uppercase tracking-wide text-slate-950 hover:bg-fuchsia-300"
          >
            Support the project <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <a
            href={site.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-xs font-bold text-slate-300 hover:border-cyan-300/40 hover:text-white"
          >
            <Code2 size={15} aria-hidden="true" /> Repository & setup guide
          </a>
        </div>
        <p className="mt-5 text-[11px] leading-5 text-slate-600">
          Local development does not need Turso; it uses `data/store.sqlite`.
        </p>
      </div>
    </div>
  );
}
