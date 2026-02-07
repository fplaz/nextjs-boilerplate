"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import * as authService from "@/domain/auth/auth.service";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const result = await authService.signUp(supabase, {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    firstName: formData.get("first_name") as string,
    lastName: formData.get("last_name") as string,
  });

  if (result.error !== null) {
    return redirect(`/signup?error=${encodeURIComponent(result.error)}`);
  }

  return redirect(`/login?message=${encodeURIComponent(result.data)}`);
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const result = await authService.signIn(supabase, {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (result.error) {
    return redirect(`/login?error=${encodeURIComponent(result.error)}`);
  }

  return redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await authService.signOut(supabase);
  return redirect("/login");
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();

  const result = await authService.forgotPassword(supabase, {
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
