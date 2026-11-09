"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle, Save } from "lucide-react";

export function ProfileForm({
  name: initialName,
  email: initialEmail,
  marketingConsent: initialMarketing,
}: {
  name: string;
  email: string;
  marketingConsent: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [marketingConsent, setMarketingConsent] = useState(initialMarketing);
  const [currentPassword, setCurrentPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const emailChanged = email.trim().toLowerCase() !== initialEmail.toLowerCase();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);
    try {
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          marketingConsent,
          currentPassword: emailChanged ? currentPassword : undefined,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "Could not save your profile.");
        return;
      }
      setSaved(true);
      setCurrentPassword("");
      router.refresh();
    } catch {
      setError("Could not save your profile.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-name" className="mb-1.5 block text-xs font-semibold text-slate-300">
            Name
          </label>
          <input
            id="profile-name"
            type="text"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11 w-full rounded-lg border border-white/15 bg-white/[0.03] px-3.5 text-sm text-white outline-none focus:border-cyan-300/60"
          />
        </div>
        <div>
          <label htmlFor="profile-email" className="mb-1.5 block text-xs font-semibold text-slate-300">
            Email
          </label>
          <input
            id="profile-email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 w-full rounded-lg border border-white/15 bg-white/[0.03] px-3.5 text-sm text-white outline-none focus:border-cyan-300/60"
          />
        </div>
      </div>

      {emailChanged && (
        <div>
          <label htmlFor="profile-password" className="mb-1.5 block text-xs font-semibold text-amber-200">
            Current password (required to change email)
          </label>
          <input
            id="profile-password"
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="h-11 w-full rounded-lg border border-amber-300/30 bg-amber-300/[0.04] px-3.5 text-sm text-white outline-none focus:border-amber-300/60"
          />
        </div>
      )}

      <label className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs leading-5 text-slate-400">
        <input
          type="checkbox"
          checked={marketingConsent}
          onChange={(event) => setMarketingConsent(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 accent-cyan-300"
        />
        <span>
          <span className="font-semibold text-slate-200">Marketing emails</span>
          <br />
          Send me occasional price-drop and new-arrival emails. This is optional
          and can be withdrawn at any time. Transactional emails about orders are
          separate.
        </span>
      </label>

      {error && (
        <p className="rounded-lg border border-rose-300/20 bg-rose-300/[0.06] px-3 py-2 text-xs text-rose-200" role="alert">
          {error}
        </p>
      )}
      {saved && (
        <p className="flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/[0.06] px-3 py-2 text-xs text-emerald-200" role="status">
          <Check size={14} aria-hidden="true" /> Profile saved.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="neon-button inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-black uppercase tracking-wide disabled:opacity-60"
      >
        {loading ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : <Save size={15} aria-hidden="true" />}
        Save changes
      </button>
    </form>
  );
}
