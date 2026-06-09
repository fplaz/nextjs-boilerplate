import { describe, it, expect, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

vi.mock("@/domain/workspaces/workspace.service", () => ({
  createWorkspace: vi.fn().mockResolvedValue({
    data: { id: "w1", slug: "johns-company" },
    error: null,
  }),
  acceptWorkspaceInvite: vi.fn().mockResolvedValue({
    data: { id: "w1", slug: "johns-company" },
    error: null,
  }),
}));

import {
  signUp,
  signIn,
  forgotPassword,
  resetPassword,
} from "../auth.service";

// ---------------------------------------------------------------------------
// Mock Supabase
// ---------------------------------------------------------------------------

function createChainMock(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.insert = vi.fn().mockResolvedValue(result);
  chain.upsert = vi.fn().mockResolvedValue(result);
  chain.select = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.limit = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(result);
  chain.maybeSingle = vi.fn().mockResolvedValue(result);
  return chain;
}

function mockSupabase(opts?: {
  authResult?: { data: unknown; error: unknown };
  profileResult?: { data: unknown; error: unknown };
  slugCheckResult?: { data: unknown; error: unknown };
}) {
  const sb = {
    from: vi.fn((table: string) => {
      if (table === "profiles" || table === "workspaces") {
        // Default: slug check returns null (available), profile upsert succeeds
        const chain: Record<string, unknown> = {};
        chain.select = vi.fn().mockReturnValue(chain);
        chain.eq = vi.fn().mockReturnValue(chain);
        chain.limit = vi.fn().mockReturnValue(chain);
        chain.maybeSingle = vi.fn().mockResolvedValue(
          opts?.slugCheckResult ?? { data: null, error: null }
        );
        chain.upsert = vi.fn().mockResolvedValue(
          opts?.profileResult ?? { data: null, error: null }
        );
        return chain;
      }
      return createChainMock({ data: null, error: null });
    }),
    auth: {
      signUp: vi
        .fn()
        .mockResolvedValue(
          opts?.authResult ?? { data: { user: { id: "u1" } }, error: null }
        ),
      signInWithPassword: vi
        .fn()
        .mockResolvedValue(
          opts?.authResult ?? { data: {}, error: null }
        ),
      resetPasswordForEmail: vi
        .fn()
        .mockResolvedValue(
          opts?.authResult ?? { data: {}, error: null }
        ),
      updateUser: vi
        .fn()
        .mockResolvedValue(
          opts?.authResult ?? { data: {}, error: null }
        ),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  } as unknown as SupabaseClient;
  return sb;
}

function mockAdminForEmailCheck(opts?: { users?: { email: string }[] }) {
  return {
    auth: {
      admin: {
        listUsers: vi.fn().mockResolvedValue({
          data: { users: opts?.users ?? [{ email: "test@example.com" }] },
        }),
      },
    },
  } as unknown as SupabaseClient;
}

const validSignUp = {
  email: "test@example.com",
  password: "Str0ng!Pass",
  firstName: "John",
  lastName: "Doe",
  accountSlug: "johns-company",
};

// ---------------------------------------------------------------------------
// signUp
// ---------------------------------------------------------------------------

describe("signUp", () => {
  function mockSignUpAdmin(opts?: {
    createUserResult?: { data: unknown; error: unknown };
    slugCheckResult?: { data: unknown; error: unknown };
    profileResult?: { data: unknown; error: unknown };
  }) {
    const deleteUser = vi.fn().mockResolvedValue({ error: null });

    const sb = {
      from: vi.fn((table: string) => {
        if (table === "profiles" || table === "workspaces") {
          const chain: Record<string, unknown> = {};
          chain.select = vi.fn().mockReturnValue(chain);
          chain.eq = vi.fn().mockReturnValue(chain);
          chain.limit = vi.fn().mockReturnValue(chain);
          chain.maybeSingle = vi.fn().mockResolvedValue(
            opts?.slugCheckResult ?? { data: null, error: null }
          );
          chain.upsert = vi.fn().mockResolvedValue(
            opts?.profileResult ?? { data: null, error: null }
          );
          return chain;
        }
        return createChainMock({ data: null, error: null });
      }),
      auth: {
        admin: {
          createUser: vi.fn().mockResolvedValue(
            opts?.createUserResult ?? {
              data: { user: { id: "u1" } },
              error: null,
            }
          ),
          deleteUser,
        },
      },
    } as unknown as SupabaseClient;
    return { sb, deleteUser };
  }

  function mockSignUpSupabase(opts?: {
    signUpResult?: { data: unknown; error: unknown };
  }) {
    return {
      auth: {
        signUp: vi
          .fn()
          .mockResolvedValue(
            opts?.signUpResult ?? {
              data: { user: { id: "u1" } },
              error: null,
            }
          ),
      },
    } as unknown as SupabaseClient;
  }

  it("returns success on valid signup", async () => {
    const sb = mockSignUpSupabase();
    const { sb: admin } = mockSignUpAdmin();

    const result = await signUp(sb, admin, validSignUp);
    expect(result.error).toBeNull();
    expect(result.data).toBeNull();
  });

  it("returns error when signUp auth fails", async () => {
    const sb = mockSignUpSupabase({
      signUpResult: { data: { user: null }, error: { message: "Email taken" } },
    });
    const { sb: admin } = mockSignUpAdmin();

    const result = await signUp(sb, admin, validSignUp);
    expect(result.error).toBe("Email taken");
  });

  it("returns Zod error for invalid input", async () => {
    const sb = mockSignUpSupabase();
    const { sb: admin } = mockSignUpAdmin();

    const result = await signUp(sb, admin, {
      ...validSignUp,
      email: "bad",
    });
    expect(result.error).toBeTruthy();
    expect(result.data).toBeNull();
  });

  it("returns error when no user returned", async () => {
    const sb = mockSignUpSupabase({
      signUpResult: { data: { user: null }, error: null },
    });
    const { sb: admin } = mockSignUpAdmin();

    const result = await signUp(sb, admin, validSignUp);
    expect(result.error).toBe("Could not create account.");
  });

  it("returns generic error on profile upsert failure", async () => {
    const sb = mockSignUpSupabase();
    const { sb: admin, deleteUser } = mockSignUpAdmin({
      profileResult: { data: null, error: { message: "profile error" } },
    });

    const result = await signUp(sb, admin, validSignUp);
    expect(result.error).toBe("Could not create account. Please try again.");
    expect(deleteUser).toHaveBeenCalledWith("u1");
  });

  it("returns error when account slug is already taken", async () => {
    const sb = mockSignUpSupabase();
    const { sb: admin } = mockSignUpAdmin({
      slugCheckResult: { data: { id: "workspace-1" }, error: null },
    });

    const result = await signUp(sb, admin, validSignUp);
    expect(result.error).toBe("This workspace slug is already in use");
    expect(result.data).toBeNull();
  });

  it("returns Zod error for invalid account slug format", async () => {
    const sb = mockSignUpSupabase();
    const { sb: admin } = mockSignUpAdmin();

    const result = await signUp(sb, admin, {
      ...validSignUp,
      accountSlug: "Invalid Slug!",
    });
    expect(result.error).toBeTruthy();
    expect(result.data).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// signIn
// ---------------------------------------------------------------------------

describe("signIn", () => {
  it("returns success on valid credentials", async () => {
    const sb = mockSupabase();

    const result = await signIn(sb, {
      email: "test@example.com",
      password: "password123",
    });
    expect(result.error).toBeNull();
  });

  it("returns error on invalid credentials", async () => {
    const sb = mockSupabase({
      authResult: { data: {}, error: { message: "Invalid credentials" } },
    });

    const result = await signIn(sb, {
      email: "test@example.com",
      password: "wrong",
    });
    expect(result.error).toBe("Invalid credentials");
  });

  it("returns Zod error for missing password", async () => {
    const sb = mockSupabase();

    const result = await signIn(sb, {
      email: "test@example.com",
      password: "",
    });
    expect(result.error).toBeTruthy();
    expect(result.data).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// forgotPassword
// ---------------------------------------------------------------------------

describe("forgotPassword", () => {
  it("returns success message on valid email", async () => {
    const sb = mockSupabase();
    const admin = mockAdminForEmailCheck({ users: [{ email: "test@example.com" }] });

    const result = await forgotPassword(sb, admin, { email: "test@example.com" });
    expect(result.error).toBeNull();
    expect(result.data).toContain("password reset link");
  });

  it("returns success without sending when email does not exist", async () => {
    const sb = mockSupabase();
    const admin = mockAdminForEmailCheck({ users: [] });

    const result = await forgotPassword(sb, admin, { email: "unknown@example.com" });
    expect(result.error).toBeNull();
    expect(result.data).toContain("password reset link");
    expect(sb.auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it("returns error on Supabase failure", async () => {
    const sb = mockSupabase({
      authResult: { data: {}, error: { message: "Rate limited" } },
    });
    const admin = mockAdminForEmailCheck({ users: [{ email: "test@example.com" }] });

    const result = await forgotPassword(sb, admin, { email: "test@example.com" });
    expect(result.error).toBe("Rate limited");
  });

  it("returns Zod error for invalid email", async () => {
    const sb = mockSupabase();
    const admin = mockAdminForEmailCheck();

    const result = await forgotPassword(sb, admin, { email: "bad" });
    expect(result.error).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// resetPassword
// ---------------------------------------------------------------------------

describe("resetPassword", () => {
  const valid = { password: "Str0ng!Pass", confirmPassword: "Str0ng!Pass" };

  it("returns success message on valid input", async () => {
    const sb = mockSupabase();

    const result = await resetPassword(sb, valid);
    expect(result.error).toBeNull();
    expect(result.data).toContain("Password updated");
  });

  it("returns error on Supabase failure", async () => {
    const sb = mockSupabase({
      authResult: { data: {}, error: { message: "Session expired" } },
    });

    const result = await resetPassword(sb, valid);
    expect(result.error).toBe("Session expired");
  });

  it("returns Zod error for weak password", async () => {
    const sb = mockSupabase();

    const result = await resetPassword(sb, {
      password: "weak",
      confirmPassword: "weak",
    });
    expect(result.error).toBeTruthy();
  });

  it("returns Zod error for mismatched passwords", async () => {
    const sb = mockSupabase();

    const result = await resetPassword(sb, {
      password: "Str0ng!Pass",
      confirmPassword: "Different!1",
    });
    expect(result.error).toContain("Passwords do not match");
  });
});
