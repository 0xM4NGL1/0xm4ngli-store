import { site } from "./site";
import type { Order } from "./types";
import { formatPrice } from "./format";
import { formatIban, getBankDetails } from "./payments";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  if (!emailConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[email:dev] To: ${input.to}\nSubject: ${input.subject}\n${input.text}`,
      );
    } else {
      console.warn("Email not sent: RESEND_API_KEY / EMAIL_FROM are not configured.");
    }
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("Email provider error", response.status, await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("Email provider unreachable", error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string,
) {
  const url = `${site.url}/reset-password?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to,
    subject: "Reset your 0xm4ngli password",
    text: `Hi ${name},\n\nUse this link within 30 minutes to reset your password:\n${url}\n\nIf you did not request this, you can ignore this email.`,
    html: `<p>Hi ${escapeHtml(name)},</p><p>Use the link below within 30 minutes to reset your password.</p><p><a href="${url}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`,
  });
}

export async function sendNewsletterConfirmationEmail(to: string, token: string) {
  const url = `${site.url}/newsletter/confirm?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to,
    subject: "Confirm your 0xm4ngli newsletter subscription",
    text: `Confirm your subscription here (valid for 24 hours):\n${url}\n\nIf you did not request this, ignore this email.`,
    html: `<p>Confirm your subscription here (valid for 24 hours):</p><p><a href="${url}">Confirm subscription</a></p><p>If you did not request this, ignore this email.</p>`,
  });
}

export async function sendOrderConfirmationEmail(order: Order) {
  if (!order.email) return false;
  const items = order.items
    .map(
      (item) =>
        `${item.quantity} × ${item.name} — ${formatPrice(item.unitPriceCents * item.quantity, order.currency)}`,
    )
    .join("\n");
  const supportLine =
    order.supportCents > 0
      ? `\nVoluntary support: ${formatPrice(order.supportCents, order.currency)}`
      : "";
  const url = `${site.url}/checkout/success?token=${encodeURIComponent(order.publicToken)}`;
  return sendEmail({
    to: order.email,
    subject: `Payment received — order ${order.id} confirmed`,
    text: `Thanks for your order. Your bank transfer has been matched and the order is confirmed.\n\n${items}${supportLine}\n\nShipping: ${formatPrice(order.shippingCents, order.currency)}\nTotal: ${formatPrice(order.totalCents, order.currency)}\n\nView your order: ${url}\n\nYou can request a return within 14 days of delivery under EU consumer law.`,
    html: `<p>Thanks for your order. Your bank transfer has been matched and the order is confirmed.</p><p>${escapeHtml(items).replaceAll("\n", "<br>")}${supportLine ? `<br>Voluntary support: ${formatPrice(order.supportCents, order.currency)}` : ""}</p><p>Shipping: ${formatPrice(order.shippingCents, order.currency)}<br>Total: ${formatPrice(order.totalCents, order.currency)}</p><p><a href="${url}">View your order</a></p><p>You can request a return within 14 days of delivery under EU consumer law.</p>`,
  });
}

export async function sendBankTransferInstructionsEmail(order: Order) {
  if (!order.email) return false;
  const bank = getBankDetails();
  if (!bank.configured) return false;

  const items = order.items.length
    ? order.items
        .map(
          (item) =>
            `${item.quantity} × ${item.name} — ${formatPrice(item.unitPriceCents * item.quantity, order.currency)}`,
        )
        .join("\n")
    : "Voluntary support contribution";
  const supportLine =
    order.supportCents > 0
      ? `\nVoluntary support: ${formatPrice(order.supportCents, order.currency)}`
      : "";
  const url = `${site.url}/checkout/success?token=${encodeURIComponent(order.publicToken)}`;
  const bankText = [
    `Account name: ${bank.accountName}`,
    `IBAN: ${formatIban(bank.iban)}`,
    bank.bic ? `BIC: ${bank.bic}` : "",
    bank.bankName ? `Bank: ${bank.bankName}` : "",
    `Amount: ${formatPrice(order.totalCents, order.currency)}`,
    `Reference: ${order.paymentReference ?? order.id}`,
    "Currency: EUR",
  ]
    .filter(Boolean)
    .join("\n");

  return sendEmail({
    to: order.email,
    subject: `Complete your bank transfer — order ${order.id}`,
    text: `Your order is reserved for 7 days. Send the exact amount using the reference below. Your order is confirmed after the funds arrive and are matched.\n\n${items}${supportLine}\n\n${bankText}\n\nOrder page: ${url}\n\nYour bank may charge a transfer fee; send the full amount in EUR. Do not send card details by email.`,
    html: `<p>Your order is reserved for 7 days. Send the exact amount using the reference below. Your order is confirmed after the funds arrive and are matched.</p><p>${escapeHtml(items).replaceAll("\n", "<br>")}${supportLine ? `<br>Voluntary support: ${formatPrice(order.supportCents, order.currency)}` : ""}</p><pre style="font-family:ui-monospace,monospace;line-height:1.6;white-space:pre-wrap">${escapeHtml(bankText)}</pre><p><a href="${url}">View your order</a></p><p>Your bank may charge a transfer fee; send the full amount in EUR. Do not send card details by email.</p>`,
  });
}
