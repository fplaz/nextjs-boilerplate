"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X } from "lucide-react";
import { usePaddle } from "@/components/paddle-provider";
import {
  plans,
  PlanCard,
  BillingIntervalTabs,
  type BillingInterval,
} from "@/components/pricing-plans";
import type {
  SubscriptionRow,
  WorkspaceBillingState,
} from "@/domain/subscriptions/subscriptions.schema";

interface PriceIds {
  basicMonthly: string;
  basicYearly: string;
  growthMonthly: string;
  growthYearly: string;
  proMonthly: string;
  proYearly: string;
}

function getPriceId(
  priceIds: PriceIds,
  priceKey: string,
  interval: BillingInterval
): string {
  const map: Record<string, Record<BillingInterval, string>> = {
    basic: { monthly: priceIds.basicMonthly, yearly: priceIds.basicYearly },
    growth: { monthly: priceIds.growthMonthly, yearly: priceIds.growthYearly },
    pro: { monthly: priceIds.proMonthly, yearly: priceIds.proYearly },
  };
  return map[priceKey]?.[interval] ?? "";
}

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  trialing: "secondary",
  active: "default",
  paused: "outline",
  canceled: "destructive",
  past_due: "destructive",
};

function formatBillingInterval(interval: string | null): string {
  if (!interval) return "—";
  if (interval === "month") return "Monthly";
  if (interval === "year") return "Yearly";
  return interval;
}

