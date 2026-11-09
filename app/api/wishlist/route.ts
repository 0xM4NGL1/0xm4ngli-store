import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getProductById } from "@/lib/products";
import { toggleWishlist } from "@/lib/wishlist";
import {
  ApiError,
  assertSameOrigin,
  handleApiError,
  readJson,
} from "@/lib/security";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  productId: z.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getCurrentUser();
    if (!user) throw new ApiError("Sign in to use your wishlist.", 401);

    const limit = rateLimit(clientKey(request, "wishlist"), 60, 60_000);
    if (!limit.allowed) throw new ApiError("Too many requests.", 429);

    const body = bodySchema.parse(await readJson(request));
    if (!(await getProductById(body.productId))) {
      throw new ApiError("Product not found.", 404);
    }
    const wishlisted = await toggleWishlist(user.id, body.productId);
    return NextResponse.json(
      { wishlisted },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
