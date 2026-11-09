import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Mail,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact 0xm4ngli about orders, returns, privacy requests or the store itself.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="container-m4 py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
          Contact
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white md:text-5xl">
          Talk to a person.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
          There is no contact form collecting extra data. Email is the simplest,
          most private route. Include your order number for anything order-related.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <a
            href={`mailto:${site.email}`}
            className="group rounded-2xl border border-white/10 bg-[#0a0d19] p-5 transition hover:border-cyan-300/40"
          >
            <Mail size={20} className="text-cyan-300" aria-hidden="true" />
            <h2 className="mt-4 text-sm font-bold text-white">General & orders</h2>
            <p className="mt-1 text-sm text-slate-400">{site.email}</p>
            <p className="mt-3 text-[11px] text-slate-600">Usually within two business days.</p>
          </a>
          <a
            href={`mailto:${site.privacyEmail}`}
            className="group rounded-2xl border border-white/10 bg-[#0a0d19] p-5 transition hover:border-emerald-300/40"
          >
            <ShieldCheck size={20} className="text-emerald-300" aria-hidden="true" />
            <h2 className="mt-4 text-sm font-bold text-white">Privacy & data rights</h2>
            <p className="mt-1 text-sm text-slate-400">{site.privacyEmail}</p>
            <p className="mt-3 text-[11px] text-slate-600">Access, correction, export, erasure or objection.</p>
          </a>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2">
            <Building2 size={17} className="text-slate-400" aria-hidden="true" />
            <h2 className="text-sm font-bold text-white">Seller details</h2>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex flex-wrap gap-x-3">
              <dt className="text-slate-500">Legal name:</dt>
              <dd className="text-slate-300">{site.legalName || "To be completed before launch"}</dd>
            </div>
            <div className="flex flex-wrap gap-x-3">
              <dt className="text-slate-500">Registered address:</dt>
              <dd className="text-slate-300">{site.legalAddress || "To be completed before launch"}</dd>
            </div>
            {site.companyNumber && (
              <div className="flex flex-wrap gap-x-3">
                <dt className="text-slate-500">Company number:</dt>
                <dd className="text-slate-300">{site.companyNumber}</dd>
              </div>
            )}
            {site.vatId && (
              <div className="flex flex-wrap gap-x-3">
                <dt className="text-slate-500">VAT ID:</dt>
                <dd className="text-slate-300">{site.vatId}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { href: "/legal/shipping", label: "Shipping & returns" },
            { href: "/legal/privacy", label: "Privacy policy" },
            { href: "/legal/terms", label: "Terms of service" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-xs font-semibold text-slate-300 hover:border-cyan-300/40 hover:text-white"
            >
              {link.label} <ArrowRight size={13} aria-hidden="true" />
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-cyan-100">
            <ShoppingBag size={16} aria-hidden="true" /> Before you email about an order
          </p>
          <p className="mt-2 text-xs leading-6 text-cyan-100/70">
            Have your order ID ready. You can find it in{" "}
            <Link href="/account/orders" className="underline underline-offset-2">
              your account
            </Link>{" "}
            or the private confirmation link. Never email card details.
          </p>
        </div>
      </div>
    </div>
  );
}
