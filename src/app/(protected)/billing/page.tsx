import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getUserSubscription,
  getUserBillingState,
} from "@/domain/subscriptions/subscriptions.service";
import { PaddleProvider } from "@/components/paddle-provider";
import { CurrentPlanCard } from "./current-plan-card";
import { BillingCard } from "./billing-card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  const [subResult, billingStateResult] = await Promise.all([
    getUserSubscription(supabase, user.id),
    getUserBillingState(supabase, user.id),
  ]);

  const subscription = subResult.data ?? null;
  const billingState = billingStateResult.data ?? {
    status: "none" as const,
    trialEnd: null,
    planName: null,
  };

  const priceIds = {
    basicMonthly: process.env.PADDLE_BASIC_PRICE_ID ?? "",
    basicYearly: process.env.PADDLE_BASIC_YEARLY_PRICE_ID ?? "",
    growthMonthly: process.env.PADDLE_GROWTH_PRICE_ID ?? "",
    growthYearly: process.env.PADDLE_GROWTH_YEARLY_PRICE_ID ?? "",
    proMonthly: process.env.PADDLE_PRO_PRICE_ID ?? "",
    proYearly: process.env.PADDLE_PRO_YEARLY_PRICE_ID ?? "",
  };

  return (
    <PaddleProvider>
      <div className="space-y-8">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to app
          </Link>
          <h1 className="mt-2 text-3xl font-bold">Plan & Billing Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your subscription and payment details
          </p>
        </div>

        <CurrentPlanCard
          subscription={subscription}
          billingState={billingState}
          userId={user.id}
          userEmail={user.email!}
          priceIds={priceIds}
        />

        <Separator />

        <BillingCard subscription={subscription} />
      </div>
    </PaddleProvider>
  );
}
