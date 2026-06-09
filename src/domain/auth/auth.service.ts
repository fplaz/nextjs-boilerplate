import type { SupabaseClient, User } from "@supabase/supabase-js";
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
import { createTrial } from "@/domain/trials/trials.service";
import { sendWelcomeEmail } from "@/domain/email/email.service";
import { sendTelegramMessage } from "@/lib/telegram";

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

    // Check account slug uniqueness before creating user
    const { data: existingSlug } = await adminClient
      .from("profiles")
      .select("user_id")
      .eq("account_slug", parsed.accountSlug)
      .maybeSingle();

    if (existingSlug) {
      return {
        data: null,
        error: "This account slug is already in use",
      };
    }

    // 1. Create user via signUp — returns a session so the user is logged in immediately
    const { data, error } = await supabase.auth.signUp({
      email: parsed.email,
      password: parsed.password,
      options: {
        data: {
          first_name: parsed.firstName,
          last_name: parsed.lastName,
          has_password: true,
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
        account_slug: parsed.accountSlug,
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

    // Fire-and-forget: create local trial asynchronously
    createTrial(adminClient, { user_id: data.user.id }).catch(console.error);
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
      data: { has_password: true },
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
    .select("role")
    .eq("user_id", userId)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data.role, error: null };
}

export function userHasPassword(user: User): boolean {
  return user.user_metadata?.has_password === true;
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
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
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
