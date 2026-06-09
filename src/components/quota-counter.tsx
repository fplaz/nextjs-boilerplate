import type { WorkspaceBillingState } from "@/domain/subscriptions/subscriptions.schema";

export function QuotaCounter({ quota }: { quota: WorkspaceBillingState }) {
  if (quota.status === "none") {
    return (
      <p className="text-sm text-muted-foreground">
        Upgrade to activate billing
      </p>
    );
  }

  return <p className="text-sm text-muted-foreground capitalize">{quota.status}</p>;
}
