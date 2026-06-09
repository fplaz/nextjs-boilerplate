import { NavBar } from "@/components/nav-bar";
import { TrialBanner } from "@/components/trial-banner";
import { createClient } from "@/lib/supabase/server";
import { userHasPassword, getUserRole } from "@/domain/auth/auth.service";
import { getWorkspaceBillingState } from "@/domain/subscriptions/subscriptions.service";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveWorkspaceForUser } from "@/domain/workspaces/workspace.service";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const needsPassword = user ? !userHasPassword(user) : false;

  let isAdmin = false;
  if (user) {
    const roleResult = await getUserRole(supabase, user.id);
    isAdmin = roleResult.data === "admin";
  }

  let showTrialBanner = false;
  let trialEnd: string | null = null;
  let currentWorkspaceSlug: string | null = null;
  let workspaces: Array<{ slug: string; name: string; role: string }> = [];

  if (user) {
    const adminClient = createAdminClient();
    const workspaceResult = await resolveWorkspaceForUser(adminClient, user.id);

    if (workspaceResult.data) {
      currentWorkspaceSlug = workspaceResult.data.current.workspace.slug;
      workspaces = workspaceResult.data.memberships.map((membership) => ({
        slug: membership.workspace.slug,
        name: membership.workspace.name,
        role: membership.role,
      }));
      const billingState = await getWorkspaceBillingState(
        supabase,
        workspaceResult.data.current.workspace.id
      );
      if (billingState.data?.status === "trialing" && billingState.data.trialEnd) {
        showTrialBanner = true;
        trialEnd = billingState.data.trialEnd;
      }
    }
  }

  return (
    <>
      <NavBar
        needsPassword={needsPassword}
        isAdmin={isAdmin}
        userName={
          user
            ? [user.user_metadata?.first_name, user.user_metadata?.last_name]
                .filter(Boolean)
                .join(" ") || null
            : null
        }
        userEmail={user?.email ?? null}
        workspaces={workspaces}
        currentWorkspaceSlug={currentWorkspaceSlug}
      />
      {showTrialBanner && trialEnd && <TrialBanner trialEnd={trialEnd} />}
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </>
  );
}
