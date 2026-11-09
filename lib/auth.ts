import { cache } from "react";
import { randomBytes, createHash, scrypt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { dbGet, dbRun, nowIso, transaction } from "./db";
import type { User } from "./types";

const SESSION_COOKIE = "m4_session";
const SESSION_DAYS = 30;
const KEY_LENGTH = 64;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

type UserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  marketing_consent: number;
  created_at: string;
  deleted_at: string | null;
};

function toUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    marketingConsent: Boolean(row.marketing_consent),
    createdAt: row.created_at,
  };
}

function deriveKey(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, SCRYPT_OPTIONS, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await deriveKey(password.normalize("NFKC"), salt);
  return `scrypt$${SCRYPT_OPTIONS.N}$${SCRYPT_OPTIONS.r}$${SCRYPT_OPTIONS.p}$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, saltValue, hashValue] = parts;
  const salt = Buffer.from(saltValue, "base64url");
  const expected = Buffer.from(hashValue, "base64url");
  const actual = await new Promise<Buffer>((resolve, reject) => {
    scrypt(
      password.normalize("NFKC"),
      salt,
      expected.length,
      {
        N: Number(n),
        r: Number(r),
        p: Number(p),
        maxmem: 64 * 1024 * 1024,
      },
      (error, key) => {
        if (error) reject(error);
        else resolve(key);
      },
    );
  }).catch(() => Buffer.alloc(0));

  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function newToken() {
  return randomBytes(32).toString("base64url");
}

export function newId(prefix: string) {
  return `${prefix}_${randomBytes(12).toString("base64url")}`;
}

export function sessionCookieOptions(expires: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  };
}

export async function createSessionRecord(userId: string) {
  const token = newToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await dbRun(
    `INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
    newId("ses"),
    userId,
    hashToken(token),
    nowIso(),
    expires.toISOString(),
  );
  return { token, expires };
}

export async function setSessionCookie(token: string, expires: Date) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, sessionCookieOptions(expires));
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(new Date(0)),
    maxAge: 0,
  });
}

export async function findUserByEmail(email: string) {
  return dbGet<UserRow>(
    "SELECT * FROM users WHERE email = ? AND deleted_at IS NULL",
    normalizeEmail(email),
  );
}

export async function findUserById(id: string) {
  return dbGet<UserRow>(
    "SELECT * FROM users WHERE id = ? AND deleted_at IS NULL",
    id,
  );
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const row = await dbGet<UserRow>(
    `SELECT users.* FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.token_hash = ?
       AND sessions.expires_at > ?
       AND users.deleted_at IS NULL`,
    hashToken(token),
    nowIso(),
  );

  return row ? toUser(row) : null;
}

export const getCurrentUserCached = cache(getCurrentUser);

export async function requireUser() {
  const user = await getCurrentUserCached();
  if (!user) redirect("/login?next=/account");
  return user;
}

export async function requireUserForRoute() {
  return getCurrentUser();
}

export async function destroySession(token: string) {
  await dbRun("DELETE FROM sessions WHERE token_hash = ?", hashToken(token));
}

export async function destroyAllSessions(userId: string) {
  await dbRun("DELETE FROM sessions WHERE user_id = ?", userId);
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  marketingConsent: boolean;
}) {
  const email = normalizeEmail(input.email);
  const existing = await findUserByEmail(email);
  if (existing) {
    const error = new Error("An account with this email already exists.");
    error.name = "EmailTakenError";
    throw error;
  }

  const id = newId("usr");
  const createdAt = nowIso();
  const passwordHash = await hashPassword(input.password);
  await dbRun(
    `INSERT INTO users
      (id, email, name, password_hash, marketing_consent, marketing_consent_at,
       terms_accepted_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    email,
    input.name.trim(),
    passwordHash,
    input.marketingConsent ? 1 : 0,
    input.marketingConsent ? createdAt : null,
    createdAt,
    createdAt,
    createdAt,
  );
  const row = await findUserById(id);
  if (!row) throw new Error("Account creation failed.");
  return toUser(row);
}

export async function authenticateUser(email: string, password: string) {
  const row = await findUserByEmail(email);
  if (!row) {
    // Keep the response time closer to a real password check.
    await deriveKey(password, randomBytes(16));
    return null;
  }
  const valid = await verifyPassword(password, row.password_hash);
  return valid ? toUser(row) : null;
}

export async function changePassword(userId: string, newPassword: string) {
  const hash = await hashPassword(newPassword);
  await dbRun(
    "UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
    hash,
    nowIso(),
    userId,
  );
  await destroyAllSessions(userId);
}

export async function updateUserProfile(
  userId: string,
  input: {
    name: string;
    email: string;
    marketingConsent: boolean;
  },
) {
  const email = normalizeEmail(input.email);
  const existing = await findUserByEmail(email);
  if (existing && existing.id !== userId) {
    const error = new Error("An account with this email already exists.");
    error.name = "EmailTakenError";
    throw error;
  }
  const now = nowIso();
  await dbRun(
    `UPDATE users SET
       name = ?, email = ?, marketing_consent = ?,
       marketing_consent_at = CASE
         WHEN ? = 1 AND marketing_consent = 0 THEN ?
         WHEN ? = 0 THEN NULL
         ELSE marketing_consent_at
       END,
       updated_at = ?
     WHERE id = ?`,
    input.name.trim(),
    email,
    input.marketingConsent ? 1 : 0,
    input.marketingConsent ? 1 : 0,
    now,
    input.marketingConsent ? 1 : 0,
    now,
    userId,
  );
  const row = await findUserById(userId);
  if (!row) throw new Error("Account not found.");
  return toUser(row);
}

export async function createPasswordReset(userId: string) {
  const token = newToken();
  await dbRun("DELETE FROM password_resets WHERE user_id = ?", userId);
  await dbRun(
    `INSERT INTO password_resets (id, user_id, token_hash, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    newId("rst"),
    userId,
    hashToken(token),
    new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    nowIso(),
  );
  return token;
}

export async function resetPasswordWithToken(token: string, password: string) {
  const row = await dbGet<{ id: string; user_id: string }>(
    `SELECT id, user_id FROM password_resets
     WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?`,
    hashToken(token),
    nowIso(),
  );
  if (!row) return false;
  const hash = await hashPassword(password);
  await transaction(async () => {
    await dbRun(
      "UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
      hash,
      nowIso(),
      row.user_id,
    );
    await dbRun(
      "UPDATE password_resets SET used_at = ? WHERE id = ?",
      nowIso(),
      row.id,
    );
    await dbRun("DELETE FROM sessions WHERE user_id = ?", row.user_id);
  });
  return true;
}

export async function deleteAccount(userId: string) {
  // Order records are retained for accounting/tax obligations, detached from
  // the account. Everything else is deleted immediately via cascade.
  await transaction(async () => {
    await dbRun(
      "UPDATE orders SET user_id = NULL, updated_at = ? WHERE user_id = ?",
      nowIso(),
      userId,
    );
    await dbRun("DELETE FROM users WHERE id = ?", userId);
  });
}

export async function getSessionToken() {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}

export async function logoutCurrentSession() {
  const token = await getSessionToken();
  if (token) await destroySession(token);
  await clearSessionCookie();
}

export type { UserRow };
