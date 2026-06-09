import { describe, it, expect, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  updateProfile,
  changeEmail,
  changePassword,
  deleteAccount,
} from "../user.service";

// ---------------------------------------------------------------------------
// Mock Supabase
// ---------------------------------------------------------------------------

function createChainMock(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.update = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.select = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(result);
  // Allow chain to be awaited directly (for queries without .single())
  chain.then = (
    resolve: (v: unknown) => unknown,
    reject: (e: unknown) => unknown
  ) => Promise.resolve(result).then(resolve, reject);
  return chain;
}

function mockSupabase(opts?: {
  dbResult?: { data: unknown; error: unknown };
  authResult?: { data: unknown; error: unknown };
}) {
  const sb = {
    from: vi.fn(() =>
      createChainMock(opts?.dbResult ?? { data: null, error: null })
    ),
    auth: {
      updateUser: vi
        .fn()
        .mockResolvedValue(
          opts?.authResult ?? { data: {}, error: null }
        ),
      signInWithPassword: vi
        .fn()
        .mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      admin: {
        deleteUser: vi
          .fn()
          .mockResolvedValue(
            opts?.authResult ?? { data: {}, error: null }
          ),
      },
    },
  } as unknown as SupabaseClient;
  return sb;
}

// ---------------------------------------------------------------------------
// updateProfile
// ---------------------------------------------------------------------------

describe("updateProfile", () => {
  const valid = { firstName: "John", lastName: "Doe" };

  it("returns success on valid update", async () => {
    const sb = mockSupabase();
    const result = await updateProfile(sb, "user-1", valid);
    expect(result.error).toBeNull();
  });

  it("returns error on Supabase failure", async () => {
    const sb = mockSupabase({
      dbResult: { data: null, error: { message: "db error" } },
    });

    const result = await updateProfile(sb, "user-1", valid);
    expect(result.error).toBe("db error");
  });

  it("returns Zod error for empty first name", async () => {
    const sb = mockSupabase();
    const result = await updateProfile(sb, "user-1", {
      firstName: "",
      lastName: "Doe",
    });
    expect(result.error).toContain("First name is required");
  });
});

// ---------------------------------------------------------------------------
// changeEmail
// ---------------------------------------------------------------------------

describe("changeEmail", () => {
  it("returns success message on valid email", async () => {
    const sb = mockSupabase();
    const result = await changeEmail(sb, { email: "new@example.com" });
    expect(result.error).toBeNull();
    expect(result.data).toContain("Check your new email");
  });

  it("returns error on Supabase failure", async () => {
    const sb = mockSupabase({
      authResult: { data: {}, error: { message: "auth error" } },
    });

    const result = await changeEmail(sb, { email: "new@example.com" });
    expect(result.error).toBe("Unable to use that email address. Please try a different one.");
  });

  it("returns Zod error for invalid email", async () => {
    const sb = mockSupabase();
    const result = await changeEmail(sb, { email: "bad" });
    expect(result.error).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// changePassword
// ---------------------------------------------------------------------------

describe("changePassword", () => {
  const valid = { currentPassword: "OldPass!1", password: "Str0ng!Pass", confirmPassword: "Str0ng!Pass" };

  it("returns success on valid input", async () => {
    const sb = mockSupabase();
    const result = await changePassword(sb, "user@example.com", valid);
    expect(result.error).toBeNull();
  });

  it("returns error on Supabase failure", async () => {
    const sb = mockSupabase({
      authResult: { data: {}, error: { message: "auth error" } },
    });

    const result = await changePassword(sb, "user@example.com", valid);
    expect(result.error).toBe("auth error");
  });

  it("returns Zod error for weak password", async () => {
    const sb = mockSupabase();
    const result = await changePassword(sb, "user@example.com", {
      currentPassword: "OldPass!1",
      password: "weak",
      confirmPassword: "weak",
    });
    expect(result.error).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// deleteAccount
// ---------------------------------------------------------------------------

describe("deleteAccount", () => {
  it("returns success on deletion", async () => {
    const sb = mockSupabase();
    const admin = mockSupabase();
    const result = await deleteAccount(sb, admin, "user-1");
    expect(result.error).toBeNull();
  });

  it("returns error on admin failure", async () => {
    const sb = mockSupabase();
    const admin = mockSupabase({
      authResult: { data: {}, error: { message: "delete failed" } },
    });

    const result = await deleteAccount(sb, admin, "user-1");
    expect(result.error).toBe("delete failed");
  });
});
