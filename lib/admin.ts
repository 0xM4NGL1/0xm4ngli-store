import { timingSafeEqual } from "node:crypto";

export function isAdminRequest(request: Request) {
  const expected = process.env.ADMIN_TOKEN ?? process.env.ADMIN_SYNC_TOKEN;
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const left = Buffer.from(token);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_TOKEN ?? process.env.ADMIN_SYNC_TOKEN);
}
