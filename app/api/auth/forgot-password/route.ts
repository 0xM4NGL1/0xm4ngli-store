import { NextResponse } from "next/server";
import { z } from "zod";
import { createPasswordReset, findUserByEmail } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import {
  ApiError,
  assertSameOrigin,
  handleApiError,
  readJson,
} from "@/lib/security";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().trim().email().max(254),
});

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const limit = rateLimit(clientKey(request, "forgot"), 5, 15 * 60_000);
    if (!limit.allowed) {
      throw new ApiError("Too many requests. Please try again later.", 429);
    }

    const body = schema.parse(await readJson(request));
    const user = await findUserByEmail(body.email);
    if (user) {
      const token = await createPasswordReset(user.id);
      await sendPasswordResetEmail(user.email, user.name, token);
    }

    return NextResponse.json(
      {
        ok: true,
        message:
          "If an account exists for that address, a reset link has been sent.",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
