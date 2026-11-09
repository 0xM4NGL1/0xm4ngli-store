import type { PricePoint } from "@/lib/types";

export function MiniSparkline({
  points,
  color = "#22d3ee",
  width = 220,
  height = 58,
}: {
  points: PricePoint[];
  color?: string;
  width?: number;
  height?: number;
}) {
  if (points.length < 2) {
    return (
      <div
        className="h-14 rounded-md border border-dashed border-white/10"
        aria-hidden="true"
      />
    );
  }

  const prices = points.map((point) => point.priceCents);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = Math.max(1, max - min);
  const padding = 4;

  const path = points
    .map((point, index) => {
      const x =
        padding +
        (index / (points.length - 1)) * (width - padding * 2);
      const y =
        padding +
        (1 - (point.priceCents - min) / span) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-14 w-full"
      aria-hidden="true"
      focusable="false"
    >
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
