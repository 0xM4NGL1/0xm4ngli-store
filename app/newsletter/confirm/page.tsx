import type { Metadata } from "next";
import { NewsletterAction } from "@/components/newsletter-action";

export const metadata: Metadata = {
  title: "Confirm newsletter",
  robots: { index: false, follow: false },
};

export default async function NewsletterConfirmPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  return (
    <div className="container-m4 py-16 md:py-24">
      <div className="mx-auto max-w-lg rounded-3xl border border-[#c4b5fd]/12 bg-[#0b051d] p-8">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
          The useful email
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">
          Confirm your subscription
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          This confirms that you want occasional price-drop and new-arrival emails.
          No marketing email is sent before confirmation.
        </p>
        <div className="mt-6">
          {token ? (
            <NewsletterAction token={token} mode="confirm" />
          ) : (
            <p className="rounded-lg border border-rose-300/20 bg-rose-300/[0.06] p-4 text-sm text-rose-200">
              This confirmation link is incomplete.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
