import { adminConfigured, isAdminAuthorized } from "@/lib/admin";
import { cancelPendingOrder } from "@/lib/orders";
import { handleApiError } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!adminConfigured()) {
    return Response.json({ error: "Admin API is disabled." }, { status: 503 });
  }
  if (!await isAdminAuthorized(_request)) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const cancelled = await cancelPendingOrder(id);
    return Response.json(
      { ok: true, cancelled },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
