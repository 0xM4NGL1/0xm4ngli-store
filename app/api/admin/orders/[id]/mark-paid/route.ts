import { z } from "zod";
import { adminConfigured, isAdminAuthorized } from "@/lib/admin";
import { markOrderPaid } from "@/lib/orders";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { readJson, handleApiError } from "@/lib/security";

export const runtime = "nodejs";

const schema = z.object({
  bankReference: z.string().trim().max(200).optional(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!adminConfigured()) {
    return Response.json({ error: "Admin API is disabled." }, { status: 503 });
  }
  if (!await isAdminAuthorized(request)) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = schema.parse(await readJson(request));
    const order = await markOrderPaid(id, {
      paymentReference: body.bankReference ?? null,
    });
    if (order.email) await sendOrderConfirmationEmail(order);
    return Response.json(
      { ok: true, order: { id: order.id, status: order.status, paidAt: order.paidAt } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
