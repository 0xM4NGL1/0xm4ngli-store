import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/security";
import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/components/register-form";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false, follow: false },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next, "/account");
  const user = await getCurrentUser();
  if (user) redirect(next);

  return (
    <AuthShell
      eyebrow="Join the store"
      title="Create an account"
      description="Save products, keep your cart across devices and control your data. No marketing unless you opt in."
      footer={
        <p>
          Already have an account?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="font-semibold text-cyan-200 hover:text-cyan-100"
          >
            Sign in
          </Link>
          .
        </p>
      }
    >
      <RegisterForm next={next} />
    </AuthShell>
  );
}
