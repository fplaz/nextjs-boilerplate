import type { SupabaseClient } from "@supabase/supabase-js";
import { ZodError } from "zod";
import {
  signUpInput,
  signInInput,
  forgotPasswordInput,
  resetPasswordInput,
  type SignUpInput,
  type SignInInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "./auth.schema";

type ServiceResult<T = null> =
  | { data: T; error: null }
  | { data: null; error: string };

export async function signUp(
  supabase: SupabaseClient,
  input: SignUpInput
): Promise<ServiceResult<string>> {
  try {
    const parsed = signUpInput.parse(input);

    const { data, error } = await supabase.auth.signUp({
      email: parsed.email,
      password: parsed.password,
      options: {
        data: { first_name: parsed.firstName, last_name: parsed.lastName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
      },
    });

    if (error) return { data: null, error: error.message };

    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: data.user.id,
          first_name: parsed.firstName,
          last_name: parsed.lastName,
        });

      if (profileError) return { data: null, error: profileError.message };
    }

    return {
      data: "Check your email to confirm your account.",
      error: null,
    };
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
  input: ForgotPasswordInput
): Promise<ServiceResult<string>> {
  try {
    const parsed = forgotPasswordInput.parse(input);

    const { error } = await supabase.auth.resetPasswordForEmail(parsed.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?type=recovery`,
    });

    if (error) return { data: null, error: error.message };

    return {
      data: "Check your email for a password reset link.",
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
      data: "Password updated. You can now sign in.",
      error: null,
    };
  } catch (err) {
    if (err instanceof ZodError) {
      return { data: null, error: err.issues[0].message };
    }
    throw err;
  }
}
