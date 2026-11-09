import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Check,
  Clock,
  Package,
  ShieldCheck,
  X,
} from "lucide-react";
import { getOrderByToken } from "@/lib/orders";
import {
  formatDateTime,
  formatPrice,
  formatShippingAddress,
} from "@/lib/format";
import { formatIban, getBankDetails } from "@/lib/payments";
import { site } from "@/lib/site";
import { CopyField } from "@/components/copy-field";
import { RefreshStatus } from "@/components/refresh-status";

export const metadata: Metadata = {
  title: "Order status",
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  if (!token) notFound();

  const order = await getOrderByToken(token);
  if (!order) notFound();

  const bank = getBankDetails();
  const paid = order.status === "paid";
  const pending = order.status === "pending";
  const supportOnly = order.items.length === 0;
  const reference = order.paymentReference ?? order.id;
  const address = formatShippingAddress(order.shipping);

  return (
    <div className="container-m4 py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="neon-card rounded-3xl bg-[#0a0d19] p-6 md:p-10">
          <div
            className={
              paid
                ? "flex h-14 w-14 items-center justify-center rounded-full bg-emerald-300/10 text-emerald-300"
                : pending
                  ? "flex h-14 w-14 items-center justify-center rounded-full bg-cyan-300/10 text-cyan-300"
                  : "flex h-14 w-14 items-center justify-center rounded-full bg-rose-300/10 text-rose-300"
            }
          >
            {paid ? (
              <Check size={26} aria-hidden="true" />
            ) : pending ? (
              <Clock size={26} aria-hidden="true" />
            ) : (
              <X size={26} aria-hidden="true" />
            )}
          </div>

          <p className="mt-5 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
            {paid ? "Payment received" : pending ? "Bank transfer" : "Order closed"}
          </p>
          <h1 className="neon-text mt-2 text-3xl font-black tracking-[-0.04em] text-white md:text-4xl">
            {paid
              ? "Payment received. Order confirmed."
              : pending
                ? supportOnly
                  ? "Thank you — support is reserved."
                  : "Your order is reserved."
                : "This order is no longer active."}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            {paid
              ? "The transfer has been matched and the order is confirmed. Keep this private link for your records."
              : pending
                ? "Send the exact amount below with the reference. Your order is confirmed after the transfer arrives and is matched. We reserve stock for 7 days."
                : "The transfer was not completed in time, or the order was cancelled. Reserved stock has been released. You can start a new order from the cart."}
          </p>

          {pending && (
            <>
              <div className="neon-outline mt-6 rounded-2xl p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-cyan-100">
                  <Building2 size={16} aria-hidden="true" />
                  Send the bank transfer
                </p>
                <p className="mt-1 text-xs leading-5 text-cyan-100/70">
                  Use the exact amount and reference. The account name must match
                  the seller&apos;s bank details. Your bank may charge a transfer
                  fee; send the full amount in EUR.
                </p>

                {bank.configured ? (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <CopyField
                      label="Amount (EUR)"
                      value={(order.totalCents / 100).toFixed(2)}
                      display={formatPrice(order.totalCents, order.currency)}
                    />
                    <CopyField label="Payment reference" value={reference} />
                    <CopyField
                      label="IBAN"
                      value={bank.iban}
                      display={formatIban(bank.iban)}
                    />
                    <CopyField
                      label="Account name"
                      value={bank.accountName}
                      mono={false}
                    />
                    {bank.bic && <CopyField label="BIC / SWIFT" value={bank.bic} />}
                    {bank.bankName && (
                      <CopyField label="Bank" value={bank.bankName} mono={false} />
                    )}
                    <CopyField
                      label="Currency"
                      value="EUR"
                      display="EUR (euro)"
                    />
                  </div>
                ) : (
                  <p className="mt-3 rounded-lg border border-amber-300/20 bg-amber-300/[0.05] p-3 text-xs text-amber-100/80">
                    Bank details are not configured on this store yet. Email{" "}
                    <a href={`mailto:${site.email}`} className="underline underline-offset-2">
                      {site.email}
                    </a>{" "}
                    with order {order.id} and do not send money until you receive
                    verified details.
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <RefreshStatus />
                  <p className="text-[11px] text-cyan-100/60">
                    After sending, keep the reference. We check transfers manually
                    and confirm the order.
                  </p>
                </div>
              </div>

              {bank.configured && (
                <p className="mt-3 text-[11px] leading-5 text-slate-500">
                  Safety note: these details are shown only on this private order
                  page and in the order email. We will never email you a different
                  IBAN without an order reference. If anything looks wrong, contact{" "}
                  <a href={`mailto:${site.email}`} className="text-cyan-200 underline underline-offset-2">
                    {site.email}
                  </a>{" "}
                  before sending.
                </p>
              )}
            </>
          )}

          {paid && (
            <div className="mt-6 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.05] p-4 text-sm text-emerald-100">
              <p className="flex items-center gap-2 font-bold">
                <ShieldCheck size={16} aria-hidden="true" /> Transfer matched
              </p>
              <p className="mt-1 text-xs leading-5 text-emerald-100/70">
                Reference {reference} · {formatPrice(order.totalCents, order.currency)}.
                We will prepare the order for dispatch.
              </p>
            </div>
          )}

          <div className="mt-6 grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs sm:grid-cols-3">
            <div>
              <p className="text-slate-500">Order</p>
              <p className="mt-1 font-mono text-slate-200">{order.id}</p>
            </div>
            <div>
              <p className="text-slate-500">Placed</p>
              <p className="mt-1 text-slate-200">{formatDateTime(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-slate-500">Status</p>
              <p className="mt-1 font-semibold capitalize text-slate-200">
                {pending ? "Awaiting bank transfer" : order.status}
              </p>
            </div>
          </div>

          {!supportOnly && (
            <div className="mt-6">
              <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                <Package size={16} className="text-cyan-300" aria-hidden="true" />
                Items
              </h2>
              <ul className="mt-3 divide-y divide-white/10 rounded-xl border border-white/10">
                {order.items.map((item) => (
                  <li key={item.sku} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <span className="min-w-0 text-slate-300">
                      <span className="text-slate-500">{item.quantity} × </span>
                      {item.name}
                    </span>
                    <span className="shrink-0 font-semibold text-white">
                      {formatPrice(item.unitPriceCents * item.quantity, order.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <dl className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
            {!supportOnly && (
              <>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-400">Subtotal</dt>
                  <dd className="text-slate-200">{formatPrice(order.subtotalCents, order.currency)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-400">Shipping</dt>
                  <dd className="text-slate-200">
                    {order.shippingCents === 0 ? "Free" : formatPrice(order.shippingCents, order.currency)}
                  </dd>
                </div>
              </>
            )}
            {order.supportCents > 0 && (
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">Voluntary support</dt>
                <dd className="text-fuchsia-200">{formatPrice(order.supportCents, order.currency)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-3 border-t border-white/10 pt-3 text-base">
              <dt className="font-bold text-white">Total</dt>
              <dd className="font-black text-white">{formatPrice(order.totalCents, order.currency)}</dd>
            </div>
          </dl>

          {order.email && (
            <p className="mt-4 text-xs text-slate-500">
              Order email: <span className="text-slate-300">{order.email}</span>
            </p>
          )}

          {address.length > 0 && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs leading-6 text-slate-400">
              <p className="font-semibold text-slate-200">Shipping to</p>
              <p className="mt-1">{address.join(", ")}</p>
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-xs font-black uppercase tracking-wide text-slate-950 hover:bg-fuchsia-300"
            >
              Continue shopping <ArrowRight size={14} aria-hidden="true" />
            </Link>
            <Link
              href="/account/orders"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-xs font-bold text-slate-300 hover:border-cyan-300/40 hover:text-white"
            >
              <ShieldCheck size={14} aria-hidden="true" /> Order history
            </Link>
          </div>
        </div>

        <p className="mt-5 text-center text-[11px] leading-5 text-slate-600">
          Keep this private link to check your order. It contains no card details.
          Questions? Email{" "}
          <a href={`mailto:${site.email}`} className="underline underline-offset-2 hover:text-slate-400">
            {site.email}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
