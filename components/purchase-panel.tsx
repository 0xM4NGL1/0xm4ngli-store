"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { AddToCartButton } from "./add-to-cart-button";

export function PurchasePanel({
  productId,
  available,
}: {
  productId: number;
  available: number;
}) {
  const max = Math.max(1, Math.min(10, available));
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Quantity
        </span>
        <div className="flex items-center rounded-lg border border-white/15 bg-white/[0.03]">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity <= 1}
            className="p-2.5 text-slate-300 transition hover:text-white disabled:opacity-30"
            aria-label="Decrease quantity"
          >
            <Minus size={14} aria-hidden="true" />
          </button>
          <span className="w-10 text-center font-mono text-sm font-bold text-white" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(max, value + 1))}
            disabled={quantity >= max}
            className="p-2.5 text-slate-300 transition hover:text-white disabled:opacity-30"
            aria-label="Increase quantity"
          >
            <Plus size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
      <AddToCartButton
        productId={productId}
        available={available}
        quantity={quantity}
        variant="primary"
        label={available < 1 ? "Sold out" : `Add ${quantity} to cart`}
      />
    </div>
  );
}
