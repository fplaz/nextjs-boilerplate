"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import * as userService from "@/domain/users/user.service";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  const result = await userService.updateProfile(supabase, user.id, {
    firstName: formData.get("first_name") as string,
    lastName: formData.get("last_name") as string,
  });

  if (result.error) {
    return redirect(`/account?error=${encodeURIComponent(result.error)}`);
  }

  return redirect(
    `/account?message=${encodeURIComponent("Profile updated.")}`
  );
}

export async function changeEmail(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  const result = await userService.changeEmail(supabase, {
    email: formData.get("email") as string,
  });

  if (result.error !== null) {
    return redirect(`/account?error=${encodeURIComponent(result.error)}`);
  }

  return redirect(`/account?message=${encodeURIComponent(result.data)}`);
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  const result = await userService.changePassword(supabase, {
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirm_password") as string,
  });

  if (result.error) {
    return redirect(`/account?error=${encodeURIComponent(result.error)}`);
  }

  return redirect(
    `/account?message=${encodeURIComponent("Password updated.")}`
  );
}

export async function deleteAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  const admin = createAdminClient();
  const result = await userService.deleteAccount(supabase, admin, user.id);

  if (result.error) {
    return redirect(`/account?error=${encodeURIComponent(result.error)}`);
  }

  return redirect("/login?message=Account deleted.");
}
