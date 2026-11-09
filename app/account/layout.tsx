import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { AccountNav } from "@/components/account-nav";
import { LogoutButton } from "@/components/logout-button";
import { formatDate } from "@/lib/format";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  return (
    <div className="container-m4 py-10 md:py-14">
      <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
            Your account
          </p>
          <h1 className="neon-text mt-2 text-3xl font-black tracking-[-0.04em] text-white md:text-4xl">
            {user.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {user.email} · member since {formatDate(user.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/shop"
            className="rounded-lg border border-white/15 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-300/40 hover:text-white"
          >
            Continue shopping
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="mt-5">
        <AccountNav />
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}
