type Bucket = {
  count: number;
  resetAt: number;
};

const globalForLimits = globalThis as unknown as {
  __m4RateLimits?: Map<string, Bucket>;
};

const buckets =
  globalForLimits.__m4RateLimits ?? (globalForLimits.__m4RateLimits = new Map());

/**
 * Small in-process limiter suitable for a single Node instance.
 * For multi-instance deployments, back this with Redis or your platform's
 * edge rate limiter. It is deliberately fail-open for availability.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 10_000) {
      for (const [entryKey, entry] of buckets) {
        if (entry.resetAt <= now) buckets.delete(entryKey);
      }
    }
    return { allowed: true, remaining: limit - 1 };
  }

  bucket.count += 1;
  return {
    allowed: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
  };
}

export function clientKey(request: Request, scope: string) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return `${scope}:${ip}`;
}
