import { NextResponse } from "next/server";
import {
  adminConfigured,
  isAdminAuthorized,
} from "@/lib/admin";
import {
  adminProductSchema,
  deleteManualProduct,
  updateManualProduct,
} from "@/lib/admin-products";
import { handleApiError, readJson } from "@/lib/security";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!adminConfigured()) {
    return Response.json({ error: "Admin API is disabled." }, { status: 503 });
  }
  if (!(await isAdminAuthorized(request))) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    const productId = Number(id);
    if (!Number.isInteger(productId) || productId < 1) {
      return Response.json({ error: "Invalid product id." }, { status: 400 });
    }
    const input = adminProductSchema.parse(await readJson(request, 200_000));
    const product = await updateManualProduct(productId, input);
    return NextResponse.json(
      { ok: true, product },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!adminConfigured()) {
    return Response.json({ error: "Admin API is disabled." }, { status: 503 });
  }
  if (!(await isAdminAuthorized(request))) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    const productId = Number(id);
    if (!Number.isInteger(productId) || productId < 1) {
      return Response.json({ error: "Invalid product id." }, { status: 400 });
    }
    const name = await deleteManualProduct(productId);
    return NextResponse.json(
      { ok: true, deleted: name },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
