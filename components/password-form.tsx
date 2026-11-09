"use client";

import { useState } from "react";
import { Check, LoaderCircle, Lock } from "lucide-react";

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);
    if (newPassword !== confirm) {
      setError("The new passwords do not match.");
      return;
    }
    if (newPassword.length < 10) {
      setError("Use at least 10 characters.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "Could not change the password.");
        return;
      }
      setSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch {
      setError("Could not change the password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="current-password" className="mb-1.5 block text-xs font-semibold text-slate-300">
            Current password
          </label>
          <input
            id="current-password"
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="h-11 w-full rounded-lg border border-white/15 bg-white/[0.03] px-3.5 text-sm text-white outline-none focus:border-cyan-300/60"
          />
        </div>
        <div>
          <label htmlFor="new-password" className="mb-1.5 block text-xs font-semibold text-slate-300">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            required
            minLength={10}
            maxLength={200}
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="h-11 w-full rounded-lg border border-white/15 bg-white/[0.03] px-3.5 text-sm text-white outline-none focus:border-cyan-300/60"
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="mb-1.5 block text-xs font-semibold text-slate-300">
            Confirm new
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            minLength={10}
            maxLength={200}
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            className="h-11 w-full rounded-lg border border-white/15 bg-white/[0.03] px-3.5 text-sm text-white outline-none focus:border-cyan-300/60"
          />
        </div>
      </div>
      {error && (
        <p className="rounded-lg border border-rose-300/20 bg-rose-300/[0.06] px-3 py-2 text-xs text-rose-200" role="alert">
          {error}
        </p>
      )}
      {saved && (
        <p className="flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/[0.06] px-3 py-2 text-xs text-emerald-200" role="status">
          <Check size={14} aria-hidden="true" /> Password changed. Other sessions were signed out.
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="neon-button inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-black uppercase tracking-wide disabled:opacity-60"
      >
        {loading ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : <Lock size={15} aria-hidden="true" />}
        Change password
      </button>
    </form>
  );
}
