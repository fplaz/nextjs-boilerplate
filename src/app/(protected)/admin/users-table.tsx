"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { AdminProfile } from "@/domain/admin/admin.service";

type ProfileWithEmail = AdminProfile & {
  email: string;
  subscription_name: string;
  trial_status: string;
  trial_ends_at: string;
};

type SortKey = "trial_status" | "trial_ends_at" | "subscription_name";
type SortDir = "asc" | "desc";

function SortableHead({
  label,
  sortKey,
  activeKey,
  activeDir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey | null;
  activeDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  return (
    <TableHead>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8"
        onClick={() => onSort(sortKey)}
      >
        {label}
        <ArrowUpDown
          className={`ml-1 h-4 w-4 ${activeKey === sortKey ? "opacity-100" : "opacity-40"}`}
        />
      </Button>
    </TableHead>
  );
}

export function UsersTable({ profiles }: { profiles: ProfileWithEmail[] }) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return profiles;

    return [...profiles].sort((a, b) => {
      let cmp: number;

      if (sortKey === "trial_ends_at") {
        const dateA = a.trial_ends_at ? new Date(a.trial_ends_at).getTime() : 0;
        const dateB = b.trial_ends_at ? new Date(b.trial_ends_at).getTime() : 0;
        cmp = dateA - dateB;
      } else {
        const valA = (a[sortKey] || "").toLowerCase();
        const valB = (b[sortKey] || "").toLowerCase();
        cmp = valA.localeCompare(valB);
      }

      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [profiles, sortKey, sortDir]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead className="max-w-48">Account Slug</TableHead>
          <SortableHead
            label="Trial Status"
            sortKey="trial_status"
            activeKey={sortKey}
            activeDir={sortDir}
            onSort={handleSort}
          />
          <SortableHead
            label="Trial End Date"
            sortKey="trial_ends_at"
            activeKey={sortKey}
            activeDir={sortDir}
            onSort={handleSort}
          />
          <SortableHead
            label="Subscription"
            sortKey="subscription_name"
            activeKey={sortKey}
            activeDir={sortDir}
            onSort={handleSort}
          />
          <TableHead>Created At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((p) => (
          <TableRow key={p.user_id}>
            <TableCell>{p.email}</TableCell>
            <TableCell className="max-w-48 truncate font-mono text-sm">{p.account_slug}</TableCell>
            <TableCell>{p.trial_status || "—"}</TableCell>
            <TableCell>{p.trial_ends_at ? new Date(p.trial_ends_at).toLocaleDateString() : "—"}</TableCell>
            <TableCell>{p.subscription_name || "Not subscribed"}</TableCell>
            <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
