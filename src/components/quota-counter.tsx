import type { UserBillingState } from "@/domain/subscriptions/subscriptions.schema";

export function QuotaCounter({ quota }: { quota: UserBillingState }) {
  if (quota.status === "none") {
    return (
      <p className="text-sm text-muted-foreground">
        Upgrade to activate billing
      </p>
    );
  }

  return <p className="text-sm text-muted-foreground capitalize">{quota.status}</p>;
}
