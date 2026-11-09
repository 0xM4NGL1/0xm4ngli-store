import { timingSafeEqual } from "node:crypto";
import { releaseExpiredOrders } from "@/lib/orders";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json({ error: "Cron is not configured." }, { status: 503 });
  }
  const authorization = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const left = Buffer.from(authorization);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }

  await releaseExpiredOrders();
  return Response.json(
    { ok: true, releasedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
