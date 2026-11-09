"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Download,
  LoaderCircle,
  Trash2,
  TriangleAlert,
} from "lucide-react";

export function PrivacyActions() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function deleteAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: password, confirmation }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "Could not delete the account.");
        return;
      }
      router.push("/account-deleted");
      router.refresh();
    } catch {
      setError("Could not delete the account.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">Export your data</h3>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Download a JSON file containing your profile, cart, wishlist and
              order records.
            </p>
          </div>
          <a
            href="/api/account/export"
            download
            className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/[0.06] px-4 py-2.5 text-xs font-semibold text-cyan-100 hover:bg-cyan-300/10"
          >
            <Download size={14} aria-hidden="true" /> Download JSON
          </a>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <h3 className="text-sm font-bold text-white">Your GDPR rights</h3>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          You can access, correct, export, restrict or erase your data. Profile
          edits are available above. Read the full explanation in the{" "}
          <Link href="/legal/privacy#rights" className="text-cyan-200 underline underline-offset-2">
            privacy policy
          </Link>
          .
        </p>
      </div>

      <details className="group rounded-xl border border-rose-300/20 bg-rose-300/[0.03] p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-rose-100">
              <TriangleAlert size={15} aria-hidden="true" /> Delete my account
            </h3>
            <p className="mt-1 text-xs text-rose-100/60">
              This cannot be undone.
            </p>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-rose-200/70 group-open:hidden">
            Open
          </span>
        </summary>
        <div className="mt-4 border-t border-rose-300/15 pt-4">
          <p className="text-xs leading-5 text-rose-100/70">
            Your account, sessions, cart, wishlist and password reset tokens are
            deleted immediately. Order and invoice records are retained where tax
            and accounting law requires it, detached from your account. See the{" "}
            <Link href="/legal/privacy#retention" className="underline underline-offset-2">
              retention section
            </Link>
            .
          </p>
          <form onSubmit={deleteAccount} className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="delete-password" className="mb-1.5 block text-xs font-semibold text-rose-100/80">
                  Current password
                </label>
                <input
                  id="delete-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-10 w-full rounded-lg border border-rose-300/20 bg-[#0a0d19] px-3 text-sm text-white outline-none focus:border-rose-300/50"
                />
              </div>
              <div>
                <label htmlFor="delete-confirmation" className="mb-1.5 block text-xs font-semibold text-rose-100/80">
                  Type DELETE to confirm
                </label>
                <input
                  id="delete-confirmation"
                  type="text"
                  required
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  placeholder="DELETE"
                  className="h-10 w-full rounded-lg border border-rose-300/20 bg-[#0a0d19] px-3 text-sm text-white outline-none focus:border-rose-300/50"
                />
              </div>
            </div>
            {error && (
              <p className="rounded-lg border border-rose-300/20 bg-rose-950/40 px-3 py-2 text-xs text-rose-200" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || confirmation !== "DELETE"}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-400 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-rose-950 transition hover:bg-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? <LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> : <Trash2 size={14} aria-hidden="true" />}
              Delete account permanently
            </button>
          </form>
        </div>
      </details>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs leading-5 text-slate-400">
        <p className="flex items-center gap-2 font-semibold text-slate-200">
          <Check size={14} className="text-emerald-300" aria-hidden="true" />
          No hidden data broker opt-outs needed
        </p>
        <p className="mt-1">
          We do not sell data or share it for marketing. Bank transfers are handled
          by your bank; we only see the amount and reference needed to match the
          order. See the privacy policy for details.
        </p>
      </div>
    </div>
  );
}
