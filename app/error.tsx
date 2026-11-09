"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error", error);
  }, [error]);

  return (
    <div className="container-m4 py-24">
      <div className="mx-auto max-w-xl rounded-3xl border border-[#c4b5fd]/12 bg-[#0b051d] p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-300/10 text-rose-300">
          <AlertTriangle size={26} aria-hidden="true" />
        </div>
        <h1 className="neon-text mt-5 text-3xl font-black tracking-[-0.04em] text-white">
          Something went wrong.
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          The page hit an unexpected error. Your cart and account data are safe.
          Try again, or head back to the store.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-xs font-black uppercase tracking-wide text-slate-950 hover:bg-fuchsia-300"
          >
            <RotateCcw size={14} aria-hidden="true" /> Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c4b5fd]/18 px-5 py-3 text-xs font-bold text-slate-300 hover:border-cyan-300/40 hover:text-white"
          >
            Back home
          </Link>
        </div>
        {error.digest && (
          <p className="mt-5 font-mono text-[10px] text-slate-600">Reference: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
