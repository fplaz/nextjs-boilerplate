import type { SupabaseClient } from "@supabase/supabase-js";
import { ZodError } from "zod";
import {
  upsertSubscriptionInput,
  type SubscriptionRow,
  type UpsertSubscriptionInput,
  type WorkspaceBillingState,
} from "./subscriptions.schema";
import { getWorkspaceTrial } from "@/domain/trials/trials.service";

type ServiceResult<T = null> =
  | { data: T; error: null }
  | { data: null; error: string };

export async function getWorkspaceSubscription(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<ServiceResult<SubscriptionRow | null>> {
  const { data: activeSub, error: activeError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("workspace_id", workspaceId)
    .in("status", ["active", "trialing"])
    .limit(1)
    .maybeSingle();

  if (activeError) return { data: null, error: activeError.message };
  if (activeSub) return { data: activeSub as SubscriptionRow, error: null };

  const { data: fallbackSub, error: fallbackError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("workspace_id", workspaceId)
    .in("status", ["canceled", "past_due"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fallbackError) return { data: null, error: fallbackError.message };
  return { data: fallbackSub as SubscriptionRow | null, error: null };
}

export async function upsertSubscription(
  adminClient: SupabaseClient,
  input: UpsertSubscriptionInput
): Promise<ServiceResult<SubscriptionRow>> {
  try {
    const parsed = upsertSubscriptionInput.parse(input);

    const { data, error } = await adminClient
      .from("subscriptions")
      .upsert(
        {
          ...parsed,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "paddle_subscription_id" }
      )
      .select("*")
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as SubscriptionRow, error: null };
  } catch (err) {
    if (err instanceof ZodError) {
      return { data: null, error: err.issues[0].message };
    }
    throw err;
  }
}

export async function getWorkspaceBillingState(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<ServiceResult<WorkspaceBillingState>> {
  const subResult = await getWorkspaceSubscription(supabase, workspaceId);
  if (subResult.error !== null) return { data: null, error: subResult.error };

  const subscription = subResult.data;

  if (subscription && (subscription.status === "active" || subscription.status === "trialing")) {
    return {
      data: {
        status: subscription.status,
        trialEnd: subscription.trial_end,
        planName: subscription.paddle_price_name,
      },
      error: null,
    };
  }

  const trialResult = await getWorkspaceTrial(supabase, workspaceId);
  if (trialResult.error === null && trialResult.data?.status === "active") {
    return {
      data: {
        status: "trialing",
        trialEnd: trialResult.data.ends_at,
        planName: trialResult.data.plan,
      },
      error: null,
    };
  }

  if (subscription) {
    return {
      data: {
        status: subscription.status,
        trialEnd: subscription.trial_end,
        planName: subscription.paddle_price_name,
      },
      error: null,
    };
  }

  return {
    data: { status: "none", trialEnd: null, planName: null },
    error: null,
  };
}
