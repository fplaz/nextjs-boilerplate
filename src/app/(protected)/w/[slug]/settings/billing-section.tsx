import type {
  SubscriptionRow,
  WorkspaceBillingState,
} from "@/domain/subscriptions/subscriptions.schema";
import { PaddleProvider } from "@/components/paddle-provider";
import { Separator } from "@/components/ui/separator";
import { CurrentPlanCard } from "@/app/(protected)/billing/current-plan-card";
import { BillingCard } from "@/app/(protected)/billing/billing-card";

type PriceIds = {
  basicMonthly: string;
  basicYearly: string;
  growthMonthly: string;
  growthYearly: string;
  proMonthly: string;
  proYearly: string;
};

export function BillingSection({
  subscription,
  billingState,
  workspaceId,
  billingOwnerUserId,
  userEmail,
  slug,
  canManageBilling,
  priceIds,
}: {
  subscription: SubscriptionRow | null;
  billingState: WorkspaceBillingState;
  workspaceId: string;
  billingOwnerUserId: string;
  userEmail: string;
  slug: string;
  canManageBilling: boolean;
  priceIds: PriceIds;
}) {
  return (
    <PaddleProvider>
      <div className="space-y-8">
        <CurrentPlanCard
          subscription={subscription}
          billingState={billingState}
          workspaceId={workspaceId}
          billingOwnerUserId={billingOwnerUserId}
          userEmail={userEmail}
          workspaceSlug={slug}
          canManageBilling={canManageBilling}
          priceIds={priceIds}
        />

        <Separator />

        <BillingCard
          subscription={subscription}
          canManageBilling={canManageBilling}
          workspaceSlug={slug}
        />
      </div>
    </PaddleProvider>
  );
}
