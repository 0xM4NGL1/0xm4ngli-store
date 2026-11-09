import { NextResponse } from "next/server";
import { adminConfigured, isAdminAuthorized } from "@/lib/admin";
import { purgeStarterProducts } from "@/lib/admin-products";
import { handleApiError } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!adminConfigured()) {
    return Response.json({ error: "Admin API is disabled." }, { status: 503 });
  }
  if (!(await isAdminAuthorized(request))) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }
  try {
    const removed = await purgeStarterProducts();
    return NextResponse.json(
      { ok: true, removed },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
