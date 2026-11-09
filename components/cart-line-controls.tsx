"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Minus, Plus, Trash2 } from "lucide-react";

export function CartLineControls({
  productId,
  quantity,
  available,
}: {
  productId: number;
  quantity: number;
  available: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function update(nextQuantity: number) {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: nextQuantity }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "Could not update cart.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not update cart.");
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(data.error ?? "Could not remove item.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not remove item.");
    } finally {
      setLoading(false);
    }
  }

  const max = Math.max(1, Math.min(10, available));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-lg border border-white/15 bg-white/[0.03]">
          <button
            type="button"
            onClick={() => update(quantity - 1)}
            disabled={loading || quantity <= 1}
            className="p-2 text-slate-300 hover:text-white disabled:opacity-30"
            aria-label="Decrease quantity"
          >
            <Minus size={13} aria-hidden="true" />
          </button>
          <span className="w-8 text-center font-mono text-xs font-bold text-white">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => update(quantity + 1)}
            disabled={loading || quantity >= max}
            className="p-2 text-slate-300 hover:text-white disabled:opacity-30"
            aria-label="Increase quantity"
          >
            <Plus size={13} aria-hidden="true" />
          </button>
        </div>
        <button
          type="button"
          onClick={remove}
          disabled={loading}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-300/10 hover:text-rose-300 disabled:opacity-40"
          aria-label="Remove item"
        >
          {loading ? (
            <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 size={15} aria-hidden="true" />
          )}
        </button>
      </div>
      {error && (
        <p className="text-[11px] text-rose-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
