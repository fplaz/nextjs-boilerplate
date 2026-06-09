"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePaddle } from "@/components/paddle-provider";
import type { SubscriptionRow } from "@/domain/subscriptions/subscriptions.schema";
import { Loader2 } from "lucide-react";

export function BillingCard({
  subscription,
  canManageBilling,
  workspaceSlug,
}: {
  subscription: SubscriptionRow | null;
  canManageBilling: boolean;
  workspaceSlug: string;
}) {
  const { openUpdatePayment } = usePaddle();
  const [loading, setLoading] = useState(false);

  if (
    !subscription ||
    subscription.status === "canceled"
  ) {
    return null;
  }

  async function handleUpdatePayment() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/subscriptions/update-payment-method?slug=${encodeURIComponent(workspaceSlug)}`,
        {
        method: "POST",
        }
      );
      const json = await res.json();
      if (!res.ok || json.error) {
        console.error("Failed to get update transaction:", json.error);
        return;
      }
      openUpdatePayment(json.data.transactionId);
    } catch (err) {
      console.error("Failed to update payment method:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>Manage your payment information</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="cursor-pointer w-full"
          variant="outline"
          onClick={handleUpdatePayment}
          disabled={loading || !canManageBilling}
        >
          {loading && <Loader2 className="animate-spin" />}
          {canManageBilling ? "Update Payment Method" : "Only the owner can update payment"}
        </Button>
      </CardContent>
    </Card>
  );
}
