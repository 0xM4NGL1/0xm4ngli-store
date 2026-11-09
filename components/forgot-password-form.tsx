"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, LoaderCircle, Mail } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "Could not send the reset email.");
        return;
      }
      setSent(true);
    } catch {
      setError("Could not send the reset email.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5 text-sm leading-6 text-emerald-100">
        <p className="flex items-center gap-2 font-bold">
          <Check size={16} aria-hidden="true" /> Check your inbox
        </p>
        <p className="mt-2 text-emerald-100/75">
          If an account exists for {email}, a reset link is on its way. It expires
          in 30 minutes. Check spam if it does not arrive.
        </p>
        <Link href="/login" className="mt-4 inline-block text-xs font-semibold text-emerald-200 underline underline-offset-4">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="forgot-email" className="mb-1.5 block text-xs font-semibold text-slate-300">
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-11 w-full rounded-lg border border-white/15 bg-white/[0.03] px-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
          placeholder="you@example.com"
        />
      </div>
      {error && (
        <p className="rounded-lg border border-rose-300/20 bg-rose-300/[0.06] px-3 py-2 text-xs text-rose-200" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 text-xs font-black uppercase tracking-[0.12em] text-slate-950 transition hover:bg-fuchsia-300 disabled:opacity-60"
      >
        {loading ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Mail size={16} aria-hidden="true" />}
        {loading ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
