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
import type { AdminWorkspace } from "@/domain/admin/admin.service";

type WorkspaceWithOwners = AdminWorkspace & {
  owner_email: string;
  billing_owner_email: string;
  member_count: number;
};

export function WorkspacesTable({
  workspaces,
}: {
  workspaces: WorkspaceWithOwners[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Billing Owner</TableHead>
          <TableHead>Members</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workspaces.map((workspace) => (
          <TableRow key={workspace.id}>
            <TableCell>{workspace.name}</TableCell>
            <TableCell className="font-mono text-sm">{workspace.slug}</TableCell>
            <TableCell>
              <Badge variant={workspace.status === "active" ? "default" : "outline"}>
                {workspace.status}
              </Badge>
            </TableCell>
            <TableCell>{workspace.owner_email}</TableCell>
            <TableCell>{workspace.billing_owner_email || "—"}</TableCell>
            <TableCell>{workspace.member_count}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
