import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole } from "@/domain/auth/auth.service";
import {
  getAllProfiles,
  getAllWorkspaces,
  getAllTrials,
  getAllSubscriptions,
  getAllUsers,
} from "@/domain/admin/admin.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTable } from "./users-table";
import { TrialsTable } from "./trials-table";
import { SubscriptionsTable } from "./subscriptions-table";
import { WorkspacesTable } from "./workspaces-table";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const roleResult = await getUserRole(supabase, user.id);
  if (roleResult.data !== "admin") redirect("/dashboard");

  const adminClient = createAdminClient();

  const [
    profilesResult,
    workspacesResult,
    trialsResult,
    subscriptionsResult,
    usersResult,
    membershipsResult,
  ] =
    await Promise.all([
      getAllProfiles(adminClient),
      getAllWorkspaces(adminClient),
      getAllTrials(adminClient),
      getAllSubscriptions(adminClient),
      getAllUsers(adminClient),
      adminClient
        .from("workspace_memberships")
        .select("workspace_id, user_id")
        .eq("status", "active"),
    ]);

  const emailMap = new Map(
    (usersResult.data ?? []).map((u) => [u.id, u.email])
  );

  const workspaceMap = new Map(
    (workspacesResult.data ?? []).map((workspace) => [workspace.id, workspace])
  );

  const subscriptionMap = new Map(
    (subscriptionsResult.data ?? [])
      .filter((s) => s.status === "active" || s.status === "trialing")
      .map((s) => [s.workspace_id, s.paddle_price_name ?? ""])
  );

  const trialMap = new Map(
    (trialsResult.data ?? []).map((t) => [
      t.workspace_id,
      { trial_status: t.status, trial_ends_at: t.ends_at },
    ])
  );

  const memberCountMap = new Map<string, number>();
  for (const membership of membershipsResult.data ?? []) {
    memberCountMap.set(
      membership.workspace_id,
      (memberCountMap.get(membership.workspace_id) ?? 0) + 1
    );
  }

  const profiles = (profilesResult.data ?? []).map((p) => ({
    ...p,
    email: emailMap.get(p.user_id) ?? "",
    default_workspace_slug:
      workspaceMap.get(p.default_workspace_id ?? "")?.slug ?? "",
    subscription_name:
      subscriptionMap.get(p.default_workspace_id ?? "") ?? "",
    trial_status: trialMap.get(p.default_workspace_id ?? "")?.trial_status ?? "",
    trial_ends_at:
      trialMap.get(p.default_workspace_id ?? "")?.trial_ends_at ?? "",
  }));

  const trials = (trialsResult.data ?? []).map((t) => ({
    ...t,
    workspace_name: workspaceMap.get(t.workspace_id)?.name ?? "",
    workspace_slug: workspaceMap.get(t.workspace_id)?.slug ?? "",
  }));

  const subscriptions = (subscriptionsResult.data ?? []).map((s) => ({
    ...s,
    workspace_name: workspaceMap.get(s.workspace_id)?.name ?? "",
    workspace_slug: workspaceMap.get(s.workspace_id)?.slug ?? "",
    billing_owner_email: emailMap.get(s.billing_owner_user_id ?? "") ?? "",
  }));

  const workspaces = (workspacesResult.data ?? []).map((workspace) => ({
    ...workspace,
    owner_email: emailMap.get(workspace.owner_user_id) ?? "",
    billing_owner_email: emailMap.get(workspace.billing_owner_user_id ?? "") ?? "",
    member_count: memberCountMap.get(workspace.id) ?? 0,
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Admin area</h1>
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users ({profiles.length})</TabsTrigger>
          <TabsTrigger value="workspaces">
            Workspaces ({workspaces.length})
          </TabsTrigger>
          <TabsTrigger value="trials">Trials ({trials.length})</TabsTrigger>
          <TabsTrigger value="subscriptions">
            Subscriptions ({subscriptions.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UsersTable profiles={profiles} />
        </TabsContent>
        <TabsContent value="workspaces">
          <WorkspacesTable workspaces={workspaces} />
        </TabsContent>
        <TabsContent value="trials">
          <TrialsTable trials={trials} />
        </TabsContent>
        <TabsContent value="subscriptions">
          <SubscriptionsTable subscriptions={subscriptions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
