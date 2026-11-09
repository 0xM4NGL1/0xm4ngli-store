"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle, UserPlus } from "lucide-react";

export function RegisterForm({ next }: { next: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("The passwords do not match.");
      return;
    }
    if (password.length < 10) {
      setError("Use at least 10 characters for your password.");
      return;
    }
    if (!acceptTerms) {
      setError("Please accept the terms and privacy policy.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          marketingConsent,
          acceptTerms: true,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "Could not create your account.");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Could not create your account. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="register-name" className="mb-1.5 block text-xs font-semibold text-slate-300">
          Name
        </label>
        <input
          id="register-name"
          type="text"
          required
          autoComplete="name"
          minLength={2}
          maxLength={80}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="h-11 w-full rounded-lg border border-[#c4b5fd]/18 bg-[#0d0622]/80 px-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="register-email" className="mb-1.5 block text-xs font-semibold text-slate-300">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          required
          autoComplete="email"
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-11 w-full rounded-lg border border-[#c4b5fd]/18 bg-[#0d0622]/80 px-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="register-password" className="mb-1.5 block text-xs font-semibold text-slate-300">
          Password
        </label>
        <div className="relative">
          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            required
            minLength={10}
            maxLength={200}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 w-full rounded-lg border border-[#c4b5fd]/18 bg-[#0d0622]/80 px-3.5 pr-11 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
            placeholder="At least 10 characters"
            aria-describedby="password-hint"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-1 top-1 rounded-md p-2.5 text-slate-500 hover:text-slate-300"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          </button>
        </div>
        <p id="password-hint" className="mt-1 text-[10px] text-slate-600">
          Use a passphrase. We store a slow hash, never the password itself.
        </p>
      </div>

      <div>
        <label htmlFor="register-confirm" className="mb-1.5 block text-xs font-semibold text-slate-300">
          Confirm password
        </label>
        <input
          id="register-confirm"
          type={showPassword ? "text" : "password"}
          required
          minLength={10}
          maxLength={200}
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          className="h-11 w-full rounded-lg border border-[#c4b5fd]/18 bg-[#0d0622]/80 px-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
          placeholder="Repeat your password"
        />
      </div>

      <label className="flex items-start gap-2.5 text-xs leading-5 text-slate-400">
        <input
          type="checkbox"
          checked={marketingConsent}
          onChange={(event) => setMarketingConsent(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-[#c4b5fd]/22 bg-[#c4b5fd]/10 accent-cyan-300"
        />
        Optional: send me occasional price-drop and new-arrival emails. I can
        unsubscribe at any time.
      </label>

      <label className="flex items-start gap-2.5 text-xs leading-5 text-slate-400">
        <input
          type="checkbox"
          required
          checked={acceptTerms}
          onChange={(event) => setAcceptTerms(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-[#c4b5fd]/22 bg-[#c4b5fd]/10 accent-cyan-300"
        />
        I accept the terms of service and have read the privacy policy.
      </label>

      {error && (
        <p className="rounded-lg border border-rose-300/20 bg-rose-300/[0.06] px-3 py-2 text-xs text-rose-200" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="neon-button flex h-11 w-full items-center justify-center gap-2 rounded-lg text-xs font-black uppercase tracking-[0.12em] disabled:opacity-60"
      >
        {loading ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <UserPlus size={16} aria-hidden="true" />}
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
