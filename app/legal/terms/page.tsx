import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/legal-shell";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "The terms that apply when you browse or buy from 0xm4ngli, including consumer rights and returns.",
  alternates: { canonical: "/legal/terms" },
};

export default function TermsPage() {
  const seller = site.legalName || "the operator of 0xm4ngli";
  return (
    <LegalShell
      title="Terms of service"
      description="These terms form the agreement between you and the seller when you use the store or place an order. Consumer law rights are not reduced by anything here."
      updated="9 November 2026"
    >
      <h2 id="seller">1. Who you are contracting with</h2>
      <p>
        The seller is <strong>{seller}</strong>
        {site.legalAddress ? `, ${site.legalAddress}` : ""}
        {site.companyNumber ? `, company number ${site.companyNumber}` : ""}
        {site.vatId ? `, VAT ID ${site.vatId}` : ""}. Contact:{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
      <p>
        Consumer contracts are governed by the mandatory consumer protection rules
        of your country of residence where those rules are more protective. The
        seller&apos;s place of establishment and governing-law details must be
        confirmed before launch.
      </p>

      <h2 id="account">2. Accounts</h2>
      <p>
        You must provide accurate information, keep your password secret and tell us
        promptly about unauthorised use. You are responsible for activity through
        your account. We may suspend an account for abuse, fraud, security risk or a
        legal requirement.
      </p>
      <p>
        You can delete your account at any time in{" "}
        <Link href="/account/security">Security &amp; data</Link>. Deleting the
        account does not automatically cancel a pending order or erase records we
        must retain by law.
      </p>

      <h2 id="products">3. Product information and price intelligence</h2>
      <p>
        We aim to describe products accurately, but images, specifications and
        availability can change. The &ldquo;buy signal&rdquo; is an informational
        comparison of recorded prices over a 90-day window. It is not a guarantee
        that a price will not fall further, nor financial advice.
      </p>
      <p>
        Where the catalogue is explicitly marked as demo data, prices and history
        are illustrative and orders for those items are disabled unless the
        operator explicitly enables them. For live catalogue items, the price shown
        at order time applies. Verify stock and final details before dispatch.
      </p>
      <p>
        Price history is built from observations supplied by authorised feeds. We do
        not scrape retailer APIs or present invented observations as live prices.
        Gaps and errors can occur; the price shown at checkout is the price that
        applies.
      </p>

      <h2 id="order">4. Placing an order</h2>
      <ol>
        <li>Add items to your cart and review the total, shipping and taxes.</li>
        <li>Place the order and send the bank transfer using the amount and reference shown.</li>
        <li>
          We display the order and bank-transfer instructions immediately. The
          contract is formed when the transfer arrives, is matched to your order
          and we confirm it. Placing the order reserves stock for 7 days.
        </li>
      </ol>
      <p>
        We may refuse or cancel an order for obvious pricing errors, unavailable
        stock, suspected fraud, sanctions restrictions, delivery impossibility or a
        legal requirement. If payment was taken, we refund it.
      </p>

      <h2 id="price">5. Prices, tax and shipping</h2>
      <p>
        Prices are shown in euro (EUR) and include VAT or other indirect taxes where
        applicable. Shipping is{" "}
        {site.flatShippingCents === 0
          ? "free"
          : `${formatPrice(site.flatShippingCents)} flat worldwide`}
        , free over {formatPrice(site.freeShippingThresholdCents)}. The exact amount
        is shown before payment. For deliveries outside the EU, import duties and
        local taxes may be payable by you and are not included unless the checkout
        says otherwise.
      </p>
      <p>
        We may change prices and availability at any time, but not after we have
        confirmed your order. Obvious errors do not bind us where you knew or should
        reasonably have known the price was wrong.
      </p>

      <h2 id="payment">6. Payment by bank transfer</h2>
      <p>
        We do not accept card payments. After you place an order, we show the
        recipient account name, IBAN, BIC (where required), the exact amount and a
        unique payment reference. You must send the full amount in EUR with the
        reference. Your bank may charge its own transfer fee; those fees are not
        paid by the seller.
      </p>
      <p>
        The contract is confirmed when the transfer arrives and is matched to your
        order. We reserve stock for 7 days. If the funds do not arrive in that
        period, the order may be cancelled and the stock released. Bank transfers
        are not instant and may take one or more business days, depending on your
        bank and the SWIFT network.
      </p>
      <p>
        For refunds we may ask for the account details needed to return the money.
        We will only use them for that refund. Never send card details, passwords or
        banking one-time codes by email.
      </p>

      <h2 id="delivery">7. Delivery</h2>
      <p>
        Estimated delivery is 3–10 business days after dispatch, depending on
        destination. Estimates are not guarantees. Risk passes as provided by
        applicable consumer law. If delivery is materially delayed, contact us and
        we will investigate; you may have a right to cancel the order.
      </p>

      <h2 id="support">7a. Voluntary support contributions</h2>
      <p>
        You may add an optional support contribution at checkout or through the
        support page. It is voluntary, buys no additional goods or services and
        creates no partnership, equity or investment. It is non-refundable except
        where consumer law requires otherwise. The payment reference identifies
        the contribution; it does not change the price of any product.
      </p>

      <h2 id="withdrawal">8. Right of withdrawal (EU/EEA/UK consumers)</h2>
      <p>
        You may withdraw from a distance contract within 14 days from the day you
        (or someone you nominated) receive the goods, without giving a reason. To
        exercise the right, tell us clearly by email at{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a> before the period ends. You
        can use the model withdrawal form below but it is not obligatory.
      </p>
      <p>
        Return the goods without undue delay and within 14 days of telling us. You
        bear the direct cost of return unless we agree otherwise or the goods are
        faulty. We may reduce the refund for diminished value caused by handling
        beyond what is necessary to establish the nature, characteristics and
        functioning of the goods.
      </p>
      <p>
        We refund within 14 days of receiving the withdrawal notice, but may withhold
        the refund until we receive the goods or evidence of return. The right does
        not apply to sealed goods opened for hygiene reasons, custom-made products,
        perishables, or digital content supplied with your prior consent once
        supply begins.
      </p>
      <blockquote>
        <strong>Model withdrawal form</strong>
        <br />
        To: {seller}, {site.legalAddress || "[seller address]"} ,{" "}
        {site.email}. I/we hereby give notice that I/we withdraw from my/our
        contract for the sale of the following goods: [goods]. Ordered on
        [date]/received on [date]. Name: [name]. Address: [address]. Signature
        (only if on paper). Date.
      </blockquote>

      <h2 id="returns">9. Returns and faulty goods</h2>
      <p>
        If a product is faulty, not as described or not fit for purpose, you have
        statutory rights in addition to the withdrawal right. Contact us with your
        order number and details; we may ask for photos or a diagnostic check.
        Nothing here excludes mandatory legal guarantees, including the EU two-year
        legal guarantee where applicable. Manufacturer warranties are separate and
        are provided by the manufacturer.
      </p>

      <h2 id="liability">10. Liability</h2>
      <p>
        We do not exclude liability for death or personal injury caused by
        negligence, fraud, gross negligence, or any liability that cannot lawfully
        be excluded. To the extent permitted, we are not liable for indirect or
        consequential loss, loss of profit, or data loss not caused by us. Our
        liability for breach of the contract is limited to the order value, except
        where consumer law provides otherwise.
      </p>

      <h2 id="ip">11. Intellectual property and brands</h2>
      <p>
        The store design, code and original content belong to their respective
        owners. Product names, logos and trademarks belong to their owners and are
        used for identification only. Nothing implies endorsement or affiliation
        unless expressly stated. Demo photography is used under the applicable
        stock-photo licence and must be replaced with licensed product photography
        before launch.
      </p>

      <h2 id="use">12. Acceptable use</h2>
      <p>
        Do not attempt to break security, scrape at a disruptive rate, place fraudulent
        orders, abuse returns, or use the store unlawfully. We may use technical
        measures and rate limits to protect the service.
      </p>

      <h2 id="complaints">13. Complaints and dispute resolution</h2>
      <p>
        Contact us first at <a href={`mailto:${site.email}`}>{site.email}</a>. We
        aim to acknowledge complaints within a reasonable time. You can also use a
        consumer ADR body or the courts of your country where the law allows.
      </p>

      <h2 id="changes">14. Changes</h2>
      <p>
        We may update these terms for future orders. The version in force when you
        place an order governs that order. Mandatory consumer rights are unaffected.
      </p>

      <p className="mt-8 rounded-xl border border-amber-300/20 bg-amber-300/[0.05] p-4 text-xs leading-6 text-amber-100/80">
        <strong className="text-amber-100">Operator note:</strong> complete seller
        identity, jurisdiction, VAT/company numbers, return address and delivery
        terms before launch. These terms are a technical template, not legal advice.
      </p>
    </LegalShell>
  );
}
