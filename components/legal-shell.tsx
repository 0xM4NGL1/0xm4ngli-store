import Link from "next/link";
import { FileText, ShieldCheck } from "lucide-react";
import { site } from "@/lib/site";

const links = [
  { href: "/legal/privacy", label: "Privacy policy" },
  { href: "/legal/terms", label: "Terms of service" },
  { href: "/legal/cookies", label: "Cookie policy" },
  { href: "/legal/shipping", label: "Shipping & returns" },
  { href: "/legal/accessibility", label: "Accessibility" },
  { href: "/contact", label: "Contact" },
];

export function LegalShell({
  title,
  description,
  updated,
  children,
}: {
  title: string;
  description: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-m4 py-10 md:py-16">
      <div className="grid gap-10 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-24">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
              Legal & info
            </p>
            <nav className="mt-4 flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible" aria-label="Legal pages">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 hidden rounded-xl border border-white/10 bg-white/[0.02] p-4 text-[11px] leading-5 text-slate-500 lg:block">
              <p className="flex items-center gap-2 font-semibold text-slate-300">
                <ShieldCheck size={14} className="text-emerald-300" aria-hidden="true" />
                Privacy-first
              </p>
              <p className="mt-1">
                No analytics cookies, no data sales, no hidden marketing
                subscriptions.
              </p>
            </div>
          </div>
        </aside>

        <article className="lg:col-span-9">
          <div className="border-b border-white/10 pb-6">
            <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              <FileText size={13} aria-hidden="true" /> Last updated {updated}
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white md:text-5xl">
              {title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
              {description}
            </p>
          </div>

          {(!site.legalName || !site.legalAddress) && (
            <div className="mt-6 rounded-xl border border-amber-300/20 bg-amber-300/[0.05] p-4 text-xs leading-6 text-amber-100/80">
              <strong className="text-amber-100">Operator note:</strong> the seller
              legal name and registered address are not configured yet. Set{" "}
              <code>LEGAL_NAME</code>, <code>LEGAL_ADDRESS</code> and{" "}
              <code>LEGAL_JURISDICTION</code> before launch. These documents are a
              technical starting point, not legal advice; have them reviewed for
              your jurisdiction.
            </div>
          )}

          <div className="legal-prose mt-4">{children}</div>

          <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-xs leading-6 text-slate-500">
            <p>
              Questions about this page? Email{" "}
              <a href={`mailto:${site.privacyEmail}`} className="text-cyan-200 underline underline-offset-2">
                {site.privacyEmail}
              </a>
              . For data protection complaints, you may also contact your local
              supervisory authority.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
