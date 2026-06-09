"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import * as authService from "@/domain/auth/auth.service";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function signUp(formData: FormData) {
  const turnstileToken = formData.get("turnstile_token") as string;
  const turnstileValid = await verifyTurnstileToken(turnstileToken ?? "");
  if (!turnstileValid) {
    return redirect(`/signup?error=${encodeURIComponent("Bot verification failed. Please try again.")}`);
  }

  const supabase = await createClient();

  const adminClient = createAdminClient();
  const result = await authService.signUp(supabase, adminClient, {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    firstName: formData.get("first_name") as string,
    lastName: formData.get("last_name") as string,
    accountSlug: formData.get("account_slug") as string,
    inviteToken: ((formData.get("invite_token") as string) || undefined),
  });

  if (result.error !== null) {
    return redirect(`/signup?error=${encodeURIComponent(result.error)}`);
  }

  const inviteToken = (formData.get("invite_token") as string) || "";
  const redirectTo = inviteToken
    ? "/dashboard"
    : (formData.get("redirect_to") as string) || "/dashboard";
  return redirect(redirectTo);
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  const result = await authService.signIn(supabase, {
    email,
    password: formData.get("password") as string,
  });

  if (result.error) {
    return redirect(`/login?error=${encodeURIComponent(result.error)}`);
  }

  const redirectTo = (formData.get("redirect_to") as string) || "/dashboard";
  return redirect(redirectTo);
}

export async function signOut() {
  const supabase = await createClient();
  await authService.signOut(supabase);
  return redirect("/");
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const result = await authService.forgotPassword(supabase, adminClient, {
    email: formData.get("email") as string,
  });

  if (result.error !== null) {
    return redirect(
      `/forgot-password?error=${encodeURIComponent(result.error)}`
    );
  }

  return redirect(
    `/forgot-password?message=${encodeURIComponent(result.data)}`
  );
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();

  const result = await authService.resetPassword(supabase, {
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirm_password") as string,
  });

  if (result.error !== null) {
    return redirect(
      `/reset-password?error=${encodeURIComponent(result.error)}`
    );
  }

  return redirect(`/login?message=${encodeURIComponent(result.data)}`);
}
