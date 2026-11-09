"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LoaderCircle } from "lucide-react";

export function AdminLoginForm({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "Could not sign in.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Could not sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {disabled && (
        <p className="rounded-lg border border-amber-300/20 bg-amber-300/[0.05] p-3 text-xs text-amber-100">
          Admin access is disabled. Add <code>ADMIN_TOKEN</code> in your
          deployment environment, then redeploy.
        </p>
      )}
      <div>
        <label htmlFor="admin-token" className="mb-1.5 block text-xs font-semibold text-slate-300">
          Admin token
        </label>
        <input
          id="admin-token"
          type="password"
          required
          autoComplete="current-password"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          className="neon-outline h-11 w-full rounded-lg px-3.5 text-sm text-white outline-none focus:border-cyan-300/60"
          placeholder="ADMIN_TOKEN"
        />
      </div>
      {error && (
        <p className="rounded-lg border border-rose-300/20 bg-rose-300/[0.06] p-3 text-xs text-rose-200" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading || disabled}
        className="neon-button flex h-11 w-full items-center justify-center gap-2 rounded-lg text-xs font-black uppercase tracking-[0.12em] disabled:opacity-50"
      >
        {loading ? (
          <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
        ) : (
          <KeyRound size={16} aria-hidden="true" />
        )}
        Unlock admin
      </button>
    </form>
  );
}
