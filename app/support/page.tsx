import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Heart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { site } from "@/lib/site";
import { formatIban, getBankDetails } from "@/lib/payments";
import { SupportForm } from "@/components/support-form";

export const metadata: Metadata = {
  title: "Support the project",
  description:
    "Support 0xm4ngli's independent technology research and price tracking with a voluntary bank transfer.",
  alternates: { canonical: "/support" },
};

export default async function SupportPage() {
  const user = await getCurrentUser();
  const bank = getBankDetails();

  return (
    <div className="container-m4 py-12 md:py-20">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/25 bg-fuchsia-300/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-fuchsia-200">
            <Heart size={13} aria-hidden="true" />
            Keep it independent
          </div>
          <h1 className="neon-text-strong mt-5 text-4xl font-black leading-[0.98] tracking-[-0.05em] text-white md:text-5xl">
            Support the work.
            <span className="text-gradient block">Keep the signals free.</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">
            This store runs on authorised product data, a public codebase and no
            paid rankings. If it has helped you buy better, you can add a voluntary
            contribution. It is not a product, not an investment, and it does not
            unlock extra features.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-300" aria-hidden="true" />
              No card details. No subscription. No data sale.
            </li>
            <li className="flex items-start gap-2">
              <Building2 size={16} className="mt-0.5 shrink-0 text-cyan-300" aria-hidden="true" />
              Pay by SEPA or SWIFT bank transfer with a unique reference.
            </li>
            <li className="flex items-start gap-2">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-fuchsia-300" aria-hidden="true" />
              Support is voluntary and non-refundable except where the law requires it.
            </li>
          </ul>
        </div>

        <div className="lg:col-span-6">
          <div className="neon-card glass-strong rounded-2xl p-5 md:p-6">
            <h2 className="text-lg font-black text-white">Choose an amount</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              You will get a unique reference and the bank details after creating
              the support request.
            </p>
            <div className="mt-5">
              <SupportForm signedInEmail={user?.email ?? ""} />
            </div>
          </div>

          {bank.configured ? (
            <div className="neon-card mt-4 rounded-2xl bg-[#0a0d19] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Bank details
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-slate-500">Account name:</dt>
                  <dd className="text-slate-200">{bank.accountName}</dd>
                </div>
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-slate-500">IBAN:</dt>
                  <dd className="break-all font-mono text-slate-200">
                    {formatIban(bank.iban)}
                  </dd>
                </div>
                {bank.bic && (
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-slate-500">BIC:</dt>
                    <dd className="font-mono text-slate-200">{bank.bic}</dd>
                  </div>
                )}
              </dl>
              <p className="mt-3 text-[11px] leading-5 text-slate-500">
                These details are public so you can verify them. Always use the
                unique reference from your support request. We will never ask you to
                send money to a different account without an order reference.
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-4 text-xs leading-6 text-amber-100/80">
              Bank details are not configured yet. Set{" "}
              <code>BANK_ACCOUNT_NAME</code> and <code>BANK_IBAN</code> in the
              environment before accepting support.
            </div>
          )}

          <p className="mt-4 text-center text-[11px] leading-5 text-slate-600">
            Prefer to support through a purchase? Add an optional amount at{" "}
            <Link href="/cart" className="text-cyan-200 underline underline-offset-2">
              checkout
            </Link>
            . Read the{" "}
            <Link href="/legal/terms" className="text-cyan-200 underline underline-offset-2">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="text-cyan-200 underline underline-offset-2">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="neon-outline mx-auto mt-12 max-w-5xl rounded-2xl p-5 text-xs leading-6 text-slate-500">
        <p>
          <strong className="text-slate-300">What support pays for:</strong> feed
          access, hosting, domain, email and time spent recording and checking price
          observations. It does not create a legal partnership, equity, donation
          receipt for tax purposes, or any right to a product.
        </p>
        <p className="mt-2">
          <strong className="text-slate-300">Official project:</strong>{" "}
          <a
            href={site.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-200 underline underline-offset-2"
          >
            github.com/0xM4NGL1/0xm4ngli-store
          </a>
          . If this page is on a different domain, verify the official donation
          details in the repository before sending money. Forks must keep this
          notice under the licence.
        </p>
        <p className="mt-2">
          Need an invoice or have a question? Email{" "}
          <a href="mailto:hello@0xm4ngli.store" className="text-cyan-200 underline underline-offset-2">
            hello@0xm4ngli.store
          </a>{" "}
          with your reference.{" "}
          <Link href="/about" className="inline-flex items-center gap-1 text-cyan-200 underline underline-offset-2">
            About the project <ArrowRight size={11} aria-hidden="true" />
          </Link>
        </p>
      </div>
    </div>
  );
}
