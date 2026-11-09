"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  Heart,
  LoaderCircle,
  Lock,
} from "lucide-react";
import { formatPrice } from "@/lib/format";
import { getCountries } from "@/lib/countries";

const presets = [0, 500, 1000, 2500];

export function CheckoutPanel({
  signedIn,
  defaultEmail,
  subtotalCents,
  shippingCents,
  totalCents,
  bankConfigured,
}: {
  signedIn: boolean;
  defaultEmail: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  bankConfigured: boolean;
}) {
  const countries = useMemo(() => getCountries(), []);
  const [supportCents, setSupportCents] = useState(0);
  const [customSupport, setCustomSupport] = useState("");
  const [customActive, setCustomActive] = useState(false);
  const [email, setEmail] = useState(defaultEmail);
  const [name, setName] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const finalTotal = totalCents + supportCents;
  const disabled = loading || !bankConfigured;

  function chooseSupport(cents: number) {
    setSupportCents(cents);
    setCustomActive(false);
    setCustomSupport("");
  }

  function changeCustom(value: string) {
    setCustomSupport(value);
    setCustomActive(true);
    const parsed = Number(value.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setSupportCents(0);
      return;
    }
    setSupportCents(Math.min(50_000, Math.round(parsed * 100)));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          supportCents,
          shipping: {
            name,
            address: {
              line1,
              line2,
              city,
              postal_code: postalCode,
              country,
            },
          },
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!response.ok || !data.url) {
        setError(data.error ?? "Could not place the order.");
        setLoading(false);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Could not place the order. Check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-white">Delivery details</h2>
        <p className="mt-1 text-[11px] leading-5 text-slate-500">
          We only use this to fulfil your order and email the bank transfer
          instructions. It is never used for marketing.
        </p>
        <div className="mt-4 grid gap-3">
          <div>
            <label htmlFor="checkout-name" className="mb-1.5 block text-xs font-semibold text-slate-300">
              Full name
            </label>
            <input
              id="checkout-name"
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-10 w-full rounded-lg border border-white/15 bg-white/[0.03] px-3 text-sm text-white outline-none focus:border-cyan-300/60"
            />
          </div>
          {!signedIn && (
            <div>
              <label htmlFor="checkout-email" className="mb-1.5 block text-xs font-semibold text-slate-300">
                Email for order updates
              </label>
              <input
                id="checkout-email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-10 w-full rounded-lg border border-white/15 bg-white/[0.03] px-3 text-sm text-white outline-none focus:border-cyan-300/60"
              />
            </div>
          )}
          <div>
            <label htmlFor="checkout-line1" className="mb-1.5 block text-xs font-semibold text-slate-300">
              Address line 1
            </label>
            <input
              id="checkout-line1"
              required
              minLength={3}
              maxLength={200}
              autoComplete="address-line1"
              value={line1}
              onChange={(event) => setLine1(event.target.value)}
              className="h-10 w-full rounded-lg border border-white/15 bg-white/[0.03] px-3 text-sm text-white outline-none focus:border-cyan-300/60"
            />
          </div>
          <div>
            <label htmlFor="checkout-line2" className="mb-1.5 block text-xs font-semibold text-slate-300">
              Address line 2 <span className="font-normal text-slate-600">(optional)</span>
            </label>
            <input
              id="checkout-line2"
              maxLength={200}
              autoComplete="address-line2"
              value={line2}
              onChange={(event) => setLine2(event.target.value)}
              className="h-10 w-full rounded-lg border border-white/15 bg-white/[0.03] px-3 text-sm text-white outline-none focus:border-cyan-300/60"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="checkout-city" className="mb-1.5 block text-xs font-semibold text-slate-300">
                City
              </label>
              <input
                id="checkout-city"
                required
                maxLength={100}
                autoComplete="address-level2"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="h-10 w-full rounded-lg border border-white/15 bg-white/[0.03] px-3 text-sm text-white outline-none focus:border-cyan-300/60"
              />
            </div>
            <div>
              <label htmlFor="checkout-postal" className="mb-1.5 block text-xs font-semibold text-slate-300">
                Postal code
              </label>
              <input
                id="checkout-postal"
                required
                maxLength={30}
                autoComplete="postal-code"
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value)}
                className="h-10 w-full rounded-lg border border-white/15 bg-white/[0.03] px-3 text-sm text-white outline-none focus:border-cyan-300/60"
              />
            </div>
          </div>
          <div>
            <label htmlFor="checkout-country" className="mb-1.5 block text-xs font-semibold text-slate-300">
              Country
            </label>
            <select
              id="checkout-country"
              required
              autoComplete="country"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="h-10 w-full rounded-lg border border-white/15 bg-[#0a0d19] px-3 text-sm text-slate-200"
            >
              <option value="">Select country</option>
              {countries.map((entry) => (
                <option key={entry.code} value={entry.code}>
                  {entry.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-5">
        <div className="flex items-center gap-2">
          <Heart size={16} className="text-fuchsia-300" aria-hidden="true" />
          <h2 className="text-sm font-bold text-white">Support the store</h2>
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
            Optional
          </span>
        </div>
        <p className="mt-1 text-[11px] leading-5 text-slate-500">
          Add any amount to your bank transfer to support independent price
          research and the running costs. It is voluntary, not a product, and
          does not buy extra goods.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {presets.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => chooseSupport(value)}
              aria-pressed={!customActive && supportCents === value}
              className={
                !customActive && supportCents === value
                  ? "rounded-full border border-fuchsia-300/40 bg-fuchsia-300/10 px-3 py-1.5 text-xs font-semibold text-fuchsia-200"
                  : "rounded-full border border-white/15 px-3 py-1.5 text-xs text-slate-400 hover:border-fuchsia-300/30 hover:text-white"
              }
            >
              {value === 0 ? "No extra" : formatPrice(value)}
            </button>
          ))}
          <div className="flex items-center rounded-full border border-white/15 bg-white/[0.03] px-3">
            <span className="text-xs text-slate-500">€</span>
            <label htmlFor="support-amount" className="sr-only">
              Custom support amount in euro
            </label>
            <input
              id="support-amount"
              type="number"
              min="0"
              max="500"
              step="0.01"
              inputMode="decimal"
              placeholder="Custom"
              value={customSupport}
              onChange={(event) => changeCustom(event.target.value)}
              className="h-8 w-24 bg-transparent px-1 text-xs text-white outline-none placeholder:text-slate-600"
            />
          </div>
        </div>
        {supportCents > 0 && (
          <p className="mt-2 text-[11px] text-fuchsia-200/80">
            Added support: {formatPrice(supportCents)}
          </p>
        )}
      </div>

      <div className="border-t border-white/10 pt-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-slate-400">Products + shipping</span>
          <span className="text-sm font-semibold text-white">
            {formatPrice(subtotalCents + shippingCents)}
          </span>
        </div>
        {supportCents > 0 && (
          <div className="mt-1 flex items-center justify-between gap-3">
            <span className="text-sm text-slate-400">Voluntary support</span>
            <span className="text-sm font-semibold text-fuchsia-200">
              {formatPrice(supportCents)}
            </span>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
          <span className="text-base font-bold text-white">Transfer total</span>
          <span className="text-xl font-black text-white">
            {formatPrice(finalTotal)}
          </span>
        </div>

        <p className="mt-3 flex items-start gap-2 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.04] p-3 text-[11px] leading-5 text-cyan-100/75">
          <Building2 size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
          You will receive the IBAN, BIC and a unique payment reference after
          placing the order. Stock is reserved for 7 days while the bank
          transfer clears. No card details are requested.
        </p>

        {!bankConfigured && (
          <p className="mt-3 rounded-lg border border-amber-300/20 bg-amber-300/[0.05] p-3 text-[11px] text-amber-100/80" role="status">
            Bank transfer details are not configured yet. Set{" "}
            <code>BANK_ACCOUNT_NAME</code> and <code>BANK_IBAN</code> before
            accepting orders.
          </p>
        )}

        {error && (
          <p className="mt-3 rounded-lg border border-rose-300/20 bg-rose-300/[0.06] p-3 text-xs text-rose-200" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={disabled}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 via-cyan-200 to-fuchsia-300 px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-slate-950 shadow-[0_0_35px_-10px_rgba(34,211,238,0.6)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
          ) : (
            <Lock size={16} aria-hidden="true" />
          )}
          {loading ? "Creating order…" : "Place order & get bank details"}
          {!loading && <ArrowRight size={15} aria-hidden="true" />}
        </button>
        <p className="mt-3 text-center text-[10px] leading-5 text-slate-600">
          By placing the order you agree to the{" "}
          <a href="/legal/terms" className="underline underline-offset-2 hover:text-slate-400">
            terms
          </a>{" "}
          and{" "}
          <a href="/legal/privacy" className="underline underline-offset-2 hover:text-slate-400">
            privacy policy
          </a>
          .
        </p>
      </div>
      <span className="sr-only" aria-live="polite">
        {supportCents > 0 ? `Support amount ${formatPrice(supportCents)}` : ""}
      </span>
    </form>
  );
}
