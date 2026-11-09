import { dbGet, dbRun, nowIso } from "./db";
import { hashToken, newId, newToken, normalizeEmail } from "./auth";

type SubscriberRow = {
  id: string;
  email: string;
  status: string;
  token_hash: string;
  consent_version: string;
  created_at: string;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
};

export const NEWSLETTER_CONSENT_VERSION = "2026-11";

export async function subscribeToNewsletter(email: string) {
  const normalized = normalizeEmail(email);
  const existing = await dbGet<SubscriberRow>(
    "SELECT * FROM newsletter_subscribers WHERE email = ?",
    normalized,
  );
  const token = newToken();
  const now = nowIso();
  const tokenHash = hashToken(token);

  if (existing) {
    if (existing.status === "confirmed") {
      return { status: "already-confirmed" as const, token: null };
    }
    await dbRun(
      `UPDATE newsletter_subscribers
       SET status = 'pending', token_hash = ?, consent_version = ?,
           created_at = ?, unsubscribed_at = NULL
       WHERE id = ?`,
      tokenHash,
      NEWSLETTER_CONSENT_VERSION,
      now,
      existing.id,
    );
    return { status: "pending" as const, token };
  }

  await dbRun(
    `INSERT INTO newsletter_subscribers
      (id, email, status, token_hash, consent_version, created_at)
     VALUES (?, ?, 'pending', ?, ?, ?)`,
    newId("sub"),
    normalized,
    tokenHash,
    NEWSLETTER_CONSENT_VERSION,
    now,
  );
  return { status: "pending" as const, token };
}

export async function confirmNewsletter(token: string) {
  const row = await dbGet<SubscriberRow>(
    `SELECT * FROM newsletter_subscribers
     WHERE token_hash = ? AND status = 'pending'
       AND created_at > ?`,
    hashToken(token),
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  );
  if (!row) return false;
  await dbRun(
    `UPDATE newsletter_subscribers
     SET status = 'confirmed', confirmed_at = ?
     WHERE id = ?`,
    nowIso(),
    row.id,
  );
  return true;
}

export async function unsubscribeNewsletter(token: string) {
  const row = await dbGet<SubscriberRow>(
    "SELECT * FROM newsletter_subscribers WHERE token_hash = ?",
    hashToken(token),
  );
  if (!row) return false;
  await dbRun(
    `UPDATE newsletter_subscribers
     SET status = 'unsubscribed', unsubscribed_at = ?, token_hash = ?
     WHERE id = ?`,
    nowIso(),
    hashToken(newToken()),
    row.id,
  );
  return true;
}
