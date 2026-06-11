"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = ["basic", "members", "billing"] as const;
type TabValue = (typeof TABS)[number];

function isTabValue(value: string | null): value is TabValue {
  return value !== null && (TABS as readonly string[]).includes(value);
}

export function SettingsTabs({
  basic,
  members,
  billing,
}: {
  basic: React.ReactNode;
  members: React.ReactNode;
  billing: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab");
  const activeTab: TabValue = isTabValue(tabParam) ? tabParam : "basic";

  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      // Clear any stale feedback from a previous tab's action.
      params.delete("error");
      params.delete("message");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="basic">Name & Logo</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="billing">Plan & Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="basic" className="mt-6">
        {basic}
      </TabsContent>
      <TabsContent value="members" className="mt-6">
        {members}
      </TabsContent>
      <TabsContent value="billing" className="mt-6">
        {billing}
      </TabsContent>
    </Tabs>
  );
}
