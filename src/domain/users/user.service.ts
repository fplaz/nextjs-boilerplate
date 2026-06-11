import type { SupabaseClient } from "@supabase/supabase-js";
import { ZodError } from "zod";
import {
  updateProfileInput,
  changeEmailInput,
  changePasswordInput,
  type UpdateProfileInput,
  type ChangeEmailInput,
  type ChangePasswordInput,
} from "./user.schema";

type ServiceResult<T = null> =
  | { data: T; error: null }
  | { data: null; error: string };

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  input: UpdateProfileInput
): Promise<ServiceResult> {
  try {
    const parsed = updateProfileInput.parse(input);

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: parsed.firstName,
        last_name: parsed.lastName,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) return { data: null, error: error.message };

    return { data: null, error: null };
  } catch (err) {
    if (err instanceof ZodError) {
      return { data: null, error: err.issues[0].message };
    }
    throw err;
  }
}

export async function changeEmail(
  supabase: SupabaseClient,
  input: ChangeEmailInput
): Promise<ServiceResult<string>> {
  try {
    const parsed = changeEmailInput.parse(input);

    const { error } = await supabase.auth.updateUser(
      { email: parsed.email },
      { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm` }
    );

    if (error) return { data: null, error: "Unable to use that email address. Please try a different one." };

    return {
      data: "Check your new email for a confirmation link",
      error: null,
    };
  } catch (err) {
    if (err instanceof ZodError) {
      return { data: null, error: err.issues[0].message };
    }
    throw err;
  }
}

export async function changePassword(
  supabase: SupabaseClient,
  email: string,
  input: ChangePasswordInput
): Promise<ServiceResult> {
  try {
    const parsed = changePasswordInput.parse(input);

    // Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: parsed.currentPassword,
    });

    if (signInError) return { data: null, error: "Current password is incorrect." };

    const { error } = await supabase.auth.updateUser({
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

export async function deleteAccount(
  supabase: SupabaseClient,
  adminClient: SupabaseClient,
  userId: string
): Promise<ServiceResult> {
  const { data: ownedWorkspace, error: ownedWorkspaceError } = await adminClient
    .from("workspaces")
    .select("id")
    .eq("owner_user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (ownedWorkspaceError) {
    return { data: null, error: ownedWorkspaceError.message };
  }

  if (ownedWorkspace) {
    return {
      data: null,
      error:
        "Transfer ownership or delete your workspace before deleting your account.",
    };
  }

  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) return { data: null, error: error.message };

  await supabase.auth.signOut();
  return { data: null, error: null };
}
