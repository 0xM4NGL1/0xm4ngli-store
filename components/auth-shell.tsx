import Link from "next/link";
import { ChartNoAxesCombined, Lock, ShieldCheck } from "lucide-react";
import { Logo } from "./logo";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="container-m4 py-12 md:py-20">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#080a14] shadow-2xl lg:grid-cols-2">
        <div className="relative hidden overflow-hidden p-10 lg:block">
          <div className="absolute inset-0 bg-grid opacity-50" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.18),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(232,121,249,0.16),transparent_40%)]" />
          <div className="relative flex h-full flex-col">
            <Logo />
            <div className="mt-auto">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
                Members get context
              </p>
              <h2 className="mt-3 text-3xl font-black leading-tight tracking-[-0.04em] text-white">
                Save the things you want.
                <br />
                Know when to buy them.
              </h2>
              <ul className="mt-8 space-y-4 text-sm text-slate-400">
                <li className="flex items-start gap-3">
                  <ChartNoAxesCombined size={17} className="mt-0.5 shrink-0 text-cyan-300" aria-hidden="true" />
                  Wishlists, carts and orders in one place.
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck size={17} className="mt-0.5 shrink-0 text-emerald-300" aria-hidden="true" />
                  Export or delete your data any time.
                </li>
                <li className="flex items-start gap-3">
                  <Lock size={17} className="mt-0.5 shrink-0 text-fuchsia-300" aria-hidden="true" />
                  Card details never touch this store.
                </li>
              </ul>
            </div>
            <p className="mt-10 text-[11px] leading-5 text-slate-600">
              Your account stores a name, email and password hash. Nothing else is
              required to browse, save or shop.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="lg:hidden">
            <Logo />
          </div>
          <p className="mt-8 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300 lg:mt-0">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
          <div className="mt-7">{children}</div>
          {footer && <div className="mt-6 text-sm text-slate-400">{footer}</div>}
          <p className="mt-8 text-[11px] leading-5 text-slate-600">
            By using an account you agree to our{" "}
            <Link href="/legal/terms" className="underline underline-offset-2 hover:text-slate-400">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-slate-400">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