export function CurrentPlanCard({
  subscription,
  billingState,
  workspaceId,
  billingOwnerUserId,
  userEmail,
  workspaceSlug,
  canManageBilling,
  priceIds,
}: {
  subscription: SubscriptionRow | null;
  billingState: WorkspaceBillingState;
  workspaceId: string;
  billingOwnerUserId: string;
  userEmail: string;
  workspaceSlug: string;
  canManageBilling: boolean;
  priceIds: PriceIds;
}) {
  const router = useRouter();
  const { openCheckout, checkoutCompleted } = usePaddle();

  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [interval, setInterval] = useState<BillingInterval>("monthly");

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelConfirmText, setCancelConfirmText] = useState("");
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSpinner, setCancelSpinner] = useState(false);

  const [reactivateOpen, setReactivateOpen] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [reactivateError, setReactivateError] = useState<string | null>(null);
  const [reactivateSpinner, setReactivateSpinner] = useState(false);

  const showSubscribe =
    billingState.status === "trialing" ||
    billingState.status === "canceled" ||
    billingState.status === "none";

  const hasPendingCancellation = !!subscription?.scheduled_cancelation_date;

  const showCancel =
    subscription !== null &&
    ["active", "past_due", "paused"].includes(subscription.status) &&
    !hasPendingCancellation;

  const hasActiveSubscription =
    subscription !== null &&
    ["active", "past_due"].includes(subscription.status);

  function handleSelectPlan(priceId: string) {
    setSubscribeOpen(false);
    openCheckout(priceId, workspaceId, billingOwnerUserId, userEmail);
  }

  async function handleCancel() {
    setIsCanceling(true);
    setCancelError(null);

    try {
      const res = await fetch(`/api/subscriptions/cancel?slug=${encodeURIComponent(workspaceSlug)}`, { method: "POST" });
      const body = await res.json();

      if (!res.ok) {
        setCancelError(body.error ?? "Failed to cancel subscription");
        return;
      }

      setCancelOpen(false);
      setCancelSpinner(true);
      setTimeout(() => {
        setCancelSpinner(false);
        router.refresh();
      }, 3000);
    } catch {
      setCancelError("Something went wrong. Please try again.");
    } finally {
      setIsCanceling(false);
    }
  }

  async function handleReactivate() {
    setIsReactivating(true);
    setReactivateError(null);

    try {
      const res = await fetch("/api/subscriptions/reactivate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug: workspaceSlug }),
      });
      const body = await res.json();

      if (!res.ok) {
        setReactivateError(body.error ?? "Failed to reactivate subscription");
        return;
      }

      setReactivateOpen(false);
      setReactivateSpinner(true);
      setTimeout(() => {
        setReactivateSpinner(false);
        router.refresh();
      }, 3000);
    } catch {
      setReactivateError("Something went wrong. Please try again.");
    } finally {
      setIsReactivating(false);
    }
  }

  // No subscription yet, or fully canceled subscription
  if (!subscription || (subscription.status === "canceled" && !subscription.scheduled_cancelation_date)) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              {subscription ? "Your subscription has been canceled" : "You don't have an active subscription"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Subscribe to a plan to continue using your workspace.
            </p>
            {showSubscribe && (
              <Button
                className="mt-4 w-full cursor-pointer"
                disabled={!canManageBilling}
                onClick={() => setSubscribeOpen(true)}
              >
                Subscribe
              </Button>
            )}
          </CardContent>
        </Card>
        <SubscribeDialog
          open={subscribeOpen}
          onOpenChange={setSubscribeOpen}
          interval={interval}
          setInterval={setInterval}
          priceIds={priceIds}
          onSelectPlan={handleSelectPlan}
          hasActiveSubscription={hasActiveSubscription}
          canManageBilling={canManageBilling}
        />
        {checkoutCompleted && <ActionSpinner message="Applying your subscription..." />}
      </>
    );
  }

  // Has subscription
  const isTrialing = subscription.status === "trialing";

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Plan</CardTitle>
            <Badge variant={statusVariant[hasPendingCancellation ? "canceled" : subscription.status === "past_due" ? "active" : subscription.status] ?? "outline"}>
              {hasPendingCancellation ? "canceled" : subscription.status === "past_due" ? "active" : subscription.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Plan</dt>
              <dd className="font-medium">
                {subscription.paddle_price_name ?? billingState.planName ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Billing frequency</dt>
              <dd className="font-medium">
                {formatBillingInterval(
                  subscription.paddle_price_billing_interval
                )}
              </dd>
            </div>
            {isTrialing && subscription.trial_end && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Trial ends</dt>
                <dd className="font-medium">
                  {new Date(subscription.trial_end).toLocaleDateString()}
                </dd>
              </div>
            )}
            {!isTrialing &&
              !hasPendingCancellation &&
              subscription.current_period_end && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Next billing date</dt>
                  <dd className="font-medium">
                    {new Date(
                      subscription.current_period_end
                    ).toLocaleDateString()}
                  </dd>
                </div>
              )}
          </dl>

          {hasPendingCancellation && (
            <p className="mt-2 text-sm text-destructive">
              You will retain access to your plan until{" "}
              {new Date(
                subscription.scheduled_cancelation_date!
              ).toLocaleDateString()}
              .
            </p>
          )}

          {subscription.status === "past_due" && (
            <p className="mt-2 text-sm text-destructive">
              Your subscription payment didn&apos;t go through. We&apos;ll try again
              soon. Please update your payment method if needed.
            </p>
          )}

          <div className="mt-4 flex gap-2">
            {showSubscribe && (
              <Button
                className="cursor-pointer w-full"
                disabled={!canManageBilling}
                onClick={() => setSubscribeOpen(true)}
              >
                Subscribe
              </Button>
            )}
            {showCancel && (
              <Button
                variant="outline"
                className="cursor-pointer w-full"
                disabled={!canManageBilling}
                onClick={() => {
                  setCancelConfirmText("");
                  setCancelError(null);
                  setCancelOpen(true);
                }}
              >
                Cancel subscription
              </Button>
            )}
            {hasPendingCancellation && (
              <Button
                className="cursor-pointer w-full"
                disabled={!canManageBilling}
                onClick={() => {
                  setReactivateError(null);
                  setReactivateOpen(true);
                }}
              >
                Re-activate my subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <SubscribeDialog
        open={subscribeOpen}
        onOpenChange={setSubscribeOpen}
        interval={interval}
        setInterval={setInterval}
        priceIds={priceIds}
        onSelectPlan={handleSelectPlan}
        hasActiveSubscription={hasActiveSubscription}
        canManageBilling={canManageBilling}
      />

      {checkoutCompleted && <ActionSpinner message="Applying your subscription..." />}

      {cancelSpinner && (
        <ActionSpinner message="Canceling your subscription..." />
      )}
      {reactivateSpinner && (
        <ActionSpinner message="Reactivating your subscription..." />
      )}

      {/* Cancel confirmation dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              {subscription.current_period_end
                ? `You will retain access to your plan until ${new Date(subscription.current_period_end).toLocaleDateString()}.`
                : "Your subscription will be canceled at the end of the current billing period."}
            </DialogDescription>
          </DialogHeader>

          {!subscription.paddle_subscription_id ? (
            <p className="text-sm text-destructive">
              Unable to cancel your subscription. Please contact support.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <label
                  htmlFor="cancel-confirm"
                  className="text-sm font-medium"
                >
                  Type{" "}
                  <span className="font-mono font-bold">cancel</span> to
                  confirm
                </label>
                <Input
                  id="cancel-confirm"
                  value={cancelConfirmText}
                  onChange={(e) => setCancelConfirmText(e.target.value)}
                  placeholder="cancel"
                  autoComplete="off"
                />
              </div>

              {cancelError && (
                <p className="text-sm text-destructive">{cancelError}</p>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCancelOpen(false)}
                  disabled={isCanceling}
                >
                  Keep my plan
                </Button>
                <Button
                  variant="destructive"
                  disabled={
                    cancelConfirmText.toLowerCase() !== "cancel" || isCanceling
                  }
                  onClick={handleCancel}
                >
                  {isCanceling ? "Canceling..." : "Confirm cancellation"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reactivate confirmation dialog */}
      <Dialog open={reactivateOpen} onOpenChange={setReactivateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Re-activate Subscription</DialogTitle>
            <DialogDescription>
              Your subscription will continue as normal and you will be billed on
              the next billing date.
            </DialogDescription>
          </DialogHeader>

          {reactivateError && (
            <p className="text-sm text-destructive">{reactivateError}</p>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReactivateOpen(false)}
              disabled={isReactivating}
            >
              Cancel
            </Button>
            <Button
              disabled={isReactivating}
              onClick={handleReactivate}
            >
              {isReactivating ? "Reactivating..." : "Yes, re-activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ActionSpinner({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex flex-col items-center gap-4 rounded-lg bg-background p-8 shadow-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

function SubscribeDialog({
  open,
  onOpenChange,
  interval,
  setInterval,
  priceIds,
  onSelectPlan,
  hasActiveSubscription,
  canManageBilling,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interval: BillingInterval;
  setInterval: (interval: BillingInterval) => void;
  priceIds: PriceIds;
  onSelectPlan: (priceId: string) => void;
  hasActiveSubscription: boolean;
  canManageBilling: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex flex-col gap-0 p-0 max-w-[100vw] max-h-[100vh] h-[100vh] rounded-none border-none sm:rounded-lg sm:border sm:max-w-5xl sm:max-h-[80vh] sm:h-auto"
      >
        <div className="sticky top-0 z-10 flex justify-end p-4 pb-0">
          <DialogClose className="rounded-xs opacity-70 transition-opacity hover:opacity-100">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
          <DialogHeader>
            <DialogTitle>Choose a Plan</DialogTitle>
            <DialogDescription>
              Select the plan that best fits your needs
            </DialogDescription>
          </DialogHeader>

          {hasActiveSubscription && (
            <p className="text-sm text-muted-foreground">
              You already have an active subscription. Please cancel it before
              subscribing to a new plan.
            </p>
          )}
          {!canManageBilling && (
            <p className="text-sm text-muted-foreground">
              Only the workspace owner can change billing.
            </p>
          )}

          <div className="flex justify-center">
            <BillingIntervalTabs
              interval={interval}
              onIntervalChange={setInterval}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.name}
                plan={plan}
                interval={interval}
                action={
                  <Button
                    className="w-full cursor-pointer"
                    variant={plan.highlighted ? "default" : "outline"}
                    disabled={hasActiveSubscription || !canManageBilling}
                    onClick={() =>
                      onSelectPlan(
                        getPriceId(priceIds, plan.priceKey, interval)
                      )
                    }
                  >
                    Subscribe
                  </Button>
                }
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
