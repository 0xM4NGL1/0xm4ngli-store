"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyField({
  label,
  value,
  display,
  mono = true,
}: {
  label: string;
  value: string;
  display?: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#05060b]/50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className={mono ? "break-all font-mono text-sm text-white" : "break-words text-sm text-white"}>
          {display ?? value}
        </p>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-lg border border-white/15 p-2 text-slate-400 transition hover:border-cyan-300/40 hover:text-cyan-200"
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <Check size={14} aria-hidden="true" />
          ) : (
            <Copy size={14} aria-hidden="true" />
          )}
        </button>
      </div>
      <span className="sr-only" aria-live="polite">
        {copied ? `${label} copied` : ""}
      </span>
    </div>
  );
}
