import { z } from "zod";

export const subscriptionStatus = z.enum([
  "trialing",
  "active",
  "paused",
  "canceled",
  "past_due",
]);

export type SubscriptionStatus = z.infer<typeof subscriptionStatus>;

export const subscriptionRow = z.object({
  id: z.number().int(),
  user_id: z.string().uuid(),
  paddle_subscription_id: z.string(),
  paddle_customer_id: z.string().nullable(),
  status: subscriptionStatus,
  paddle_product_id: z.string().nullable(),
  paddle_product_name: z.string().nullable(),
  paddle_price_id: z.string().nullable(),
  paddle_price_name: z.string().nullable(),
  paddle_price_billing_interval: z.string().nullable(),
  current_period_start: z.string().nullable(),
  current_period_end: z.string().nullable(),
  scheduled_cancelation_date: z.string().nullable(),
  trial_end: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type SubscriptionRow = z.infer<typeof subscriptionRow>;

export const upsertSubscriptionInput = z.object({
  user_id: z.string().uuid(),
  paddle_subscription_id: z.string(),
  paddle_customer_id: z.string().nullable().optional(),
  status: subscriptionStatus,
  paddle_product_id: z.string().nullable().optional(),
  paddle_product_name: z.string().nullable().optional(),
  paddle_price_id: z.string().nullable().optional(),
  paddle_price_name: z.string().nullable().optional(),
  paddle_price_billing_interval: z.string().nullable().optional(),
  current_period_start: z.string().nullable().optional(),
  current_period_end: z.string().nullable().optional(),
  scheduled_cancelation_date: z.string().nullable().optional(),
  trial_end: z.string().nullable().optional(),
});

export type UpsertSubscriptionInput = z.infer<typeof upsertSubscriptionInput>;

export interface UserBillingState {
  status: SubscriptionStatus | "none";
  trialEnd: string | null;
  planName: string | null;
}
