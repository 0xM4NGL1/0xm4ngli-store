import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ShieldCheck,
  Truck,
} from "lucide-react";
import {
  MAX_QUANTITY,
  getCartCount,
  getSummaryForCheckoutLines,
} from "@/lib/cart";
import { getProductBySlug } from "@/lib/products";
import { getCurrentUser } from "@/lib/auth";
import { isBankTransferConfigured } from "@/lib/payments";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/product-image";
import { CheckoutPanel } from "@/components/checkout-panel";
import { site } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product ? `Buy ${product.name}` : "Buy now",
    robots: { index: false, follow: false },
  };
}

function parseQuantity(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw ?? 1);
  if (!Number.isInteger(parsed) || parsed < 1) return 1;
  return Math.min(parsed, MAX_QUANTITY);
}

export default async function BuyNowCheckoutPage({
  params,
  searchParams,
}: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  if (product.available < 1) {
    redirect(`/product/${product.slug}#buy`);
  }

  const requestedQuantity = parseQuantity(query.quantity);
  const quantity = Math.min(requestedQuantity, product.available);
  const requestedSize =
    typeof query.size === "string" ? query.size.trim().slice(0, 30) : "";
  if (product.sizes.length > 0 && !product.sizes.includes(requestedSize)) {
    redirect(`/product/${product.slug}#buy`);
  }
  const size = product.sizes.length > 0 ? requestedSize : "";

  const [user, cartCount, summary] = await Promise.all([
    getCurrentUser(),
    getCartCount(),
    getSummaryForCheckoutLines([{ productId: product.id, quantity, size }]),
  ]);
  const line = summary.lines[0];
  if (!line) notFound();

  const bankConfigured = isBankTransferConfigured();
  const cartLabel = `${cartCount} ${cartCount === 1 ? "item" : "items"}`;
  const quantityAdjusted = requestedQuantity > quantity;

  return (
    <div className="container-m4 py-10 md:py-14">
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-cyan-200">Home</Link>
        <span>/</span>
        <Link href={`/product/${product.slug}`} className="hover:text-cyan-200">
          {product.name}
        </Link>
        <span>/</span>
        <span className="text-slate-300">Buy now</span>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
            Buy now
          </p>
          <h1 className="neon-text mt-2 text-4xl font-black tracking-[-0.05em] text-white">
            Checkout this item
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
            This order is only for {product.name}.{" "}
            {cartCount > 0
              ? `Your cart with ${cartLabel} stays unchanged.`
              : "Your cart is not used for this order."}
          </p>
        </div>
        <Link
          href={`/product/${product.slug}#buy`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-200"
        >
          <ArrowLeft size={13} aria-hidden="true" /> Back to product
        </Link>
      </div>

      {quantityAdjusted && (
        <div className="mt-6 rounded-xl border border-amber-300/20 bg-amber-300/[0.05] p-4 text-sm text-amber-100" role="status">
          Only {product.available} left in stock, so the quantity was adjusted
          to {quantity}.
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <section className="lg:col-span-8" aria-label="Item to buy">
          <ul className="neon-card divide-y divide-[#c4b5fd]/12 overflow-hidden rounded-2xl bg-[#0b051d]">
            <li className="flex gap-4 p-4 sm:p-5">
              <Link
                href={`/product/${product.slug}`}
                className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl border border-[#c4b5fd]/12 bg-slate-900 sm:h-28 sm:w-32"
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
                      {size && (
                        <>
                          <span className="text-slate-400">Size {size}</span>
                          {" · "}
                        </>
                      )}
                      Quantity {line.quantity} ·{" "}
                      {product.available > 0
                        ? `${product.available} in stock`
                        : "Out of stock"}
                    </p>
                  </div>
                  <p className="text-base font-black text-white">
                    {formatPrice(product.priceCents * line.quantity, product.currency)}
                  </p>
                </div>
                <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                    Reserved at checkout
                  </span>
                  <p className="font-mono text-[10px] text-slate-500">
                    {formatPrice(product.priceCents, product.currency)} each
                  </p>
                </div>
              </div>
            </li>
          </ul>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Truck, text: "Tracked worldwide shipping" },
              { icon: ShieldCheck, text: "14-day return right" },
              { icon: Building2, text: "Bank transfer · no card details" },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-2 rounded-xl border border-[#c4b5fd]/12 bg-[#0b051d]/70 px-3 py-2.5 text-[11px] text-slate-400"
              >
                <item.icon size={14} className="text-cyan-300" aria-hidden="true" />
                {item.text}
              </div>
            ))}
          </div>

          <div className="neon-card mt-6 rounded-2xl bg-[#0b051d] p-5 md:p-6">
            <CheckoutPanel
              signedIn={Boolean(user)}
              defaultEmail={user?.email ?? ""}
              subtotalCents={summary.subtotalCents}
              shippingCents={summary.shippingCents}
              totalCents={summary.totalCents}
              bankConfigured={bankConfigured}
              lines={summary.lines.map((entry) => ({
                productId: entry.product.id,
                name: entry.product.name,
                size: entry.size,
                quantity: entry.quantity,
                unitPriceCents: entry.product.priceCents,
                currency: entry.product.currency,
              }))}
              items={[
                {
                  productId: product.id,
                  quantity: line.quantity,
                  size: line.size,
                },
              ]}
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
                  {formatPrice(summary.subtotalCents, product.currency)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">Shipping</dt>
                <dd className="font-semibold text-white">
                  {summary.shippingCents === 0
                    ? "Free"
                    : formatPrice(summary.shippingCents, product.currency)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">Tax</dt>
                <dd className="text-xs text-slate-500">Included where applicable</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-[#c4b5fd]/12 pt-4">
                <dt className="text-base font-bold text-white">Total before support</dt>
                <dd className="text-xl font-black text-white">
                  {formatPrice(summary.totalCents, product.currency)}
                </dd>
              </div>
            </dl>

            {summary.freeShippingRemainingCents > 0 ? (
              <div className="mt-4 rounded-xl border border-cyan-300/15 bg-cyan-300/[0.04] p-3">
                <p className="text-[11px] text-cyan-100/80">
                  Add {formatPrice(summary.freeShippingRemainingCents, product.currency)} for free
                  tracked shipping.
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#c4b5fd]/12">
                  <div
                    className="h-full rounded-full bg-cyan-300"
                    style={{
                      width: `${Math.min(100, (summary.subtotalCents / site.freeShippingThresholdCents) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="mt-4 flex items-center gap-1.5 text-[11px] text-emerald-200">
                <Check size={13} aria-hidden="true" /> Free tracked shipping included
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
                : "Guest checkout is available. You can create an account later to keep your order history."}
            </p>

            {cartCount > 0 && (
              <p className="mt-4 rounded-xl border border-[#c4b5fd]/12 bg-[#0b051d]/70 p-3 text-center text-[11px] leading-5 text-slate-500">
                Your cart with {cartLabel} is not part of this order.{" "}
                <Link href="/cart" className="inline-flex items-center gap-1 font-semibold text-cyan-200 hover:text-cyan-100">
                  Checkout the whole cart instead <ArrowRight size={12} aria-hidden="true" />
                </Link>
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
