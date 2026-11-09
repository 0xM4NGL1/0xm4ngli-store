import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Account deleted",
  robots: { index: false, follow: false },
};

export default function AccountDeletedPage() {
  return (
    <div className="container-m4 py-16 md:py-24">
      <div className="mx-auto max-w-2xl rounded-3xl border border-[#c4b5fd]/12 bg-[#0b051d] p-8 text-center md:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-300/10 text-emerald-300">
          <Check size={30} aria-hidden="true" />
        </div>
        <p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
          Account deleted
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">
          Your account has been erased.
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-400">
          Your profile, sessions, cart, wishlist and reset tokens have been
          deleted. Order and invoice records are retained where tax and accounting
          law requires it, detached from your account. You can read the exact
          retention rules in the privacy policy.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-xs font-black uppercase tracking-wide text-slate-950 hover:bg-fuchsia-300"
          >
            Back to the store <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <Link
            href="/legal/privacy"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c4b5fd]/18 px-5 py-3 text-xs font-bold text-slate-300 hover:border-cyan-300/40 hover:text-white"
          >
            <ShieldCheck size={14} aria-hidden="true" /> Privacy policy
          </Link>
        </div>
        <p className="mt-6 text-[11px] leading-5 text-slate-600">
          If you believe any data was not handled correctly, you can contact us or
          complain to your local data protection authority.
        </p>
      </div>
    </div>
  );
}
