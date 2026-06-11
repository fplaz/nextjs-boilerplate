import type { SupabaseClient } from "@supabase/supabase-js";

type ServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export type AdminProfile = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  platform_role: string;
  default_workspace_id: string | null;
  created_at: string;
};

export type AdminSubscription = {
  id: number;
  workspace_id: string;
  billing_owner_user_id: string | null;
  status: string;
  paddle_product_name: string | null;
  paddle_price_name: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
};

export type AdminWorkspace = {
  id: string;
  slug: string;
  name: string;
  owner_user_id: string;
  billing_owner_user_id: string | null;
  status: string;
  created_at: string;
};

export async function getAllProfiles(
  adminClient: SupabaseClient
): Promise<ServiceResult<AdminProfile[]>> {
  const { data, error } = await adminClient
    .from("profiles")
    .select(
      "user_id, first_name, last_name, platform_role, default_workspace_id, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function getAllSubscriptions(
  adminClient: SupabaseClient
): Promise<ServiceResult<AdminSubscription[]>> {
  const { data, error } = await adminClient
    .from("subscriptions")
    .select(
      "id, workspace_id, billing_owner_user_id, status, paddle_product_name, paddle_price_name, current_period_start, current_period_end, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function getAllUsers(
  adminClient: SupabaseClient
): Promise<ServiceResult<{ id: string; email: string }[]>> {
  const { data, error } = await adminClient.auth.admin.listUsers({
    perPage: 1000,
  });

  if (error) return { data: null, error: error.message };

  const users = data.users.map((u) => ({
    id: u.id,
    email: u.email ?? "",
  }));

  return { data: users, error: null };
}

export async function getAllWorkspaces(
  adminClient: SupabaseClient
): Promise<ServiceResult<AdminWorkspace[]>> {
  const { data, error } = await adminClient
    .from("workspaces")
    .select(
      "id, slug, name, owner_user_id, billing_owner_user_id, status, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}
