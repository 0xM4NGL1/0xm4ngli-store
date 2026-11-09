"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, LoaderCircle, Lock } from "lucide-react";

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("The passwords do not match.");
      return;
    }
    if (password.length < 10) {
      setError("Use at least 10 characters.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "Could not reset the password.");
        return;
      }
      setDone(true);
    } catch {
      setError("Could not reset the password.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5 text-sm leading-6 text-emerald-100">
        <p className="flex items-center gap-2 font-bold">
          <Check size={16} aria-hidden="true" /> Password updated
        </p>
        <p className="mt-2 text-emerald-100/75">
          All other sessions have been signed out. You can now sign in with your
          new password.
        </p>
        <Link href="/login" className="mt-4 inline-block rounded-lg bg-emerald-300 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-slate-950">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="reset-password" className="mb-1.5 block text-xs font-semibold text-slate-300">
          New password
        </label>
        <input
          id="reset-password"
          type="password"
          required
          minLength={10}
          maxLength={200}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-11 w-full rounded-lg border border-white/15 bg-white/[0.03] px-3.5 text-sm text-white outline-none transition focus:border-cyan-300/60"
        />
      </div>
      <div>
        <label htmlFor="reset-confirm" className="mb-1.5 block text-xs font-semibold text-slate-300">
          Confirm new password
        </label>
        <input
          id="reset-confirm"
          type="password"
          required
          minLength={10}
          maxLength={200}
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          className="h-11 w-full rounded-lg border border-white/15 bg-white/[0.03] px-3.5 text-sm text-white outline-none transition focus:border-cyan-300/60"
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
        {loading ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Lock size={16} aria-hidden="true" />}
        {loading ? "Updating…" : "Set new password"}
      </button>
    </form>
  );
}
