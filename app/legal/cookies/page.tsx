import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/legal-shell";

export const metadata: Metadata = {
  title: "Cookie policy",
  description:
    "The cookies used by 0xm4ngli: only sign-in and cart cookies. No payment-tracker cookies.",
  alternates: { canonical: "/legal/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalShell
      title="Cookie policy"
      description="A short, accurate list of what the store stores in your browser — and what it deliberately does not."
      updated="9 November 2026"
    >
      <h2 id="essential">1. Strictly necessary cookies</h2>
      <p>
        These cookies are required to provide the service you request. Under the
        ePrivacy rules they do not require consent, but we still tell you about
        them.
      </p>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Purpose</th>
            <th>Lifetime</th>
            <th>Attributes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>m4_session</code></td>
            <td>Keeps you signed in. Contains an opaque random session token, stored hashed on the server.</td>
            <td>30 days, or until sign-out/password change</td>
            <td>HttpOnly, SameSite=Lax, Secure in production</td>
          </tr>
          <tr>
            <td><code>m4_cart</code></td>
            <td>Remembers a guest cart: product IDs and quantities, signed to prevent tampering.</td>
            <td>30 days, or until checkout/clear</td>
            <td>HttpOnly, SameSite=Lax, Secure in production</td>
          </tr>
        </tbody>
      </table>

      <h2 id="local-storage">2. Local storage</h2>
      <p>
        When you dismiss the cookie notice, we store{" "}
        <code>m4_cookie_notice_v1</code> in your browser&apos;s local storage so the
        notice does not reappear. This value stays on your device and is not sent to
        the server with every request.
      </p>

      <h2 id="payments">3. Bank transfer payments</h2>
      <p>
        This store does not host a card checkout and does not embed a payment
        provider&apos;s tracking scripts. After you place an order we show the
        seller&apos;s bank details and a payment reference. If you use your bank&apos;s
        website or app to make the transfer, that bank may set its own cookies under
        its own policy. We do not control your bank&apos;s site.
      </p>

      <h2 id="none">4. What we do not use</h2>
      <ul>
        <li>No Google Analytics or other product analytics.</li>
        <li>No advertising, retargeting or social pixels.</li>
        <li>No session recording or heatmaps.</li>
        <li>No cross-site tracking or data broker tags.</li>
        <li>No marketing cookies without your separate opt-in.</li>
      </ul>

      <h2 id="controls">5. Your controls</h2>
      <p>
        You can delete or block cookies in your browser settings. Blocking the
        session or cart cookie will sign you out and may make the cart unavailable.
        Because we only use strictly necessary cookies, there is no optional
        analytics switch to turn off.
      </p>
      <p>
        For more information about how personal data is handled, read the{" "}
        <Link href="/legal/privacy">privacy policy</Link>. Questions? Email{" "}
        <a href="mailto:hello@0xm4ngli.store">hello@0xm4ngli.store</a>.
      </p>
    </LegalShell>
  );
}
