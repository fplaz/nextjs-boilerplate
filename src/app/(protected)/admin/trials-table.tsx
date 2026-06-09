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
import type { AdminTrial } from "@/domain/admin/admin.service";

type TrialWithWorkspace = AdminTrial & {
  workspace_name: string;
  workspace_slug: string;
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  expired: "destructive",
  converted: "secondary",
};

export function TrialsTable({ trials }: { trials: TrialWithWorkspace[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Workspace</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Starts At</TableHead>
          <TableHead>Ends At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {trials.map((t) => (
          <TableRow key={t.workspace_id}>
            <TableCell>{t.workspace_name}</TableCell>
            <TableCell className="font-mono text-sm">{t.workspace_slug}</TableCell>
            <TableCell>
              <Badge variant={statusVariant[t.status] ?? "outline"}>
                {t.status}
              </Badge>
            </TableCell>
            <TableCell>{t.plan}</TableCell>
            <TableCell>{new Date(t.starts_at).toLocaleDateString()}</TableCell>
            <TableCell>{new Date(t.ends_at).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
