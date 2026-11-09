"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle, RefreshCw } from "lucide-react";

export function RefreshStatus() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        setLoading(true);
        router.refresh();
        window.setTimeout(() => setLoading(false), 900);
      }}
      className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-[11px] font-semibold text-cyan-100 transition hover:bg-cyan-300/15"
    >
      {loading ? (
        <LoaderCircle size={13} className="animate-spin" aria-hidden="true" />
      ) : (
        <RefreshCw size={13} aria-hidden="true" />
      )}
      Refresh status
    </button>
  );
}
