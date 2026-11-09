import { NextResponse } from "next/server";
import { z } from "zod";
import {
  confirmNewsletter,
  unsubscribeNewsletter,
} from "@/lib/newsletter";
import {
  ApiError,
  assertSameOrigin,
  handleApiError,
  readJson,
} from "@/lib/security";

const schema = z.object({
  token: z.string().min(20).max(200),
  mode: z.enum(["confirm", "unsubscribe"]),
});

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = schema.parse(await readJson(request));
    const ok =
      body.mode === "confirm"
        ? await confirmNewsletter(body.token)
        : await unsubscribeNewsletter(body.token);
    if (!ok) {
      throw new ApiError("This link is invalid or has expired.", 400);
    }
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
