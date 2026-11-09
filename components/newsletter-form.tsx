"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) {
      setState("error");
      setMessage("Please confirm you want to receive the newsletter.");
      return;
    }
    setState("loading");
    setMessage("");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent: true }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setState("error");
        setMessage(data.error ?? "Could not subscribe. Please try again.");
        return;
      }
      setState("success");
      setMessage(
        "Check your inbox to confirm. The link is valid for 24 hours.",
      );
      setEmail("");
      setConsent(false);
    } catch {
      setState("error");
      setMessage("Could not subscribe. Please try again.");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-xl border border-emerald-300/25 bg-emerald-300/[0.06] p-4 text-sm text-emerald-100">
        <p className="flex items-center gap-2 font-semibold">
          <Check size={16} aria-hidden="true" /> Almost there
        </p>
        <p className="mt-1 text-emerald-100/70">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex overflow-hidden rounded-xl border border-white/15 bg-white/[0.035] focus-within:border-cyan-300/60">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="flex shrink-0 items-center gap-1.5 bg-cyan-300 px-4 text-xs font-black uppercase tracking-wide text-slate-950 transition hover:bg-fuchsia-300 disabled:opacity-60"
        >
          {state === "loading" ? (
            <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <>
              Join <ArrowRight size={14} aria-hidden="true" />
            </>
          )}
        </button>
      </div>
      <label className="flex items-start gap-2.5 text-[11px] leading-5 text-slate-500">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 accent-cyan-300"
        />
        <span>
          I agree to receive occasional marketing emails and accept the{" "}
          <Link href="/legal/privacy" className="text-slate-300 underline underline-offset-2 hover:text-cyan-200">
            privacy policy
          </Link>
          . I can unsubscribe at any time.
        </span>
      </label>
      {state === "error" && (
        <p className="text-xs text-rose-300" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
