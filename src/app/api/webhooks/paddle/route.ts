import { NextResponse, type NextRequest } from "next/server";
import {
  EventName,
  type SubscriptionCreatedEvent,
  type SubscriptionUpdatedEvent,
  type SubscriptionActivatedEvent,
  type SubscriptionCanceledEvent,
  type SubscriptionPastDueEvent,
} from "@paddle/paddle-node-sdk";
import { paddle } from "@/lib/paddle";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  upsertSubscription,
} from "@/domain/subscriptions/subscriptions.service";
import type { SubscriptionStatus } from "@/domain/subscriptions/subscriptions.schema";
import { convertTrial } from "@/domain/trials/trials.service";

type SubscriptionEvent =
  | SubscriptionCreatedEvent
  | SubscriptionUpdatedEvent
  | SubscriptionActivatedEvent
  | SubscriptionCanceledEvent
  | SubscriptionPastDueEvent;

function extractUserId(customData: Record<string, unknown> | null | undefined): string | null {
  if (!customData) return null;
  const val = customData.user_id;
  return typeof val === "string" ? val : null;
}

function mapStatus(paddleStatus: string): SubscriptionStatus {
  const map: Record<string, SubscriptionStatus> = {
    trialing: "trialing",
    active: "active",
    paused: "paused",
    canceled: "canceled",
    past_due: "past_due",
  };
  return map[paddleStatus] ?? "active";
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("paddle-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = await paddle.webhooks.unmarshal(
      body,
      process.env.PADDLE_WEBHOOK_SECRET!,
      signature
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (!event) {
    return NextResponse.json({ ok: true });
  }

  const adminClient = createAdminClient();

  try {
    switch (event.eventType) {
      case EventName.SubscriptionCreated:
      case EventName.SubscriptionUpdated:
      case EventName.SubscriptionActivated: {
        const sub = (event as SubscriptionEvent).data;
        const userId = extractUserId(sub.customData as Record<string, unknown> | null);
        if (!userId) {
          console.warn("Webhook: missing user_id in customData", { eventType: event.eventType, subscriptionId: sub.id });
          return NextResponse.json({ error: "Missing user_id in subscription customData" }, { status: 200 });
        }

        const firstItem = sub.items?.[0];
        const status = mapStatus(sub.status ?? "active");

        await upsertSubscription(adminClient, {
          user_id: userId,
          paddle_subscription_id: sub.id,
          paddle_customer_id: sub.customerId ?? null,
          status,
          paddle_product_id: firstItem?.product?.id ?? null,
          paddle_product_name: firstItem?.product?.name ?? null,
          paddle_price_id: firstItem?.price?.id ?? null,
          paddle_price_name: firstItem?.price?.name ?? null,
          paddle_price_billing_interval:
            firstItem?.price?.billingCycle?.interval ?? null,
          current_period_start: sub.currentBillingPeriod?.startsAt ?? null,
          current_period_end: sub.currentBillingPeriod?.endsAt ?? null,
          trial_end: sub.nextBilledAt ?? null,
          scheduled_cancelation_date:
            sub.scheduledChange?.action === "cancel"
              ? sub.scheduledChange.effectiveAt
              : null,
        });

        // Convert local trial when a real subscription is created
        if (event.eventType === EventName.SubscriptionCreated) {
          await convertTrial(adminClient, userId);
        }

        break;
      }

      case EventName.SubscriptionCanceled: {
        const sub = (event as SubscriptionCanceledEvent).data;
        const userId = extractUserId(sub.customData as Record<string, unknown> | null);
        if (!userId) {
          console.warn("Webhook: missing user_id in customData", { eventType: event.eventType, subscriptionId: sub.id });
          return NextResponse.json({ error: "Missing user_id in subscription customData" }, { status: 200 });
        }

        await upsertSubscription(adminClient, {
          user_id: userId,
          paddle_subscription_id: sub.id,
          paddle_customer_id: sub.customerId ?? null,
          status: "canceled",
          current_period_start: sub.currentBillingPeriod?.startsAt ?? null,
          current_period_end: sub.currentBillingPeriod?.endsAt ?? null,
        });
        break;
      }

      case EventName.SubscriptionPastDue: {
        const sub = (event as SubscriptionPastDueEvent).data;
        const userId = extractUserId(sub.customData as Record<string, unknown> | null);
        if (!userId) {
          console.warn("Webhook: missing user_id in customData", { eventType: event.eventType, subscriptionId: sub.id });
          return NextResponse.json({ error: "Missing user_id in subscription customData" }, { status: 200 });
        }

        await upsertSubscription(adminClient, {
          user_id: userId,
          paddle_subscription_id: sub.id,
          paddle_customer_id: sub.customerId ?? null,
          status: "past_due",
          current_period_start: sub.currentBillingPeriod?.startsAt ?? null,
          current_period_end: sub.currentBillingPeriod?.endsAt ?? null,
        });
        break;
      }
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
  }

  // Always return 200 to prevent Paddle retries
  return NextResponse.json({ ok: true });
}
