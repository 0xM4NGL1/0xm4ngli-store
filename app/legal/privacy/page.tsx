import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/legal-shell";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How 0xm4ngli collects, uses, stores and deletes personal data under the GDPR.",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  const controller = site.legalName || "the operator of 0xm4ngli";
  return (
    <LegalShell
      title="Privacy policy"
      description="This policy explains what personal data we process, why, for how long, and the rights you can exercise. It is written for the EU GDPR and applies to visitors worldwide."
      updated="9 November 2026"
    >
      <h2 id="controller">1. Who is responsible</h2>
      <p>
        The data controller is <strong>{controller}</strong>
        {site.legalAddress ? `, ${site.legalAddress}` : ""}. For privacy requests,
        contact{" "}
        <a href={`mailto:${site.privacyEmail}`}>{site.privacyEmail}</a>. We have
        not appointed a statutory Data Protection Officer; privacy requests are
        handled by the operator.
      </p>

      <h2 id="summary">2. The short version</h2>
      <ul>
        <li>You can browse the store without an account.</li>
        <li>
          An account needs a name, email and password. We store a slow one-way
          password hash, never the password itself.
        </li>
        <li>
          We do not run analytics, advertising pixels or cross-site trackers.
        </li>
        <li>
          We do not process card payments. Orders are paid by bank transfer using
          the reference shown after checkout; card details are never requested or
          stored by this store.
        </li>
        <li>
          You can export or delete your account from{" "}
          <Link href="/account/security">Security &amp; data</Link>. Some order
          records are retained where tax law requires it.
        </li>
      </ul>

      <h2 id="data">3. What we process and why</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>What it includes</th>
            <th>Purpose and legal basis</th>
            <th>Retention</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Account</td>
            <td>Name, email, password hash, marketing preference, timestamps.</td>
            <td>
              To provide an account, cart, wishlist and order history (contract,
              Art. 6(1)(b) GDPR). Marketing consent is separate (Art. 6(1)(a)).
            </td>
            <td>Until you delete the account, then deleted immediately.</td>
          </tr>
          <tr>
            <td>Orders</td>
            <td>
              Order ID, items, amounts, currency, email, shipping name/address,
              payment status and bank transfer reference.
            </td>
            <td>
              To fulfil the contract, handle returns and comply with tax and
              accounting law (Art. 6(1)(b) and (c)).
            </td>
            <td>
              Typically 6–10 years for accounting records, depending on the
              seller&apos;s jurisdiction. Retained after account deletion if
              required by law.
            </td>
          </tr>
          <tr>
            <td>Cart and wishlist</td>
            <td>Product IDs and quantities; for guests, a signed cart cookie.</td>
            <td>
              To provide the shopping features you request (contract / strictly
              necessary cookie).
            </td>
            <td>Until removed, checkout, or 30 days for the guest cart cookie.</td>
          </tr>
          <tr>
            <td>Newsletter</td>
            <td>Email, confirmation status, consent version and timestamps.</td>
            <td>
              To send marketing emails only after double opt-in consent (Art.
              6(1)(a)); withdrawal is always available.
            </td>
            <td>Until unsubscribed or 24 months of inactivity, then deleted.</td>
          </tr>
          <tr>
            <td>Security</td>
            <td>
              Session token hashes; short-lived in-memory rate-limit counters.
            </td>
            <td>
              To keep accounts secure and prevent abuse (legitimate interests,
              Art. 6(1)(f)).
            </td>
            <td>Sessions expire after 30 days; rate-limit counters are ephemeral.</td>
          </tr>
          <tr>
            <td>Support</td>
            <td>Whatever you choose to include in an email to us.</td>
            <td>
              To answer your request (contract or legitimate interests, depending
              on the request).
            </td>
            <td>Until the request is resolved, then up to 12 months.</td>
          </tr>
        </tbody>
      </table>
      <p>
        We do not intentionally write IP addresses to our application database.
        Our hosting provider may process standard technical request logs for
        security and operations under a data processing agreement.
      </p>

      <h2 id="payments">4. Payments and bank transfers</h2>
      <p>
        We do not accept card payments on this site and never ask for card
        numbers, CVCs or online banking passwords. After you place an order, the
        confirmation page shows the seller&apos;s bank details (IBAN/BIC), the exact
        amount and a unique payment reference. You make the transfer from your own
        bank. Your bank and the recipient bank process the transfer under their own
        privacy notices.
      </p>
      <p>
        We receive the transfer amount and the payment reference, plus whatever
        information appears on the bank statement needed to match the payment. We
        use that to confirm the order and keep accounting records. We do not
        receive your bank account details unless you send them to us for a refund or
        support request.
      </p>
      <p>
        Never send card details, passwords or one-time banking codes by email. We
        will never ask for them.
      </p>

      <h2 id="cookies">5. Cookies and local storage</h2>
      <p>
        We use only strictly necessary cookies: a signed-in session cookie and a
        guest cart cookie. The cookie notice preference is stored in your browser
        using local storage, not sent on every request. We do not use analytics,
        advertising or cross-site tracking cookies. See the{" "}
        <Link href="/legal/cookies">cookie policy</Link> for the exact names and
        lifetimes.
      </p>

      <h2 id="sharing">6. Who receives data</h2>
      <ul>
        <li>
          <strong>Your bank and the recipient bank</strong> — process the transfer
          you initiate. We do not control their independent privacy practices.
        </li>
        <li>
          <strong>Hosting and database provider</strong> — serves the store and
          stores the database under our instructions.
        </li>
        <li>
          <strong>Email provider (Resend, if configured)</strong> — sends password
          reset, newsletter confirmation and order emails.
        </li>
        <li>
          <strong>Professional advisers and authorities</strong> — only where
          legally required, for example tax authorities or to establish legal
          claims.
        </li>
      </ul>
      <p>
        We do not sell personal data, share it for third-party marketing, or use it
        to build advertising profiles.
      </p>

      <h2 id="transfers">7. International transfers</h2>
      <p>
        Some processors are based outside the EEA/UK. Where required, transfers rely
        on an adequacy decision or standard contractual clauses (and the UK
        addendum/IDTA where applicable), together with technical and organisational
        safeguards. You can ask us for more information about the safeguards used.
      </p>

      <h2 id="security">8. Security</h2>
      <p>
        Measures include scrypt password hashing with per-user salts, hashed
        session tokens, HttpOnly/SameSite cookies, Secure cookies in production,
        origin checks on state-changing requests, rate limiting, strict security
        headers, input validation, prepared database statements, and data
        minimisation. No system is perfectly secure; report a suspected issue to{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>

      <h2 id="rights">9. Your rights</h2>
      <p>Under the GDPR you can:</p>
      <ul>
        <li>access the personal data we hold about you;</li>
        <li>correct inaccurate data (profile editing is built in);</li>
        <li>delete it, subject to legal retention obligations;</li>
        <li>restrict or object to processing based on legitimate interests;</li>
        <li>receive a portable copy (download JSON from your account);</li>
        <li>withdraw marketing consent at any time;</li>
        <li>
          complain to a supervisory authority in your country of residence, work
          or the alleged infringement.
        </li>
      </ul>
      <p>
        Use <Link href="/account/security">Security &amp; data</Link> or email{" "}
        <a href={`mailto:${site.privacyEmail}`}>{site.privacyEmail}</a>. We respond
        within one month, extendable by two months for complex requests. We may
        need to verify your identity before acting.
      </p>

      <h2 id="marketing">10. Marketing</h2>
      <p>
        Newsletter signup uses double opt-in. You can withdraw consent using the
        unsubscribe link in any email or by contacting us. Withdrawal does not
        affect the lawfulness of processing before withdrawal. Transactional
        messages about an order are not marketing.
      </p>

      <h2 id="automated">11. Price signals and automated processing</h2>
      <p>
        The &ldquo;buy signal&rdquo; is calculated from product price observations.
        It is general product information, not a decision about you, and does not
        produce legal or similarly significant effects. We do not use personal data
        for automated decision-making or profiling.
      </p>

      <h2 id="children">12. Children</h2>
      <p>
        The store is not directed to children under 16 and we do not knowingly
        collect their personal data. If you believe a child has created an account,
        contact us and we will delete it.
      </p>

      <h2 id="retention">13. Retention details</h2>
      <ul>
        <li>Account: while active; deleted on request.</li>
        <li>Sessions: 30 days, or until sign-out/password change.</li>
        <li>Password reset links: 30 minutes, single use.</li>
        <li>Pending orders: released/expired after about 2 hours.</li>
        <li>Guest cart cookie: 30 days.</li>
        <li>Newsletter: until unsubscribe or 24 months of inactivity.</li>
        <li>
          Orders/invoices: the statutory accounting period applicable to the
          seller, normally 6–10 years.
        </li>
      </ul>

      <h2 id="changes">14. Changes</h2>
      <p>
        We may update this policy when the store or law changes. The date at the
        top shows the current version. Material changes affecting consent will be
        communicated before they take effect.
      </p>

      <h2 id="complaints">15. Complaints</h2>
      <p>
        Please contact us first so we can try to resolve the issue. You always have
        the right to lodge a complaint with your local data protection authority.
        Within the EU you can find authorities through the{" "}
        <a href="https://www.edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noopener noreferrer">
          European Data Protection Board
        </a>
        . In the UK, contact the Information Commissioner&apos;s Office.
      </p>
    </LegalShell>
  );
}
