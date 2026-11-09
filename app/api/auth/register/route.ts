import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createSessionRecord,
  getCurrentUser,
  registerUser,
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
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(10).max(200),
  marketingConsent: z.boolean().default(false),
  acceptTerms: z.literal(true),
});

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const limit = rateLimit(clientKey(request, "register"), 5, 60 * 60_000);
    if (!limit.allowed) {
      throw new ApiError("Too many accounts created. Try again later.", 429);
    }

    const body = schema.parse(await readJson(request));
    const user = await registerUser({
      name: body.name,
      email: body.email,
      password: body.password,
      marketingConsent: body.marketingConsent,
    });

    const session = await createSessionRecord(user.id);
    await mergeGuestCartIntoAccount(user.id);
    await setSessionCookie(session.token, session.expires);

    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof Error && error.name === "EmailTakenError") {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }
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
