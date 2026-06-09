import type { SupabaseClient } from "@supabase/supabase-js";

type ServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export type AdminProfile = {
  user_id: string;
  account_slug: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string;
};

export type AdminTrial = {
  user_id: string;
  status: string;
  plan: string;
  starts_at: string;
  ends_at: string;
  created_at: string;
};

export type AdminSubscription = {
  id: number;
  user_id: string;
  status: string;
  paddle_product_name: string | null;
  paddle_price_name: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
};

export async function getAllProfiles(
  adminClient: SupabaseClient
): Promise<ServiceResult<AdminProfile[]>> {
  const { data, error } = await adminClient
    .from("profiles")
    .select("user_id, account_slug, first_name, last_name, role, created_at")
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function getAllTrials(
  adminClient: SupabaseClient
): Promise<ServiceResult<AdminTrial[]>> {
  const { data, error } = await adminClient
    .from("trials")
    .select("user_id, status, plan, starts_at, ends_at, created_at")
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
      "id, user_id, status, paddle_product_name, paddle_price_name, current_period_start, current_period_end, created_at"
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
