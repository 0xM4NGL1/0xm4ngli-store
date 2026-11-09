"use client";

import { useState } from "react";
import { Check, LoaderCircle, Signpost } from "lucide-react";

export function SignOutEverywhere() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function signOut() {
    setLoading(true);
    setDone(false);
    try {
      await fetch("/api/account/logout-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">Sign out other devices</h3>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Rotates your session and invalidates every other signed-in device.
          </p>
        </div>
        <button
          type="button"
          onClick={signOut}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:border-cyan-300/40 hover:text-white disabled:opacity-60"
        >
          {loading ? <LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> : <Signpost size={14} aria-hidden="true" />}
          {done ? "Signed out elsewhere" : "Sign out everywhere"}
        </button>
      </div>
      {done && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-200" role="status">
          <Check size={13} aria-hidden="true" /> All other sessions are now invalid.
        </p>
      )}
    </div>
  );
}
