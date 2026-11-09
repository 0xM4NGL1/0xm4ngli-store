import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { PasswordForm } from "@/components/password-form";
import { PrivacyActions } from "@/components/privacy-actions";
import { SignOutEverywhere } from "@/components/sign-out-everywhere";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Security & data",
  robots: { index: false, follow: false },
};

export default async function SecurityPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/security");

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-7">
        <section className="neon-card rounded-2xl bg-[#0a0d19] p-5 md:p-6">
          <div className="flex items-center gap-2">
            <KeyRound size={18} className="text-cyan-300" aria-hidden="true" />
            <h2 className="text-lg font-black text-white">Password</h2>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Changing your password signs out all other devices. Your current
            session is renewed securely.
          </p>
          <div className="mt-5">
            <PasswordForm />
          </div>
        </section>

        <section className="neon-card rounded-2xl bg-[#0a0d19] p-5 md:p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-300" aria-hidden="true" />
            <h2 className="text-lg font-black text-white">Sessions</h2>
          </div>
          <div className="mt-4">
            <SignOutEverywhere />
          </div>
          <p className="mt-3 text-[11px] leading-5 text-slate-600">
            Sessions are stored as hashed tokens, expire after 30 days and are
            never accessible to client-side JavaScript.
          </p>
        </section>
      </div>

      <section className="lg:col-span-5">
        <div className="neon-card rounded-2xl bg-[#0a0d19] p-5 md:p-6">
          <h2 className="text-lg font-black text-white">Privacy controls</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Export, correct or erase the data linked to your account.
          </p>
          <div className="mt-5">
            <PrivacyActions />
          </div>
          <p className="mt-5 text-[11px] leading-5 text-slate-600">
            Need help? Email{" "}
            <a href={`mailto:${site.email}`} className="underline underline-offset-2 hover:text-slate-400">
              {site.email}
            </a>{" "}
            or read the{" "}
            <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-slate-400">
              privacy policy
            </Link>
            . You also have the right to complain to your local data protection
            authority.
          </p>
        </div>
      </section>
    </div>
  );
}
