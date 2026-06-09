import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole } from "@/domain/auth/auth.service";
import {
  getAllProfiles,
  getAllTrials,
  getAllSubscriptions,
  getAllUsers,
} from "@/domain/admin/admin.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTable } from "./users-table";
import { TrialsTable } from "./trials-table";
import { SubscriptionsTable } from "./subscriptions-table";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const roleResult = await getUserRole(supabase, user.id);
  if (roleResult.data !== "admin") redirect("/dashboard");

  const adminClient = createAdminClient();

  const [profilesResult, trialsResult, subscriptionsResult, usersResult] =
    await Promise.all([
      getAllProfiles(adminClient),
      getAllTrials(adminClient),
      getAllSubscriptions(adminClient),
      getAllUsers(adminClient),
    ]);

  const emailMap = new Map(
    (usersResult.data ?? []).map((u) => [u.id, u.email])
  );

  const subscriptionMap = new Map(
    (subscriptionsResult.data ?? [])
      .filter((s) => s.status === "active" || s.status === "trialing")
      .map((s) => [s.user_id, s.paddle_price_name ?? ""])
  );

  const trialMap = new Map(
    (trialsResult.data ?? []).map((t) => [
      t.user_id,
      { trial_status: t.status, trial_ends_at: t.ends_at },
    ])
  );

  const profiles = (profilesResult.data ?? []).map((p) => ({
    ...p,
    email: emailMap.get(p.user_id) ?? "",
    subscription_name: subscriptionMap.get(p.user_id) ?? "",
    trial_status: trialMap.get(p.user_id)?.trial_status ?? "",
    trial_ends_at: trialMap.get(p.user_id)?.trial_ends_at ?? "",
  }));

  const trials = (trialsResult.data ?? []).map((t) => ({
    ...t,
    email: emailMap.get(t.user_id) ?? "",
  }));

  const subscriptions = (subscriptionsResult.data ?? []).map((s) => ({
    ...s,
    email: emailMap.get(s.user_id) ?? "",
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Admin area</h1>
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users ({profiles.length})</TabsTrigger>
          <TabsTrigger value="trials">Trials ({trials.length})</TabsTrigger>
          <TabsTrigger value="subscriptions">
            Subscriptions ({subscriptions.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UsersTable profiles={profiles} />
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
