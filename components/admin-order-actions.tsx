"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle, X } from "lucide-react";

export function AdminOrderActions({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState<"paid" | "cancel" | null>(null);
  const [error, setError] = useState("");

  async function markPaid() {
    setLoading("paid");
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankReference: reference || undefined }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "Could not mark paid.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not mark paid.");
    } finally {
      setLoading(null);
    }
  }

  async function cancel() {
    if (!window.confirm("Cancel this order and release reserved stock?")) return;
    setLoading("cancel");
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/cancel`, {
        method: "POST",
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "Could not cancel.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not cancel.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          placeholder="Bank statement reference (optional)"
          className="neon-outline h-9 min-w-52 flex-1 rounded-lg px-3 text-xs text-white outline-none focus:border-cyan-300/60"
          aria-label="Bank statement reference"
        />
        <button
          type="button"
          onClick={markPaid}
          disabled={loading !== null}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-300 px-3 py-2 text-[11px] font-bold text-emerald-950 hover:bg-emerald-200 disabled:opacity-50"
        >
          {loading === "paid" ? (
            <LoaderCircle size={12} className="animate-spin" aria-hidden="true" />
          ) : (
            <Check size={12} aria-hidden="true" />
          )}
          Mark paid
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={loading !== null}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300/20 px-3 py-2 text-[11px] font-semibold text-rose-200 hover:bg-rose-300/10 disabled:opacity-50"
        >
          {loading === "cancel" ? (
            <LoaderCircle size={12} className="animate-spin" aria-hidden="true" />
          ) : (
            <X size={12} aria-hidden="true" />
          )}
          Cancel
        </button>
      </div>
      {error && <p className="text-[10px] text-rose-300">{error}</p>}
    </div>
  );
}
