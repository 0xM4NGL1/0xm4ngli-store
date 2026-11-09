import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  RotateCcw,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { getCartSummary } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";
import { isBankTransferConfigured } from "@/lib/payments";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/product-image";
import { CartLineControls } from "@/components/cart-line-controls";
import { CheckoutPanel } from "@/components/checkout-panel";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Your cart",
  robots: { index: false, follow: false },
};

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const cancelled = params.checkout === "cancelled";
  const cart = await getCartSummary();
  const user = await getCurrentUser();
  const bankConfigured = isBankTransferConfigured();

  if (cart.lines.length === 0) {
    return (
      <div className="container-m4 py-20">
        <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-[#0a0d19] p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
            <ShoppingBag size={28} className="text-slate-500" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-white">
            Your cart is empty
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Find something worth buying at the right moment. Products show recorded
            price observations and a clear buy signal as the data arrives.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-6 py-3.5 text-xs font-black uppercase tracking-[0.12em] text-slate-950 hover:bg-fuchsia-300"
          >
            Shop all tech <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-m4 py-10 md:py-14">
      <nav aria-label="Breadcrumb" className="mb-5 text-xs text-slate-500">
        <Link href="/" className="hover:text-cyan-200">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-300">Cart</span>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
            Checkout
          </p>
          <h1 className="neon-text mt-2 text-4xl font-black tracking-[-0.05em] text-white">
            Your cart
          </h1>
        </div>
        <Link href="/shop" className="text-xs font-semibold text-slate-400 hover:text-cyan-200">
          Continue shopping
        </Link>
      </div>

      {cancelled && (
        <div className="mt-6 rounded-xl border border-amber-300/20 bg-amber-300/[0.05] p-4 text-sm text-amber-100" role="status">
          Checkout was cancelled. Your cart is still here.
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <section className="lg:col-span-8" aria-label="Cart items">
          <ul className="neon-card divide-y divide-white/10 overflow-hidden rounded-2xl bg-[#0a0d19]">
            {cart.lines.map(({ product, quantity }) => (
              <li key={product.id} className="flex gap-4 p-4 sm:p-5">
                <Link
                  href={`/product/${product.slug}`}
                  className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 sm:h-28 sm:w-32"
                >
                  <ProductImage
                    src={product.image}
                    alt={product.name}
                    sizes="128px"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">
                        {product.brand}
                      </p>
                      <h2 className="mt-0.5 truncate text-sm font-bold text-white sm:text-base">
                        <Link href={`/product/${product.slug}`} className="hover:text-cyan-100">
                          {product.name}
                        </Link>
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        {product.available > 0
                          ? `${product.available} in stock`
                          : "Out of stock"}{" "}
                        · {product.isDemo ? "Demo item" : product.source}
                      </p>
                    </div>
                    <p className="text-base font-black text-white">
                      {formatPrice(product.priceCents * quantity, product.currency)}
                    </p>
                  </div>
                  <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                    <CartLineControls
                      productId={product.id}
                      quantity={quantity}
                      available={product.available}
                    />
                    <p className="font-mono text-[10px] text-slate-500">
                      {formatPrice(product.priceCents, product.currency)} each
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Truck, text: "Tracked worldwide shipping" },
              { icon: RotateCcw, text: "14-day return right" },
              { icon: Building2, text: "Bank transfer · no card details" },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-[11px] text-slate-400"
              >
                <item.icon size={14} className="text-cyan-300" aria-hidden="true" />
                {item.text}
              </div>
            ))}
          </div>

          <div className="neon-card mt-6 rounded-2xl bg-[#0a0d19] p-5 md:p-6">
            <CheckoutPanel
              signedIn={Boolean(user)}
              defaultEmail={user?.email ?? ""}
              subtotalCents={cart.subtotalCents}
              shippingCents={cart.shippingCents}
              totalCents={cart.totalCents}
              bankConfigured={bankConfigured}
            />
          </div>
        </section>

        <aside className="lg:col-span-4">
          <div className="neon-card glass-strong rounded-2xl p-5 lg:sticky lg:top-24">
            <h2 className="text-lg font-black text-white">Order summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">Subtotal</dt>
                <dd className="font-semibold text-white">
                  {formatPrice(cart.subtotalCents)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">Shipping</dt>
                <dd className="font-semibold text-white">
                  {cart.shippingCents === 0 ? "Free" : formatPrice(cart.shippingCents)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">Tax</dt>
                <dd className="text-xs text-slate-500">Included where applicable</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-white/10 pt-4">
                <dt className="text-base font-bold text-white">Total before support</dt>
                <dd className="text-xl font-black text-white">
                  {formatPrice(cart.totalCents)}
                </dd>
              </div>
            </dl>

            {cart.freeShippingRemainingCents > 0 ? (
              <div className="mt-4 rounded-xl border border-cyan-300/15 bg-cyan-300/[0.04] p-3">
                <p className="text-[11px] text-cyan-100/80">
                  Add {formatPrice(cart.freeShippingRemainingCents)} for free
                  tracked shipping.
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-cyan-300"
                    style={{
                      width: `${Math.min(100, (cart.subtotalCents / site.freeShippingThresholdCents) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="mt-4 flex items-center gap-1.5 text-[11px] text-emerald-200">
                <Check size={13} aria-hidden="true" /> Free tracked shipping unlocked
              </p>
            )}

            <div className="mt-5 rounded-xl border border-cyan-300/15 bg-cyan-300/[0.04] p-3">
              <p className="flex items-center gap-2 text-[11px] font-bold text-cyan-100">
                <Building2 size={14} aria-hidden="true" />
                Pay by bank transfer
              </p>
              <p className="mt-1 text-[11px] leading-5 text-cyan-100/70">
                Place the order, then send the exact amount with your unique
                reference. No card details are requested. Stock is reserved for 7
                days.
              </p>
            </div>

            <p className="mt-4 text-center text-[11px] leading-5 text-slate-500">
              {user
                ? `Checking out as ${user.email}.`
                : "Guest checkout is available. You can create an account later to keep your wishlist and order history."}
            </p>
            <p className="mt-2 text-center text-[10px] leading-5 text-slate-600">
              By ordering you agree to the{" "}
              <Link href="/legal/terms" className="underline underline-offset-2 hover:text-slate-400">
                terms
              </Link>{" "}
              and{" "}
              <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-slate-400">
                privacy policy
              </Link>
              . Optional support is added in the checkout form.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
