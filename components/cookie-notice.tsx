"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "m4_cookie_notice_v1";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        if (!window.localStorage.getItem(STORAGE_KEY)) setVisible(true);
      } catch {
        // If storage is unavailable there is nothing useful to remember.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // Ignore storage failures.
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl">
      <div
        className="glass-strong flex items-start gap-3 rounded-2xl p-4 shadow-2xl"
        role="region"
        aria-label="Cookie notice"
      >
        <Cookie size={20} className="mt-0.5 shrink-0 text-cyan-300" aria-hidden="true" />
        <div className="min-w-0 flex-1 text-xs leading-5 text-slate-400">
          <p className="font-semibold text-slate-200">Essential cookies only.</p>
          <p>
            We use cookies for sign-in, your cart and security. No analytics,
            advertising or cross-site tracking.{" "}
            <Link href="/legal/cookies" className="text-cyan-200 underline underline-offset-2">
              Read the cookie policy
            </Link>
            .
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-full p-1 text-slate-500 hover:bg-white/5 hover:text-white"
          aria-label="Dismiss cookie notice"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
