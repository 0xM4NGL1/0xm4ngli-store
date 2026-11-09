import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Forgot password?"
      description="Enter your account email and we will send a time-limited reset link. The response is always the same so nobody can probe for accounts."
      footer={
        <p>
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-cyan-200 hover:text-cyan-100">
            Back to sign in
          </Link>
          .
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
