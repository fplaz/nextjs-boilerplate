"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { AdminSubscription } from "@/domain/admin/admin.service";

type SubscriptionWithEmail = AdminSubscription & { email: string };

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  trialing: "secondary",
  past_due: "destructive",
  canceled: "outline",
  paused: "outline",
};

export function SubscriptionsTable({
  subscriptions,
}: {
  subscriptions: SubscriptionWithEmail[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Plan Name</TableHead>
          <TableHead>Period Start</TableHead>
          <TableHead>Period End</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subscriptions.map((s) => (
          <TableRow key={s.id}>
            <TableCell>{s.email}</TableCell>
            <TableCell>
              <Badge variant={statusVariant[s.status] ?? "outline"}>
                {s.status}
              </Badge>
            </TableCell>
            <TableCell>{s.paddle_price_name ?? "—"}</TableCell>
            <TableCell>
              {s.current_period_start
                ? new Date(s.current_period_start).toLocaleDateString()
                : "—"}
            </TableCell>
            <TableCell>
              {s.current_period_end
                ? new Date(s.current_period_end).toLocaleDateString()
                : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
