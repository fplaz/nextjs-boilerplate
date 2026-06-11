import type { SupabaseClient } from "@supabase/supabase-js";
import { ZodError } from "zod";
import {
  signUpInput,
  signInInput,
  forgotPasswordInput,
  resetPasswordInput,
  magicLinkInput,
  type SignUpInput,
  type SignInInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type MagicLinkInput,
} from "./auth.schema";
import { sendWelcomeEmail } from "@/domain/email/email.service";
import { sendTelegramMessage } from "@/lib/telegram";
import {
  acceptWorkspaceInvite,
  createWorkspace,
} from "@/domain/workspaces/workspace.service";

type ServiceResult<T = null> =
  | { data: T; error: null }
  | { data: null; error: string };

export async function signUp(
  supabase: SupabaseClient,
  adminClient: SupabaseClient,
  input: SignUpInput
): Promise<ServiceResult> {
  try {
    const parsed = signUpInput.parse(input);

    // Check workspace slug uniqueness before creating user when creating a new workspace
    if (!parsed.inviteToken) {
      const { data: existingSlug } = await adminClient
        .from("workspaces")
        .select("id")
        .eq("slug", parsed.accountSlug)
        .maybeSingle();

      if (existingSlug) {
        return {
          data: null,
          error: "This workspace slug is already in use",
        };
      }
    }

    // 1. Create user via signUp — returns a session so the user is logged in immediately
    const { data, error } = await supabase.auth.signUp({
      email: parsed.email,
      password: parsed.password,
      options: {
        data: {
          first_name: parsed.firstName,
          last_name: parsed.lastName,
        },
      },
    });

    if (error) return { data: null, error: error.message };
    if (!data.user) return { data: null, error: "Could not create account." };

    // 2. Create profile
    const { error: profileError } = await adminClient
      .from("profiles")
      .upsert({
        user_id: data.user.id,
        first_name: parsed.firstName,
        last_name: parsed.lastName,
      });

    if (profileError) {
      await adminClient.auth.admin.deleteUser(data.user.id);
      return {
        data: null,
        error: "Could not create account. Please try again.",
      };
    }

    if (parsed.inviteToken) {
      const inviteResult = await acceptWorkspaceInvite(adminClient, {
        token: parsed.inviteToken,
        userId: data.user.id,
        email: parsed.email,
      });

      if (inviteResult.error) {
        await adminClient.auth.admin.deleteUser(data.user.id);
        return { data: null, error: inviteResult.error };
      }
    } else {
      const workspaceResult = await createWorkspace(adminClient, {
        userId: data.user.id,
        slug: parsed.accountSlug,
      });

      if (workspaceResult.error) {
        await adminClient.auth.admin.deleteUser(data.user.id);
        return { data: null, error: workspaceResult.error };
      }
    }

    sendWelcomeEmail(parsed.email, parsed.firstName).catch(console.error);
    sendTelegramMessage("A new user has registered! 🚀🚀🚀").catch(console.error);

    return { data: null, error: null };
  } catch (err) {
    if (err instanceof ZodError) {
      return { data: null, error: err.issues[0].message };
    }
    throw err;
  }
}

export async function signIn(
  supabase: SupabaseClient,
  input: SignInInput
): Promise<ServiceResult> {
  try {
    const parsed = signInInput.parse(input);

    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.email,
      password: parsed.password,
    });

    if (error) return { data: null, error: error.message };

    return { data: null, error: null };
  } catch (err) {
    if (err instanceof ZodError) {
      return { data: null, error: err.issues[0].message };
    }
    throw err;
  }
}

export async function signOut(
  supabase: SupabaseClient
): Promise<ServiceResult> {
  const { error } = await supabase.auth.signOut();
  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

export async function forgotPassword(
  supabase: SupabaseClient,
  adminClient: SupabaseClient,
  input: ForgotPasswordInput
): Promise<ServiceResult<string>> {
  try {
    const parsed = forgotPasswordInput.parse(input);

    const exists = await emailExistsInAuth(adminClient, parsed.email);
    if (!exists) {
      return {
        data: "If an account exists with that email, we'll send a password reset link.",
        error: null,
      };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(parsed.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?type=recovery`,
    });

    if (error) return { data: null, error: error.message };

    return {
      data: "If an account exists with that email, we'll send a password reset link.",
      error: null,
    };
  } catch (err) {
    if (err instanceof ZodError) {
      return { data: null, error: err.issues[0].message };
    }
    throw err;
  }
}

export async function resetPassword(
  supabase: SupabaseClient,
  input: ResetPasswordInput
): Promise<ServiceResult<string>> {
  try {
    const parsed = resetPasswordInput.parse(input);

    const { error } = await supabase.auth.updateUser({
      password: parsed.password,
    });

    if (error) return { data: null, error: error.message };

    return {
      data: "Password updated",
      error: null,
    };
  } catch (err) {
    if (err instanceof ZodError) {
      return { data: null, error: err.issues[0].message };
    }
    throw err;
  }
}

export async function getUserRole(
  supabase: SupabaseClient,
  userId: string
): Promise<ServiceResult<string>> {
  const { data, error } = await supabase
    .from("profiles")
    .select("platform_role")
    .eq("user_id", userId)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data.platform_role, error: null };
}

export async function sendMagicLink(
  supabase: SupabaseClient,
  adminClient: SupabaseClient,
  input: MagicLinkInput
): Promise<ServiceResult<string>> {
  try {
    const parsed = magicLinkInput.parse(input);

    const exists = await emailExistsInAuth(adminClient, parsed.email);
    if (!exists) {
      return {
        data: "If an account exists with that email, we'll send a sign-in link.",
        error: null,
      };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm${
          parsed.redirectTo
            ? `?next=${encodeURIComponent(parsed.redirectTo)}`
            : ""
        }`,
      },
    });

    if (error) return { data: null, error: error.message };

    return {
      data: "If an account exists with that email, we'll send a sign-in link.",
      error: null,
    };
  } catch (err) {
    if (err instanceof ZodError) {
      return { data: null, error: err.issues[0].message };
    }
    throw err;
  }
}

async function emailExistsInAuth(adminClient: SupabaseClient, email: string): Promise<boolean> {
  const { data: { users } } = await adminClient.auth.admin.listUsers();
  return users.some((u) => u.email === email);
}
