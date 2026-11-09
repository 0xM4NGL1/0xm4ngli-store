import type { DealSignal, PricePoint } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/format";

const colors: Record<DealSignal["verdict"], string> = {
  buy: "#4dffa8",
  good: "#34f4ff",
  fair: "#ffc247",
  wait: "#ff6d93",
  collecting: "#a99cd8",
};

export function PriceHistoryChart({
  points,
  signal,
  currency = "EUR",
  productId,
}: {
  points: PricePoint[];
  signal: DealSignal;
  currency?: string;
  productId: number;
}) {
  if (points.length < 2) {
    return (
      <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-[#c4b5fd]/18 bg-[#0b051d]/60 p-8 text-center">
        <p className="font-semibold text-slate-300">Building price history</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          The chart appears after the next price observations are recorded. We do
          not backfill invented prices.
        </p>
      </div>
    );
  }

  const width = 760;
  const height = 280;
  const padding = { top: 18, right: 14, bottom: 34, left: 62 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const prices = points.map((point) => point.priceCents);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = Math.max(1, max - min);
  const times = points.map((point) => new Date(point.recordedAt).getTime());
  const start = Math.min(...times);
  const end = Math.max(...times);
  const timeSpan = Math.max(1, end - start);

  const x = (time: number) =>
    padding.left + ((time - start) / timeSpan) * plotWidth;
  const y = (price: number) =>
    padding.top + (1 - (price - min) / span) * plotHeight;

  const line = points
    .map((point, index) => {
      const pointX = x(times[index]);
      const pointY = y(point.priceCents);
      return `${index === 0 ? "M" : "L"} ${pointX.toFixed(1)} ${pointY.toFixed(1)}`;
    })
    .join(" ");

  const area = `${line} L ${x(end).toFixed(1)} ${(padding.top + plotHeight).toFixed(1)} L ${x(start).toFixed(1)} ${(padding.top + plotHeight).toFixed(1)} Z`;
  const color = colors[signal.verdict];
  const gradientId = `price-gradient-${productId}`;
  const current = points.at(-1);

  const ticks = [min, min + span / 2, max];
  const xTickCount = 5;
  const xTicks = Array.from({ length: xTickCount }, (_, index) => {
    const time = start + (timeSpan / (xTickCount - 1)) * index;
    return { time, label: formatDate(new Date(time), { month: "short", year: "2-digit" }) };
  });

  const tableRows = points.slice(-14);

  return (
    <figure className="neon-card rounded-xl bg-[#080316] p-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Recorded price history. Current ${formatPrice(current?.priceCents ?? 0, currency)}. ${signal.summary}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((tick) => {
          const tickY = y(tick);
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={tickY}
                y2={tickY}
                stroke="rgba(196, 181, 253, 0.12)"
                strokeDasharray="3 5"
              />
              <text
                x={padding.left - 8}
                y={tickY + 3}
                textAnchor="end"
                fill="#6d619a"
                fontSize="10"
                fontFamily="var(--font-geist-mono)"
              >
                {formatPrice(tick, currency)}
              </text>
            </g>
          );
        })}

        {xTicks.map((tick, index) => (
          <text
            key={tick.time}
            x={padding.left + (plotWidth / (xTickCount - 1)) * index}
            y={height - 8}
            textAnchor={
              index === 0 ? "start" : index === xTickCount - 1 ? "end" : "middle"
            }
            fill="#6d619a"
            fontSize="10"
            fontFamily="var(--font-geist-mono)"
          >
            {tick.label}
          </text>
        ))}

        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point, index) => (
          <circle
            key={`${point.recordedAt}-${index}`}
            cx={x(times[index])}
            cy={y(point.priceCents)}
            r={index === points.length - 1 ? 5 : 1.8}
            fill={index === points.length - 1 ? color : "#04010c"}
            stroke={color}
            strokeWidth={index === points.length - 1 ? 2 : 1}
            opacity={index === points.length - 1 ? 1 : 0.65}
          >
            <title>
              {formatDate(point.recordedAt)}: {formatPrice(point.priceCents, currency)}
            </title>
          </circle>
        ))}
      </svg>

      <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-1 text-[10px] text-slate-500">
        <span>
          {signal.observations} observations in 90 days · lowest{" "}
          {signal.low90Cents !== null ? formatPrice(signal.low90Cents, currency) : "—"}
        </span>
        <span className="font-mono uppercase tracking-[0.14em]">Recorded prices</span>
      </div>

      <details className="px-2">
        <summary className="cursor-pointer py-1 text-xs text-slate-500 hover:text-slate-300">
          View data table
        </summary>
        <div className="mt-2 max-h-56 overflow-auto rounded-lg border border-[#c4b5fd]/12">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">
              Recent recorded prices for this product
            </caption>
            <thead className="sticky top-0 bg-[#0c0618] text-slate-400">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">Date</th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c4b5fd]/8">
              {tableRows.map((point) => (
                <tr key={`row-${point.recordedAt}`}>
                  <td className="px-3 py-1.5 text-slate-400">
                    {formatDate(point.recordedAt)}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono text-slate-300">
                    {formatPrice(point.priceCents, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
