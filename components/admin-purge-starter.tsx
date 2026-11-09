"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Sparkles } from "lucide-react";

export function AdminPurgeStarter() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function purge() {
    if (
      !window.confirm(
        "Delete every seeded starter/demo product? Products you added manually or imported from a feed are kept. This cannot be undone.",
      )
    ) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/products/purge-starter", {
        method: "POST",
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        removed?: number;
      };
      if (!response.ok) {
        setError(data.error ?? "Could not remove starter products.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not remove starter products.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={purge}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-amber-300/25 bg-amber-300/[0.05] px-3 py-2 text-[11px] font-semibold text-amber-100 hover:bg-amber-300/10 disabled:opacity-50"
      >
        {loading ? (
          <LoaderCircle size={13} className="animate-spin" aria-hidden="true" />
        ) : (
          <Sparkles size={13} aria-hidden="true" />
        )}
        Remove starter catalogue
      </button>
      {error && <p className="mt-1 text-[10px] text-rose-300">{error}</p>}
    </div>
  );
}
