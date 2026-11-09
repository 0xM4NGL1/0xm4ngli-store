import { NextResponse } from "next/server";
import { z } from "zod";
import { subscribeToNewsletter } from "@/lib/newsletter";
import { sendNewsletterConfirmationEmail } from "@/lib/email";
import {
  ApiError,
  assertSameOrigin,
  handleApiError,
  readJson,
} from "@/lib/security";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  email: z.string().trim().email().max(254),
  consent: z.literal(true),
});

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const limit = rateLimit(clientKey(request, "newsletter"), 5, 15 * 60_000);
    if (!limit.allowed) {
      throw new ApiError("Too many attempts. Please try again later.", 429);
    }

    const body = bodySchema.parse(await readJson(request));
    const result = await subscribeToNewsletter(body.email);
    if (result.token) {
      await sendNewsletterConfirmationEmail(body.email, result.token);
    }

    return NextResponse.json(
      {
        ok: true,
        message:
          "If the address can be subscribed, a confirmation email is on its way.",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
