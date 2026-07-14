import { beforeEach, describe, expect, it } from "vitest";
import { RATE_LIMIT_CONFIG, __resetRateLimits, checkRateLimit } from "./rate-limit";

const { MAX_REQUESTS, WINDOW_MS } = RATE_LIMIT_CONFIG;

describe("checkRateLimit", () => {
  beforeEach(__resetRateLimits);

  it("allows requests up to the cap", () => {
    for (let i = 0; i < MAX_REQUESTS; i++) {
      expect(checkRateLimit("1.1.1.1", 1000).allowed).toBe(true);
    }
  });

  it("blocks the request after the cap", () => {
    for (let i = 0; i < MAX_REQUESTS; i++) checkRateLimit("1.1.1.1", 1000);

    const blocked = checkRateLimit("1.1.1.1", 1000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("counts each key separately", () => {
    for (let i = 0; i < MAX_REQUESTS; i++) checkRateLimit("1.1.1.1", 1000);

    expect(checkRateLimit("1.1.1.1", 1000).allowed).toBe(false);
    expect(checkRateLimit("2.2.2.2", 1000).allowed).toBe(true);
  });

  it("counts down remaining accurately", () => {
    expect(checkRateLimit("1.1.1.1", 1000).remaining).toBe(MAX_REQUESTS - 1);
    expect(checkRateLimit("1.1.1.1", 1000).remaining).toBe(MAX_REQUESTS - 2);
  });

  it("resets once the window elapses", () => {
    for (let i = 0; i < MAX_REQUESTS; i++) checkRateLimit("1.1.1.1", 1000);
    expect(checkRateLimit("1.1.1.1", 1000).allowed).toBe(false);

    const afterWindow = 1000 + WINDOW_MS + 1;
    const fresh = checkRateLimit("1.1.1.1", afterWindow);
    expect(fresh.allowed).toBe(true);
    expect(fresh.remaining).toBe(MAX_REQUESTS - 1);
  });

  it("does not reset one millisecond early", () => {
    for (let i = 0; i < MAX_REQUESTS; i++) checkRateLimit("1.1.1.1", 1000);
    expect(checkRateLimit("1.1.1.1", 1000 + WINDOW_MS - 1).allowed).toBe(false);
  });
});
