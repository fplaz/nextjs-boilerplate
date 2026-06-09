import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { verifyTurnstileToken } from "@/lib/turnstile";

describe("verifyTurnstileToken", () => {
  const originalEnv = process.env.TURNSTILE_SECRET_KEY;

  beforeEach(() => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalEnv !== undefined) {
      process.env.TURNSTILE_SECRET_KEY = originalEnv;
    } else {
      delete process.env.TURNSTILE_SECRET_KEY;
    }
  });

  it("returns true when Cloudflare responds with success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true }))
    );

    const result = await verifyTurnstileToken("valid-token");
    expect(result).toBe(true);
  });

  it("returns false when Cloudflare responds with failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: false }))
    );

    const result = await verifyTurnstileToken("invalid-token");
    expect(result).toBe(false);
  });

  it("returns false when secret key is missing", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;

    const result = await verifyTurnstileToken("some-token");
    expect(result).toBe(false);
  });

  it("returns false when token is empty", async () => {
    const result = await verifyTurnstileToken("");
    expect(result).toBe(false);
  });

  it("returns false on network error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network error"));

    const result = await verifyTurnstileToken("valid-token");
    expect(result).toBe(false);
  });

  it("sends correct parameters to Cloudflare", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true }))
    );

    await verifyTurnstileToken("my-token");

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: expect.any(URLSearchParams),
      }
    );

    const body = fetchSpy.mock.calls[0][1]!.body as URLSearchParams;
    expect(body.get("secret")).toBe("test-secret");
    expect(body.get("response")).toBe("my-token");
  });
});
