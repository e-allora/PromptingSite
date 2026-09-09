/**
 * Fixed-window rate limiter.
 *
 * ponytail: in-memory Map, so the limit is per server instance. On serverless
 * (Vercel) each instance keeps its own counter, meaning the effective limit is
 * looser than configured. That is acceptable for launch — this exists to stop
 * casual abuse of a paid API key, not to enforce billing. Swap the Map for
 * Upstash/Redis if the key starts burning money.
 */

type Window = { count: number; resetAt: number };

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 15; // per IP per window
const MAX_TRACKED_IPS = 10_000; // memory ceiling

const windows = new Map<string, Window>();

/** Drop expired entries; if still oversized, drop the ones expiring soonest. */
function evictIfNeeded(now: number): void {
  if (windows.size < MAX_TRACKED_IPS) return;

  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }

  if (windows.size < MAX_TRACKED_IPS) return;

  const sorted = [...windows.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt);
  for (const [key] of sorted.slice(0, Math.ceil(sorted.length / 2))) {
    windows.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

export function checkRateLimit(key: string, now: number = Date.now()): RateLimitResult {
  evictIfNeeded(now);

  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + WINDOW_MS;
    windows.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      resetAt,
      retryAfterSeconds: 0,
    };
  }

  if (existing.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: MAX_REQUESTS - existing.count,
    resetAt: existing.resetAt,
    retryAfterSeconds: 0,
  };
}

/** Test-only: reset shared state between cases. */
export function __resetRateLimits(): void {
  windows.clear();
}

export const RATE_LIMIT_CONFIG = { WINDOW_MS, MAX_REQUESTS } as const;
