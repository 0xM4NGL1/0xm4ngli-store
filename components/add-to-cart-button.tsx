"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle, Plus, ShoppingBag } from "lucide-react";
import { classNames } from "@/lib/format";

export function AddToCartButton({
  productId,
  available,
  quantity = 1,
  variant = "primary",
  label,
}: {
  productId: number;
  available: number;
  quantity?: number;
  variant?: "primary" | "compact" | "outline";
  label?: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "added" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function add() {
    if (available < 1 || state === "loading") return;
    setState("loading");
    setMessage("");
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setState("error");
        setMessage(data.error ?? "Could not add to cart.");
        return;
      }
      setState("added");
      router.refresh();
      window.setTimeout(() => setState("idle"), 1800);
    } catch {
      setState("error");
      setMessage("Could not add to cart.");
    }
  }

  const disabled = available < 1;
  const text =
    label ??
    (state === "added" ? "Added" : disabled ? "Sold out" : "Add to cart");

  return (
    <div className={classNames(variant === "primary" && "space-y-2")}>
      <button
        type="button"
        onClick={add}
        disabled={disabled || state === "loading"}
        className={classNames(
          "inline-flex items-center justify-center gap-2 font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
          variant === "primary" &&
            "w-full rounded-xl bg-gradient-to-r from-cyan-300 via-cyan-200 to-fuchsia-300 px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-slate-950 shadow-[0_0_35px_-8px_rgba(34,211,238,0.55)] hover:brightness-105",
          variant === "compact" &&
            "w-full rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-2.5 text-xs text-cyan-100 hover:bg-cyan-300/20",
          variant === "outline" &&
            "w-full rounded-xl border border-white/15 bg-white/[0.03] px-5 py-3.5 text-sm text-slate-200 hover:border-cyan-300/40 hover:text-white",
        )}
      >
        {state === "loading" ? (
          <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
        ) : state === "added" ? (
          <Check size={16} aria-hidden="true" />
        ) : variant === "compact" ? (
          <Plus size={14} aria-hidden="true" />
        ) : (
          <ShoppingBag size={17} aria-hidden="true" />
        )}
        {text}
      </button>
      <span className="sr-only" aria-live="polite">
        {state === "added" ? "Added to cart" : message}
      </span>
      {message && variant === "primary" && (
        <p className="text-xs text-rose-300" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}
