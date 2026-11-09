import { NextResponse } from "next/server";
import { logoutCurrentSession } from "@/lib/auth";
import { assertSameOrigin, handleApiError } from "@/lib/security";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await logoutCurrentSession();
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
