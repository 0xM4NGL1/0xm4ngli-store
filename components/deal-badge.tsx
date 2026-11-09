import {
  CircleHelp,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { DealSignal } from "@/lib/types";
import { classNames } from "@/lib/format";

const styles = {
  buy: {
    label: "Best time to buy",
    short: "Buy now",
    icon: TrendingDown,
    className:
      "border-emerald-300/40 bg-[#052018]/88 text-emerald-200",
  },
  good: {
    label: "Good price",
    short: "Good price",
    icon: TrendingDown,
    className: "border-cyan-300/40 bg-[#041b24]/88 text-cyan-200",
  },
  fair: {
    label: "Fair price",
    short: "Fair",
    icon: Wallet,
    className: "border-amber-300/35 bg-[#211a05]/88 text-amber-200",
  },
  wait: {
    label: "Consider waiting",
    short: "Wait",
    icon: TrendingUp,
    className: "border-rose-300/35 bg-[#21070c]/88 text-rose-200",
  },
  collecting: {
    label: "Collecting data",
    short: "Collecting",
    icon: CircleHelp,
    className: "border-slate-400/25 bg-[#0b0d16]/88 text-slate-300",
  },
} as const;

export function DealBadge({
  signal,
  size = "sm",
}: {
  signal: DealSignal;
  size?: "sm" | "md";
}) {
  const style = styles[signal.verdict];
  const Icon = style.icon;
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1.5 rounded-full border font-bold uppercase tracking-[0.1em] backdrop-blur-md",
        style.className,
        size === "sm" ? "px-2.5 py-1 text-[9px]" : "px-3 py-1.5 text-[11px]",
      )}
      title={signal.summary}
    >
      <Icon size={size === "sm" ? 11 : 14} aria-hidden="true" />
      {size === "sm" ? style.short : style.label}
      {size === "md" && signal.verdict !== "collecting" && (
        <span className="font-mono opacity-70">{signal.score}/100</span>
      )}
    </span>
  );
}

export function DropPill({
  signal,
  className,
}: {
  signal: DealSignal;
  className?: string;
}) {
  if (signal.change30Percent === null) return null;
  const dropped = signal.change30Percent < 0;
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 font-mono text-[10px] font-bold",
        dropped
          ? "bg-emerald-300/10 text-emerald-200"
          : "bg-rose-300/10 text-rose-200",
        className,
      )}
    >
      {dropped ? (
        <TrendingDown size={11} aria-hidden="true" />
      ) : (
        <TrendingUp size={11} aria-hidden="true" />
      )}
      {dropped ? "↓" : "↑"} {Math.abs(signal.change30Percent * 100).toFixed(0)}% 30d
    </span>
  );
}
