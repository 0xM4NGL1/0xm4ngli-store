import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE = "m4_admin";
const SESSION_HOURS = 8;

function adminSecret() {
  return process.env.ADMIN_TOKEN ?? process.env.ADMIN_SYNC_TOKEN ?? "";
}

export function adminConfigured() {
  return Boolean(adminSecret());
}

export function isAdminRequest(request: Request) {
  const expected = adminSecret();
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const left = Buffer.from(token);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function adminTokenMatches(token: string) {
  const expected = adminSecret();
  if (!expected) return false;
  const left = Buffer.from(token);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

function sign(value: string) {
  return createHmac("sha256", adminSecret()).update(value).digest("base64url");
}

export function createAdminCookieValue() {
  const expires = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = String(expires);
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminCookieValue(value: string | undefined) {
  if (!value || !adminSecret()) return false;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;
  const expires = Number(payload);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  const expected = sign(payload);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function setAdminCookie() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, createAdminCookieValue(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function isAdminSession() {
  const jar = await cookies();
  return verifyAdminCookieValue(jar.get(ADMIN_COOKIE)?.value);
}

export async function isAdminAuthorized(request: Request) {
  return isAdminRequest(request) || (await isAdminSession());
}

export async function requireAdminPage() {
  if (!adminConfigured()) redirect("/admin/login?error=disabled");
  if (!(await isAdminSession())) redirect("/admin/login");
}
