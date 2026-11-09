import { NextResponse } from "next/server";
import { z } from "zod";
import {
  addCartItem,
  getCartSummary,
  removeCartItem,
  updateCartItem,
} from "@/lib/cart";
import {
  ApiError,
  assertSameOrigin,
  handleApiError,
  readJson,
} from "@/lib/security";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const lineSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(10).optional(),
});

export async function GET() {
  try {
    const cart = await getCartSummary();
    return NextResponse.json(
      {
        count: cart.itemCount,
        subtotalCents: cart.subtotalCents,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const limit = rateLimit(clientKey(request, "cart-add"), 60, 60_000);
    if (!limit.allowed) throw new ApiError("Too many requests.", 429);
    const body = lineSchema.parse(await readJson(request));
    const count = await addCartItem(body.productId, body.quantity ?? 1);
    return NextResponse.json({ count }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const limit = rateLimit(clientKey(request, "cart-update"), 60, 60_000);
    if (!limit.allowed) throw new ApiError("Too many requests.", 429);
    const body = lineSchema
      .extend({ quantity: z.number().int().min(0).max(10) })
      .parse(await readJson(request));
    const count = await updateCartItem(body.productId, body.quantity);
    return NextResponse.json({ count }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    const limit = rateLimit(clientKey(request, "cart-remove"), 60, 60_000);
    if (!limit.allowed) throw new ApiError("Too many requests.", 429);
    const body = lineSchema.parse(await readJson(request));
    const count = await removeCartItem(body.productId);
    return NextResponse.json({ count }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return handleApiError(error);
  }
}
