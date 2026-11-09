import { NextResponse } from "next/server";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) {
    throw new ApiError("Missing origin header.", 403);
  }

  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    throw new ApiError("Invalid origin header.", 403);
  }

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host || originUrl.host !== host) {
    throw new ApiError("Cross-site request blocked.", 403);
  }
}

export function assertJson(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new ApiError("Expected a JSON request.", 415);
  }
}

export async function readJson(request: Request, maxBytes = 100_000) {
  assertJson(request);
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > maxBytes) {
    throw new ApiError("Request body is too large.", 413);
  }
  const text = await request.text();
  if (text.length > maxBytes) {
    throw new ApiError("Request body is too large.", 413);
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError("Invalid JSON body.", 400);
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return jsonError(error.message, error.status);
  }
  if (error instanceof Error && error.name === "ZodError") {
    return jsonError("Please check the details you entered.", 422);
  }
  console.error("API error", error);
  return jsonError("Something went wrong. Please try again.", 500);
}

export function safeNextPath(value: unknown, fallback = "/account") {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.startsWith("/api/")) return fallback;
  return value;
}
