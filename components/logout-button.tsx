"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      router.push("/");
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
      className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2 text-xs font-semibold text-slate-400 transition hover:border-rose-300/30 hover:text-rose-200 disabled:opacity-60"
    >
      {loading ? (
        <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
      ) : (
        <LogOut size={14} aria-hidden="true" />
      )}
      Sign out
    </button>
  );
}
