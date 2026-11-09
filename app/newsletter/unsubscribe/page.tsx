import type { Metadata } from "next";
import { NewsletterAction } from "@/components/newsletter-action";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

export default async function NewsletterUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  return (
    <div className="container-m4 py-16 md:py-24">
      <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-[#0a0d19] p-8">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
          The useful email
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">
          Unsubscribe
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          One click and marketing emails stop. Transactional order messages are
          separate and are not marketing.
        </p>
        <div className="mt-6">
          {token ? (
            <NewsletterAction token={token} mode="unsubscribe" />
          ) : (
            <p className="rounded-lg border border-rose-300/20 bg-rose-300/[0.06] p-4 text-sm text-rose-200">
              This unsubscribe link is incomplete.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
