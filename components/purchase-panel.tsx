"use client";

import { useState } from "react";
import { Minus, Plus, Ruler, Truck } from "lucide-react";
import { AddToCartButton } from "./add-to-cart-button";

export function PurchasePanel({
  productId,
  available,
  sizes,
}: {
  productId: number;
  available: number;
  sizes: string[];
}) {
  const max = Math.max(1, Math.min(10, available));
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState(sizes.length === 1 ? sizes[0] : "");
  const [showSizeHelp, setShowSizeHelp] = useState(false);
  const needsSize = sizes.length > 0;
  const missingSize = needsSize && !size;

  return (
    <div className="space-y-5">
      {needsSize && (
        <div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Size
            </span>
            <button
              type="button"
              onClick={() => setShowSizeHelp((value) => !value)}
              aria-expanded={showSizeHelp}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-200 underline underline-offset-4 hover:text-cyan-100"
            >
              <Ruler size={13} aria-hidden="true" /> Size guide
            </button>
          </div>

          <div
            role="group"
            aria-label="Choose a size"
            className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5"
          >
            {sizes.map((entry) => {
              const active = size === entry;
              return (
                <button
                  key={entry}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSize(entry)}
                  className={
                    active
                      ? "min-h-11 rounded-xl border border-cyan-300/70 bg-cyan-300/15 px-2 py-2.5 text-sm font-black text-cyan-100 shadow-[0_0_24px_-12px_rgba(52,244,255,0.9)]"
                      : "min-h-11 rounded-xl border border-[#c4b5fd]/18 bg-[#0d0622]/80 px-2 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-300/45 hover:bg-cyan-300/[0.07] hover:text-white"
                  }
                >
                  {entry}
                </button>
              );
            })}
          </div>

          {missingSize && (
            <p className="mt-2 text-[11px] text-amber-200/90" role="status">
              Choose a size to add this product to your cart.
            </p>
          )}

          {showSizeHelp && (
            <div className="mt-2 rounded-xl border border-[#c4b5fd]/12 bg-[#0d0622]/80 p-3 text-[11px] leading-5 text-slate-400">
              Pick the size printed on the product you use today. If you are
              between two sizes, choose the larger one for a comfortable fit.
              Not sure? <a href="/contact" className="text-cyan-200 underline underline-offset-2">Ask us before ordering</a> and we will confirm the right option.
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Quantity
          </span>
          <p className="mt-0.5 text-[10px] text-slate-600">
            {available > 0 ? `${available} available · max 10 per order` : "Currently unavailable"}
          </p>
        </div>
        <div className="flex items-center rounded-xl border border-[#c4b5fd]/18 bg-[#0d0622]/80">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity <= 1}
            className="p-3 text-slate-300 transition hover:text-white disabled:opacity-30"
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
            className="p-3 text-slate-300 transition hover:text-white disabled:opacity-30"
            aria-label="Increase quantity"
          >
            <Plus size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid gap-2">
        <AddToCartButton
          productId={productId}
          available={available}
          quantity={quantity}
          size={size}
          variant="primary"
          disabled={missingSize}
          disabledLabel="Choose a size"
          label={
            available < 1
              ? "Sold out"
              : missingSize
                ? "Choose a size"
                : `Add ${quantity} to cart`
          }
        />
        <AddToCartButton
          productId={productId}
          available={available}
          quantity={quantity}
          size={size}
          variant="outline"
          goToCart
          disabled={missingSize}
          disabledLabel="Choose a size first"
          label="Buy now"
        />
      </div>

      <p className="flex items-start gap-2 text-[11px] leading-5 text-slate-500">
        <Truck size={14} className="mt-0.5 shrink-0 text-cyan-300" aria-hidden="true" />
        Checkout is by bank transfer. Your stock is held for 7 days while the
        transfer clears. No card details are requested.
      </p>
    </div>
  );
}
