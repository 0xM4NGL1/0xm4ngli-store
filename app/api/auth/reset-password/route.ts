import { NextResponse } from "next/server";
import { z } from "zod";
import { resetPasswordWithToken } from "@/lib/auth";
import {
  ApiError,
  assertSameOrigin,
  handleApiError,
  readJson,
} from "@/lib/security";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(10).max(200),
});

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const limit = rateLimit(clientKey(request, "reset"), 10, 15 * 60_000);
    if (!limit.allowed) {
      throw new ApiError("Too many requests. Please try again later.", 429);
    }

    const body = schema.parse(await readJson(request));
    const reset = await resetPasswordWithToken(body.token, body.password);
    if (!reset) {
      throw new ApiError("This reset link is invalid or has expired.", 400);
    }
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
