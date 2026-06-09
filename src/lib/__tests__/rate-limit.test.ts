import { describe, it, expect, vi, beforeEach } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("allows the first request", () => {
    const result = rateLimit("ip-first", 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.retryAfterSeconds).toBe(0);
  });

  it("allows requests up to the limit", () => {
    const key = "ip-limit";
    for (let i = 0; i < 5; i++) {
      const result = rateLimit(key, 5, 60_000);
      expect(result.allowed).toBe(true);
    }
  });

  it("rejects the request exceeding the limit", () => {
    const key = "ip-over";
    for (let i = 0; i < 5; i++) {
      rateLimit(key, 5, 60_000);
    }
    const result = rateLimit(key, 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("returns a positive retryAfterSeconds when rejected", () => {
    const key = "ip-retry";
    for (let i = 0; i < 10; i++) {
      rateLimit(key, 10, 60_000);
    }
    const result = rateLimit(key, 10, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThanOrEqual(1);
    expect(result.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it("allows requests again after the window expires", () => {
    const key = "ip-expire";
    for (let i = 0; i < 5; i++) {
      rateLimit(key, 5, 60_000);
    }
    const rejected = rateLimit(key, 5, 60_000);
    expect(rejected.allowed).toBe(false);

    // Advance past the window
    vi.advanceTimersByTime(60_001);

    const allowed = rateLimit(key, 5, 60_000);
    expect(allowed.allowed).toBe(true);
    expect(allowed.retryAfterSeconds).toBe(0);
  });
});
