import { dbGet } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const row = await dbGet<{ ok: number }>("SELECT 1 AS ok");
    return Response.json(
      {
        status: row?.ok === 1 ? "ok" : "degraded",
        time: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ status: "error" }, { status: 503 });
  }
}
