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

type SubscriptionWithWorkspace = AdminSubscription & {
  workspace_name: string;
  workspace_slug: string;
  billing_owner_email: string;
};

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
  subscriptions: SubscriptionWithWorkspace[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Workspace</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Billing Owner</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Plan Name</TableHead>
          <TableHead>Period Start</TableHead>
          <TableHead>Period End</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subscriptions.map((s) => (
          <TableRow key={s.id}>
            <TableCell>{s.workspace_name}</TableCell>
            <TableCell className="font-mono text-sm">{s.workspace_slug}</TableCell>
            <TableCell>{s.billing_owner_email || "—"}</TableCell>
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
