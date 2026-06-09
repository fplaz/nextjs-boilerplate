import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireCurrentWorkspace } from "@/lib/current-workspace";
import {
  getWorkspaceBillingState,
  getWorkspaceSubscription,
} from "@/domain/subscriptions/subscriptions.service";
import { PaddleProvider } from "@/components/paddle-provider";
import { Separator } from "@/components/ui/separator";
import { CurrentPlanCard } from "@/app/(protected)/billing/current-plan-card";
import { BillingCard } from "@/app/(protected)/billing/billing-card";
import { FormMessage } from "@/components/form-message";

export default async function WorkspaceBillingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const workspace = await requireCurrentWorkspace(supabase, user.id, slug);
  const [subResult, billingStateResult] = await Promise.all([
    getWorkspaceSubscription(supabase, workspace.current.workspace.id),
    getWorkspaceBillingState(supabase, workspace.current.workspace.id),
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
            href={`/w/${slug}/dashboard`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to workspace
          </Link>
          <h1 className="mt-2 text-3xl font-bold">Plan & Billing Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage the subscription and payment details for {workspace.current.workspace.name}
          </p>
        </div>

        <FormMessage />

        <CurrentPlanCard
          subscription={subscription}
          billingState={billingState}
          workspaceId={workspace.current.workspace.id}
          billingOwnerUserId={workspace.current.workspace.billing_owner_user_id ?? user.id}
          userEmail={user.email ?? ""}
          workspaceSlug={slug}
          canManageBilling={workspace.current.role === "owner"}
          priceIds={priceIds}
        />

        <Separator />

        <BillingCard
          subscription={subscription}
          canManageBilling={workspace.current.role === "owner"}
          workspaceSlug={slug}
        />
      </div>
    </PaddleProvider>
  );
}
