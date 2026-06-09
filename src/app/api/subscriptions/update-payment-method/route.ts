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

  try {
    const transaction =
      await paddle.subscriptions.getPaymentMethodChangeTransaction(
        subscription.paddle_subscription_id
      );

    return NextResponse.json({ data: { transactionId: transaction.id } });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to get payment update transaction";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
