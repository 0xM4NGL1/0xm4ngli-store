import { NextResponse } from "next/server";
import { z } from "zod";
import {
  adminConfigured,
  adminTokenMatches,
  clearAdminCookie,
  setAdminCookie,
} from "@/lib/admin";
import {
  ApiError,
  assertSameOrigin,
  handleApiError,
  readJson,
} from "@/lib/security";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const schema = z.object({ token: z.string().min(10).max(500) });

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const limit = rateLimit(clientKey(request, "admin-login"), 8, 15 * 60_000);
    if (!limit.allowed) throw new ApiError("Too many attempts.", 429);
    if (!adminConfigured()) {
      throw new ApiError("Admin access is disabled. Set ADMIN_TOKEN.", 503);
    }

    const body = schema.parse(await readJson(request));
    if (!adminTokenMatches(body.token)) {
      throw new ApiError("Invalid admin token.", 401);
    }

    await setAdminCookie();
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    await clearAdminCookie();
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
