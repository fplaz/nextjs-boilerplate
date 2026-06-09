import type { SupabaseClient } from "@supabase/supabase-js";
import { ZodError } from "zod";
import { createTrialInput, type TrialRow, type CreateTrialInput } from "./trials.schema";

type ServiceResult<T = null> =
  | { data: T; error: null }
  | { data: null; error: string };

export async function createTrial(
  adminClient: SupabaseClient,
  input: CreateTrialInput
): Promise<ServiceResult<TrialRow>> {
  try {
    const parsed = createTrialInput.parse(input);

    const { data, error } = await adminClient
      .from("trials")
      .insert({ user_id: parsed.user_id })
      .select("*")
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as TrialRow, error: null };
  } catch (err) {
    if (err instanceof ZodError) {
      return { data: null, error: err.issues[0].message };
    }
    throw err;
  }
}

export async function getUserTrial(
  supabase: SupabaseClient,
  userId: string
): Promise<ServiceResult<TrialRow | null>> {
  const { data, error } = await supabase
    .from("trials")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  return { data: data as TrialRow | null, error: null };
}

export async function expireTrial(
  adminClient: SupabaseClient,
  userId: string
): Promise<ServiceResult> {
  const { error } = await adminClient
    .from("trials")
    .update({ status: "expired", updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

export async function convertTrial(
  adminClient: SupabaseClient,
  userId: string
): Promise<ServiceResult> {
  const { error } = await adminClient
    .from("trials")
    .update({ status: "converted", updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

export async function getTrialsNeedingTwoDayWarning(
  adminClient: SupabaseClient
): Promise<ServiceResult<TrialRow[]>> {
  const now = new Date();
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  const { data, error } = await adminClient
    .from("trials")
    .select("*")
    .eq("status", "active")
    .eq("two_day_warning_sent", false)
    .gt("ends_at", now.toISOString())
    .lte("ends_at", twoDaysFromNow.toISOString());

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as TrialRow[], error: null };
}

export async function getTrialsNeedingOneDayWarning(
  adminClient: SupabaseClient
): Promise<ServiceResult<TrialRow[]>> {
  const now = new Date();
  const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

  const { data, error } = await adminClient
    .from("trials")
    .select("*")
    .eq("status", "active")
    .eq("one_day_warning_sent", false)
    .gt("ends_at", now.toISOString())
    .lte("ends_at", oneDayFromNow.toISOString());

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as TrialRow[], error: null };
}

export async function markTwoDayWarningSent(
  adminClient: SupabaseClient,
  userId: string
): Promise<ServiceResult> {
  const { error } = await adminClient
    .from("trials")
    .update({ two_day_warning_sent: true, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

export async function markOneDayWarningSent(
  adminClient: SupabaseClient,
  userId: string
): Promise<ServiceResult> {
  const { error } = await adminClient
    .from("trials")
    .update({ one_day_warning_sent: true, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

export async function getExpiredTrials(
  adminClient: SupabaseClient
): Promise<ServiceResult<TrialRow[]>> {
  const { data, error } = await adminClient
    .from("trials")
    .select("*")
    .eq("status", "active")
    .lt("ends_at", new Date().toISOString());

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as TrialRow[], error: null };
}
