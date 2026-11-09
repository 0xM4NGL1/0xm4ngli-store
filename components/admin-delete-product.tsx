"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Trash2 } from "lucide-react";

export function AdminDeleteProduct({
  id,
  name,
}: {
  id: number;
  name: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "Could not delete.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not delete.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={remove}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300/20 px-2.5 py-1.5 text-[11px] font-semibold text-rose-200 hover:bg-rose-300/10 disabled:opacity-50"
      >
        {loading ? (
          <LoaderCircle size={12} className="animate-spin" aria-hidden="true" />
        ) : (
          <Trash2 size={12} aria-hidden="true" />
        )}
        Delete
      </button>
      {error && <p className="mt-1 text-[10px] text-rose-300">{error}</p>}
    </div>
  );
}
