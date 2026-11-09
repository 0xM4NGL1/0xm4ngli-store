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
  variant?: "primary" | "compact" | "outline" | "icon";
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
  const actionLabel =
    state === "added"
      ? "Added to cart"
      : disabled
        ? "Sold out"
        : "Add to cart";

  return (
    <div className={classNames(variant === "primary" && "space-y-2")}>
      <button
        type="button"
        onClick={add}
        disabled={disabled || state === "loading"}
        aria-label={variant === "icon" ? actionLabel : undefined}
        title={variant === "icon" ? actionLabel : undefined}
        className={classNames(
          "inline-flex items-center justify-center gap-2 font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
          variant === "primary" &&
            "neon-button w-full rounded-xl px-6 py-4 text-sm font-black uppercase tracking-[0.12em]",
          variant === "compact" &&
            "w-full rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-2.5 text-xs text-cyan-100 hover:bg-cyan-300/20",
          variant === "outline" &&
            "w-full rounded-xl border border-white/15 bg-white/[0.03] px-5 py-3.5 text-sm text-slate-200 hover:border-cyan-300/40 hover:text-white",
          variant === "icon" &&
            "h-9 w-9 rounded-full border border-white/15 bg-[#05060b]/80 text-slate-200 backdrop-blur transition hover:border-cyan-300/50 hover:bg-cyan-300/15 hover:text-cyan-100",
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
        {variant !== "icon" && text}
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
