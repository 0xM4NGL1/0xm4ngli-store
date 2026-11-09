import { NextResponse } from "next/server";
import { z } from "zod";
import {
  changePassword,
  clearSessionCookie,
  createSessionRecord,
  deleteAccount,
  getCurrentUser,
  setSessionCookie,
  updateUserProfile,
  verifyPassword,
  findUserById,
} from "@/lib/auth";
import {
  ApiError,
  assertSameOrigin,
  handleApiError,
  readJson,
} from "@/lib/security";
import { clientKey, rateLimit } from "@/lib/rate-limit";

const updateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  marketingConsent: z.boolean(),
  currentPassword: z.string().max(200).optional(),
});

const deleteSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  confirmation: z.literal("DELETE"),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) throw new ApiError("Not signed in.", 401);
  return NextResponse.json(
    { user },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getCurrentUser();
    if (!user) throw new ApiError("Not signed in.", 401);
    const limit = rateLimit(clientKey(request, "account-update"), 20, 15 * 60_000);
    if (!limit.allowed) throw new ApiError("Too many requests.", 429);

    const body = updateSchema.parse(await readJson(request));
    if (body.email.toLowerCase() !== user.email.toLowerCase()) {
      if (!body.currentPassword) {
        throw new ApiError("Enter your current password to change your email.", 422);
      }
      const row = await findUserById(user.id);
      if (!row || !(await verifyPassword(body.currentPassword, row.password_hash))) {
        throw new ApiError("Current password is incorrect.", 403);
      }
    }

    const updated = await updateUserProfile(user.id, {
      name: body.name,
      email: body.email,
      marketingConsent: body.marketingConsent,
    });
    return NextResponse.json(
      { ok: true, user: updated },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof Error && error.name === "EmailTakenError") {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getCurrentUser();
    if (!user) throw new ApiError("Not signed in.", 401);
    const limit = rateLimit(clientKey(request, "account-delete"), 5, 60 * 60_000);
    if (!limit.allowed) throw new ApiError("Too many requests.", 429);

    const body = deleteSchema.parse(await readJson(request));
    const row = await findUserById(user.id);
    if (!row || !(await verifyPassword(body.currentPassword, row.password_hash))) {
      throw new ApiError("Password is incorrect.", 403);
    }

    await deleteAccount(user.id);
    await clearSessionCookie();
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// Password changes live in /api/account/password, but the same route accepts a
// new password once authenticated to keep the UI simple.
const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(10).max(200),
});

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getCurrentUser();
    if (!user) throw new ApiError("Not signed in.", 401);
    const limit = rateLimit(clientKey(request, "account-password"), 5, 60 * 60_000);
    if (!limit.allowed) throw new ApiError("Too many requests.", 429);

    const body = passwordSchema.parse(await readJson(request));
    const row = await findUserById(user.id);
    if (!row || !(await verifyPassword(body.currentPassword, row.password_hash))) {
      throw new ApiError("Current password is incorrect.", 403);
    }
    await changePassword(user.id, body.newPassword);
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
