import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/legal-shell";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description:
    "Worldwide shipping rates, delivery estimates, the 14-day EU withdrawal right, faulty goods and refunds.",
  alternates: { canonical: "/legal/shipping" },
};

export default function ShippingPage() {
  return (
    <LegalShell
      title="Shipping & returns"
      description="Clear delivery expectations and a straightforward returns process. Your statutory rights are not affected."
      updated="9 November 2026"
    >
      <h2 id="where">1. Where we ship</h2>
      <p>
        We offer tracked delivery to the countries enabled in checkout. The allowed
        list is maintained in the payment configuration and can be narrowed for
        operational, sanctions or carrier reasons. If your country is not listed at
        checkout, contact us before ordering.
      </p>
      <p>
        For destinations outside the EU/EEA, import duties, VAT/GST or customs
        handling fees may be charged by the carrier or customs authority. Unless the
        checkout explicitly says duties are included, those charges are your
        responsibility.
      </p>

      <h2 id="rates">2. Rates and timing</h2>
      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Cost</th>
            <th>Estimate after dispatch</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Tracked worldwide</td>
            <td>
              {formatPrice(site.flatShippingCents)} flat, free over{" "}
              {formatPrice(site.freeShippingThresholdCents)}
            </td>
            <td>3–10 business days</td>
          </tr>
        </tbody>
      </table>
      <p>
        Orders are prepared after payment is confirmed. Business days exclude
        weekends and public holidays. Tracking is sent when the parcel leaves the
        warehouse. Delivery estimates are not guaranteed, especially during peak
        periods or customs delays.
      </p>

      <h2 id="returns">3. 14-day right of withdrawal</h2>
      <p>
        If you are a consumer in the EU/EEA or UK, you may withdraw from the contract
        within 14 days from delivery without giving a reason. Tell us clearly by
        email at <a href={`mailto:${site.email}`}>{site.email}</a> with your order
        number. You can use the model form in the <Link href="/legal/terms#withdrawal">terms</Link>.
      </p>
      <p>
        Return the goods within 14 days of telling us. You normally pay the direct
        cost of return. We refund the price and standard shipping within 14 days of
        receiving the withdrawal notice, but may withhold the refund until we receive
        the goods or evidence of return. We may reduce the refund for diminished
        value caused by handling beyond what is necessary to inspect the product.
      </p>

      <h2 id="process">4. How to start a return</h2>
      <ol>
        <li>
          Email <a href={`mailto:${site.email}`}>{site.email}</a> with your order
          number and reason.
        </li>
        <li>
          We reply with the return address and any carrier instructions. Do not send
          an item to an unconfirmed address.
        </li>
        <li>
          Pack it securely with all accessories and include the order number. Keep
          proof of postage.
        </li>
        <li>
          We inspect the return and refund by bank transfer to the account details
          you provide for the refund. Bank processing times depend on your bank.
        </li>
      </ol>

      <h2 id="exclusions">5. Exceptions</h2>
      <p>
        The withdrawal right does not apply to sealed goods opened for hygiene
        reasons, custom-made products, perishables, or digital content once supply has
        begun with your prior consent. This does not affect your rights if goods are
        faulty.
      </p>

      <h2 id="faulty">6. Faulty or incorrect goods</h2>
      <p>
        If something arrives damaged, faulty or not as described, contact us promptly
        with photos and your order number. You have statutory rights, including the
        EU legal guarantee where applicable. We will arrange repair, replacement,
        price reduction or refund as the law requires. Do not attempt a repair that
        could worsen the damage before contacting us.
      </p>

      <h2 id="cancellation">7. Cancelling before dispatch</h2>
      <p>
        Contact us as soon as possible. If the order has not been dispatched, we will
        cancel and refund it. If it has left the warehouse, use the withdrawal
        process above.
      </p>

      {site.demoCatalog && (
        <>
          <h2 id="demo">8. Demo catalogue</h2>
          <p>
            While the store displays demo catalogue data, no goods are shipped.
            These policies apply once a live, authorised catalogue and real
            payments are enabled.
          </p>
        </>
      )}

      <h2 id="contact">9. Contact</h2>
      <p>
        Shipping or returns question? Email{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>. Include your order ID. We
        aim to reply within two business days. See the{" "}
        <Link href="/legal/terms">terms</Link> and{" "}
        <Link href="/legal/privacy">privacy policy</Link> for more.
      </p>
    </LegalShell>
  );
}
