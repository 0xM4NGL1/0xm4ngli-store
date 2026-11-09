import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { ResetPasswordForm } from "@/components/reset-password-form";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  if (!token) {
    return (
      <AuthShell
        eyebrow="Account recovery"
        title="Link is incomplete"
        description="This password reset link is missing its token. Request a new link to continue."
        footer={
          <Link href="/forgot-password" className="font-semibold text-cyan-200 hover:text-cyan-100">
            Request a new reset link
          </Link>
        }
      >
        <p className="rounded-xl border border-amber-300/20 bg-amber-300/[0.05] p-4 text-sm text-amber-100">
          For your security, reset links are single-use and expire after 30
          minutes.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Set a new password"
      description="Choose a strong password. All other sessions will be signed out after the change."
      footer={
        <Link href="/login" className="font-semibold text-cyan-200 hover:text-cyan-100">
          Back to sign in
        </Link>
      }
    >
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
