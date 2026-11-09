import { NextResponse } from "next/server";
import { clearCart } from "@/lib/cart";
import { assertSameOrigin, handleApiError } from "@/lib/security";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await clearCart();
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
