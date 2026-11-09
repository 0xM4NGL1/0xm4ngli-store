import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createSupportOrder, releaseExpiredOrders } from "@/lib/orders";
import { isBankTransferConfigured } from "@/lib/payments";
import { sendBankTransferInstructionsEmail } from "@/lib/email";
import {
  ApiError,
  assertSameOrigin,
  handleApiError,
  readJson,
} from "@/lib/security";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  amountCents: z.number().int().min(100).max(50_000),
  email: z.string().trim().email().max(254).optional(),
});

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const limit = rateLimit(clientKey(request, "support"), 8, 60_000);
    if (!limit.allowed) throw new ApiError("Too many requests.", 429);
    if (!isBankTransferConfigured()) {
      throw new ApiError(
        "Bank transfer details are not configured yet. Please try again later.",
        503,
      );
    }

    const body = schema.parse(await readJson(request));
    await releaseExpiredOrders();
    const user = await getCurrentUser();
    const email = user?.email ?? body.email ?? null;
    const order = await createSupportOrder({
      userId: user?.id ?? null,
      email,
      amountCents: body.amountCents,
    });
    if (order.email) await sendBankTransferInstructionsEmail(order);

    return NextResponse.json(
      {
        url: `/checkout/success?token=${encodeURIComponent(order.publicToken)}`,
        orderId: order.id,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
