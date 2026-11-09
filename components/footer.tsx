import Link from "next/link";
import { ArrowUpRight, Mail, ShieldCheck } from "lucide-react";
import { categories, site } from "@/lib/site";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";

const helpLinks = [
  { href: "/legal/shipping", label: "Shipping & returns" },
  { href: "/legal/privacy", label: "Privacy policy" },
  { href: "/legal/cookies", label: "Cookie policy" },
  { href: "/legal/terms", label: "Terms of service" },
  { href: "/legal/accessibility", label: "Accessibility" },
  { href: "/contact", label: "Contact" },
  { href: "/support", label: "Support the project" },
];

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/10 bg-[#04050b]">
      <div className="neon-divider absolute left-0 right-0 top-0" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-[8%] h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute -bottom-32 right-[8%] h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[100px]" />
      </div>

      <div className="container-m4 relative py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              Technology chosen for what it does, not what it costs to advertise.
              Independent price history, clear recommendations and a store that
              respects your data.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.06] px-3 py-1.5 text-[11px] font-semibold text-emerald-200">
              <ShieldCheck size={14} aria-hidden="true" />
              Essential cookies only · no tracking
            </div>
            <a
              href={`mailto:${site.email}`}
              className="mt-4 flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-200"
            >
              <Mail size={15} aria-hidden="true" />
              {site.email}
            </a>
          </div>

          <div className="lg:col-span-2">
            <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              Shop
            </h2>
            <ul className="mt-5 space-y-3 text-sm">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/shop?category=${category.slug}`}
                    className="text-slate-400 transition hover:text-white"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              Help & legal
            </h2>
            <ul className="mt-5 space-y-3 text-sm">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              The useful email
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Real price drops, new arrivals and buying guides. No daily noise.
              Double opt-in, unsubscribe in one click.
            </p>
            <div className="mt-5">
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-3 text-xs leading-6 text-slate-500">
              <p>
                © {new Date().getFullYear()} {site.name}. All rights reserved.
                {site.legalName ? ` Seller: ${site.legalName}.` : ""}
              </p>
              <p>
                Orders are paid by bank transfer (SEPA or SWIFT) using the
                unique reference shown after checkout. We never request, receive
                or store card details. Your bank may charge its own transfer fee.
              </p>
              {site.demoCatalog && (
                <p className="rounded-lg border border-amber-300/20 bg-amber-300/[0.05] px-3 py-2 text-amber-200/80">
                  Demo catalogue: product prices and price history are
                  illustrative until an authorised live feed is connected.
                  Real bank-transfer orders for demo products are disabled by
                  default.
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
              <span className="neon-chip rounded-md px-2.5 py-1.5">
                Bank transfer
              </span>
              <span className="neon-chip rounded-md px-2.5 py-1.5">
                SEPA
              </span>
              <span className="neon-chip rounded-md px-2.5 py-1.5">
                SWIFT
              </span>
              <span className="neon-chip rounded-md px-2.5 py-1.5">
                EUR
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <Link href="/about" className="inline-flex items-center gap-1 hover:text-cyan-200">
              About 0xm4ngli <ArrowUpRight size={13} aria-hidden="true" />
            </Link>
            <Link href="/legal/privacy#rights" className="hover:text-cyan-200">
              Your GDPR rights
            </Link>
            <Link href="/legal/privacy#complaints" className="hover:text-cyan-200">
              Complaints
            </Link>
            <Link href="/support" className="hover:text-cyan-200">
              Official donation details
            </Link>
            <a
              href={site.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-200"
            >
              Source code
            </a>
            <Link href="/admin" className="hover:text-cyan-200">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
