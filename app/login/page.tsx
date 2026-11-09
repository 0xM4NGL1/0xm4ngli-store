import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/security";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
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
      eyebrow="Welcome back"
      title="Sign in"
      description="Access your cart, wishlist, order history and data controls."
      footer={
        <p>
          New here?{" "}
          <Link
            href={`/register?next=${encodeURIComponent(next)}`}
            className="font-semibold text-cyan-200 hover:text-cyan-100"
          >
            Create an account
          </Link>
          . You can also{" "}
          <Link href="/cart" className="font-semibold text-cyan-200 hover:text-cyan-100">
            check out as a guest
          </Link>
          .
        </p>
      }
    >
      <LoginForm next={next} />
    </AuthShell>
  );
}
