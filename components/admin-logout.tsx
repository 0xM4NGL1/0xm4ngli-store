"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle, LogOut } from "lucide-react";

export function AdminLogout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/admin/login", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      router.push("/admin/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="neon-outline inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-rose-200 disabled:opacity-60"
    >
      {loading ? (
        <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
      ) : (
        <LogOut size={14} aria-hidden="true" />
      )}
      Lock admin
    </button>
  );
}
