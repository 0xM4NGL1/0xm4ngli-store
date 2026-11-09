"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, LoaderCircle } from "lucide-react";
import { classNames } from "@/lib/format";

export function WishlistButton({
  productId,
  initial,
  authenticated,
  compact = false,
}: {
  productId: number;
  initial: boolean;
  authenticated: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [wishlisted, setWishlisted] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!authenticated) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(pathname)}`}
        className={classNames(
          "neon-outline inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-slate-300 transition hover:text-fuchsia-200",
          compact
            ? "h-9 w-9 rounded-full border border-[#c4b5fd]/18 bg-[#04010c]/80 backdrop-blur"
            : "px-5 py-3.5 text-sm",
        )}
        aria-label="Sign in to save to wishlist"
        title="Sign in to save to wishlist"
      >
        <Heart size={17} aria-hidden="true" />
        {!compact && "Save"}
      </Link>
    );
  }

  async function toggle() {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        wishlisted?: boolean;
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "Could not update wishlist.");
        return;
      }
      setWishlisted(Boolean(data.wishlisted));
      router.refresh();
    } catch {
      setError("Could not update wishlist.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={compact ? "" : "space-y-2"}>
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        aria-pressed={wishlisted}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className={classNames(
          "inline-flex items-center justify-center gap-2 rounded-xl border font-semibold transition disabled:opacity-60",
          wishlisted
            ? "border-fuchsia-300/40 bg-fuchsia-300/10 text-fuchsia-200"
            : "border-[#c4b5fd]/18 bg-[#0d0622]/80 text-slate-300 hover:border-fuchsia-300/40 hover:text-fuchsia-200",
          compact
            ? "h-9 w-9 rounded-full bg-[#04010c]/80 backdrop-blur"
            : "px-5 py-3.5 text-sm",
        )}
      >
        {loading ? (
          <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
        ) : (
          <Heart
            size={17}
            fill={wishlisted ? "currentColor" : "none"}
            aria-hidden="true"
          />
        )}
        {!compact && (wishlisted ? "Saved" : "Save")}
      </button>
      {error && (
        <p className="text-xs text-rose-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
