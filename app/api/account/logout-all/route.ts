import { NextResponse } from "next/server";
import {
  createSessionRecord,
  destroyAllSessions,
  getCurrentUser,
  setSessionCookie,
} from "@/lib/auth";
import { assertSameOrigin, handleApiError } from "@/lib/security";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    await destroyAllSessions(user.id);
    const session = await createSessionRecord(user.id);
    await setSessionCookie(session.token, session.expires);
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
