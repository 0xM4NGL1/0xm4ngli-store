import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex items-baseline gap-2 focus-visible:rounded-md"
      aria-label="0xm4ngli home"
    >
      <span className="neon-text text-2xl font-black tracking-[-0.07em] text-white md:text-3xl">
        0xm4ngli
        <span className="text-cyan-300 transition group-hover:text-fuchsia-300">.</span>
      </span>
      {!compact && (
        <span className="hidden rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-cyan-200 sm:inline-block">
          tech
        </span>
      )}
    </Link>
  );
}
