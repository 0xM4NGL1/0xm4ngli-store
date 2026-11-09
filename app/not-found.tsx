import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-m4 py-24">
      <div className="mx-auto max-w-xl text-center">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
          404 · Not found
        </p>
        <h1 className="mt-3 text-5xl font-black tracking-[-0.06em] text-white">
          No signal here.
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-400">
          The page may have moved, the product may no longer be listed, or the URL
          might have a typo. The catalogue is still one click away.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-xs font-black uppercase tracking-wide text-slate-950 hover:bg-fuchsia-300"
          >
            <Search size={14} aria-hidden="true" /> Browse the catalogue
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-xs font-bold text-slate-300 hover:border-cyan-300/40 hover:text-white"
          >
            <ArrowLeft size={14} aria-hidden="true" /> Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
