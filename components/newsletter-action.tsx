"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, LoaderCircle } from "lucide-react";

export function NewsletterAction({
  token,
  mode,
}: {
  token: string;
  mode: "confirm" | "unsubscribe";
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/newsletter/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, mode }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "This link could not be used.");
        return;
      }
      setDone(true);
    } catch {
      setError("This link could not be used.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5 text-sm text-emerald-100">
        <p className="flex items-center gap-2 font-bold">
          <Check size={16} aria-hidden="true" />
          {mode === "confirm" ? "Subscription confirmed" : "You are unsubscribed"}
        </p>
        <p className="mt-2 text-emerald-100/70">
          {mode === "confirm"
            ? "You are on the list. You can unsubscribe from any email with one click."
            : "You will not receive marketing emails from us. Order emails are separate."}
        </p>
        <Link href="/" className="mt-4 inline-block text-xs font-semibold underline underline-offset-4">
          Back to the store
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={submit}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-5 py-3 text-xs font-black uppercase tracking-wide text-slate-950 transition hover:bg-fuchsia-300 disabled:opacity-60"
      >
        {loading && <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />}
        {mode === "confirm" ? "Confirm subscription" : "Unsubscribe"}
      </button>
      {error && (
        <p className="text-xs text-rose-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
