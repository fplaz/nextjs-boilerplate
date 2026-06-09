import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { paddle } from "@/lib/paddle";
import { getUserSubscription } from "@/domain/subscriptions/subscriptions.service";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await getUserSubscription(supabase, user.id);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  const subscription = result.data;

  if (!subscription?.paddle_subscription_id) {
    return NextResponse.json(
      { error: "No subscription found" },
      { status: 404 }
    );
  }

  const cancelableStatuses = ["active", "past_due", "paused"];
  if (!cancelableStatuses.includes(subscription.status)) {
    return NextResponse.json(
      { error: "Subscription cannot be canceled in its current state" },
      { status: 400 }
    );
  }

  try {
    await paddle.subscriptions.cancel(subscription.paddle_subscription_id, {
      effectiveFrom: "next_billing_period",
    });

    return NextResponse.json({ data: { canceled: true } });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to cancel subscription";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
