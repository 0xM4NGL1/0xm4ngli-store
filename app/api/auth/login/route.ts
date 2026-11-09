import { NextResponse } from "next/server";
import { z } from "zod";
import {
  authenticateUser,
  createSessionRecord,
  getCurrentUser,
  setSessionCookie,
} from "@/lib/auth";
import { mergeGuestCartIntoAccount } from "@/lib/cart";
import {
  ApiError,
  assertSameOrigin,
  handleApiError,
  readJson,
} from "@/lib/security";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const ipLimit = rateLimit(clientKey(request, "login-ip"), 15, 15 * 60_000);
    if (!ipLimit.allowed) {
      throw new ApiError("Too many sign-in attempts. Try again later.", 429);
    }

    const body = schema.parse(await readJson(request));
    const accountLimit = rateLimit(
      clientKey(request, `login-account:${body.email.toLowerCase()}`),
      8,
      15 * 60_000,
    );
    if (!accountLimit.allowed) {
      throw new ApiError("Too many sign-in attempts. Try again later.", 429);
    }

    const user = await authenticateUser(body.email, body.password);
    if (!user) {
      throw new ApiError("Email or password is incorrect.", 401);
    }

    const session = await createSessionRecord(user.id);
    await mergeGuestCartIntoAccount(user.id);
    await setSessionCookie(session.token, session.expires);
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json(
    { authenticated: Boolean(user) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
