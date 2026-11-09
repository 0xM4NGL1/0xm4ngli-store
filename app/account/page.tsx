import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Heart,
  Package,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/orders";
import { getWishlistCount } from "@/lib/wishlist";
import { getCartCount } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { ProfileForm } from "@/components/profile-form";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  const [orders, wishlistCount, cartCount] = await Promise.all([
    getOrdersForUser(user.id),
    getWishlistCount(user.id),
    getCartCount(),
  ]);
  const totalSpent = orders
    .filter((order) => order.status === "paid")
    .reduce((total, order) => total + order.totalCents, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <section className="lg:col-span-7">
        <div className="neon-card rounded-2xl bg-[#0a0d19] p-5 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                Profile
              </p>
              <h2 className="mt-1 text-xl font-black text-white">Your details</h2>
            </div>
            <ShieldCheck size={22} className="text-emerald-300" aria-hidden="true" />
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            We store your name, email and a slow password hash. Nothing else is
            required. You can change or export everything below.
          </p>
          <div className="mt-6">
            <ProfileForm
              name={user.name}
              email={user.email}
              marketingConsent={user.marketingConsent}
            />
          </div>
        </div>

        <div className="neon-outline mt-6 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-white">What we do not do</h2>
          <ul className="mt-3 grid gap-2 text-xs leading-5 text-slate-400 sm:grid-cols-2">
            {[
              "No analytics or advertising cookies",
              "No data sold or shared for marketing",
              "No card details stored on this site",
              "No dark patterns or hidden subscriptions",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <ShieldCheck size={13} className="mt-0.5 shrink-0 text-emerald-300" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/account/security"
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-cyan-200 hover:text-cyan-100"
          >
            Manage data and password <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <aside className="space-y-4 lg:col-span-5">
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              href: "/account/orders",
              icon: Package,
              label: "Orders",
              value: String(orders.length),
            },
            {
              href: "/wishlist",
              icon: Heart,
              label: "Wishlist",
              value: String(wishlistCount),
            },
            {
              href: "/cart",
              icon: ShoppingBag,
              label: "In cart",
              value: String(cartCount),
            },
            {
              href: "/account/orders",
              icon: ShieldCheck,
              label: "Paid total",
              value: formatPrice(totalSpent),
            },
          ].map((item) => (
            <Link
              key={item.label + item.href}
              href={item.href}
              className="neon-card rounded-2xl bg-[#0a0d19] p-4 transition"
            >
              <item.icon size={17} className="text-cyan-300" aria-hidden="true" />
              <p className="mt-3 text-2xl font-black text-white">{item.value}</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {item.label}
              </p>
            </Link>
          ))}
        </div>

        <div className="neon-card rounded-2xl bg-gradient-to-br from-[#0d1022] to-[#0a0d19] p-5">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-300">
            Member benefit
          </p>
          <h2 className="mt-2 text-lg font-black text-white">
            Your wishlist remembers the context.
          </h2>
          <p className="mt-2 text-xs leading-6 text-slate-400">
            Saved products keep their price history. Open your wishlist to see
            which ones are at a 90-day low.
          </p>
          <Link
            href="/wishlist"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2 text-xs font-bold text-slate-200 hover:border-fuchsia-300/40 hover:text-fuchsia-200"
          >
            Open wishlist <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </aside>
    </div>
  );
}
