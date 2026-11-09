import { syncPriceFeed } from "@/lib/feed";
import { dbGet } from "@/lib/db";
import { adminConfigured, isAdminRequest } from "@/lib/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!adminConfigured()) {
    return Response.json({ error: "Sync endpoint is disabled." }, { status: 503 });
  }
  if (!isAdminRequest(request)) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 5_000_000) {
    return Response.json({ error: "Feed too large." }, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  try {
    const result = await syncPriceFeed(payload);
    const row = await dbGet<{ count: number | bigint }>(
      "SELECT COUNT(*) AS count FROM products",
    );
    return Response.json({
      ok: true,
      ...result,
      productCount: Number(row?.count ?? 0),
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Price feed sync failed", error);
    return Response.json(
      {
        error:
          error instanceof Error && error.name === "ZodError"
            ? "Feed validation failed."
            : "Feed sync failed.",
      },
      { status: 422 },
    );
  }
}
