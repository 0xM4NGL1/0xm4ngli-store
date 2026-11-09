import { NextResponse } from "next/server";
import {
  adminConfigured,
  isAdminAuthorized,
} from "@/lib/admin";
import {
  adminProductSchema,
  createManualProduct,
  listAllProducts,
} from "@/lib/admin-products";
import { handleApiError, readJson } from "@/lib/security";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!adminConfigured()) {
    return Response.json({ error: "Admin API is disabled." }, { status: 503 });
  }
  if (!(await isAdminAuthorized(request))) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }
  const products = await listAllProducts();
  return Response.json(
    { count: products.length, products },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (!adminConfigured()) {
    return Response.json({ error: "Admin API is disabled." }, { status: 503 });
  }
  if (!(await isAdminAuthorized(request))) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }
  try {
    const input = adminProductSchema.parse(await readJson(request, 200_000));
    const product = await createManualProduct(input);
    return NextResponse.json(
      { ok: true, product },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
