"use client";

import { useState } from "react";
import { Heart, LoaderCircle, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/format";

const presets = [500, 1000, 2500, 5000];

export function SupportForm({ signedInEmail }: { signedInEmail: string }) {
  const [amountCents, setAmountCents] = useState(1000);
  const [custom, setCustom] = useState("");
  const [customActive, setCustomActive] = useState(false);
  const [email, setEmail] = useState(signedInEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function choose(value: number) {
    setAmountCents(value);
    setCustom("");
    setCustomActive(false);
  }

  function changeCustom(value: string) {
    setCustom(value);
    setCustomActive(true);
    const parsed = Number(value.replace(",", "."));
    setAmountCents(
      Number.isFinite(parsed) && parsed > 0
        ? Math.min(50_000, Math.round(parsed * 100))
        : 0,
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (amountCents < 100) {
      setError("Choose at least €1.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents, email }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!response.ok || !data.url) {
        setError(data.error ?? "Could not create the support request.");
        setLoading(false);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Could not create the support request.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {presets.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => choose(value)}
            aria-pressed={!customActive && amountCents === value}
            className={
              !customActive && amountCents === value
                ? "rounded-full border border-fuchsia-300/40 bg-fuchsia-300/10 px-4 py-2 text-sm font-bold text-fuchsia-200"
                : "rounded-full border border-white/15 px-4 py-2 text-sm text-slate-400 hover:border-fuchsia-300/30 hover:text-white"
            }
          >
            {formatPrice(value)}
          </button>
        ))}
        <div className="flex items-center rounded-full border border-white/15 bg-white/[0.03] px-4">
          <span className="text-sm text-slate-500">€</span>
          <label htmlFor="support-custom" className="sr-only">
            Custom support amount
          </label>
          <input
            id="support-custom"
            type="number"
            min="1"
            max="500"
            step="0.01"
            value={custom}
            onChange={(event) => changeCustom(event.target.value)}
            placeholder="Custom"
            className="h-9 w-24 bg-transparent px-1 text-sm text-white outline-none placeholder:text-slate-600"
          />
        </div>
      </div>

      <div>
        <label htmlFor="support-email" className="mb-1.5 block text-xs font-semibold text-slate-300">
          Email for the payment reference{" "}
          <span className="font-normal text-slate-600">(optional)</span>
        </label>
        <input
          id="support-email"
          type="email"
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="h-10 w-full rounded-lg border border-white/15 bg-white/[0.03] px-3 text-sm text-white outline-none focus:border-cyan-300/60"
        />
        <p className="mt-1 text-[10px] text-slate-600">
          Without an email, keep the private success link to retrieve your reference.
          We never add support emails to marketing.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-rose-300/20 bg-rose-300/[0.06] p-3 text-xs text-rose-200" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-400 via-fuchsia-300 to-cyan-300 px-6 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-slate-950 transition hover:brightness-105 disabled:opacity-60"
      >
        {loading ? (
          <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
        ) : (
          <Heart size={16} aria-hidden="true" />
        )}
        {loading ? "Creating reference…" : `Support with ${formatPrice(amountCents)}`}
        {!loading && <ArrowRight size={14} aria-hidden="true" />}
      </button>
    </form>
  );
}
