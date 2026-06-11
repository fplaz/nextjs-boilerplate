import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Suspense } from "react";
import { requireCurrentWorkspace } from "@/lib/current-workspace";
import { SettingsToast } from "./settings-toast";
import {
  getWorkspaceInvites,
  getWorkspaceLogoUrl,
  getWorkspaceMembers,
} from "@/domain/workspaces/workspace.service";
import {
  getWorkspaceBillingState,
  getWorkspaceSubscription,
} from "@/domain/subscriptions/subscriptions.service";
import { SettingsTabs } from "./settings-tabs";
import { BasicInfoSection } from "./basic-info-section";
import { LogoSection } from "./logo-section";
import { MembersSection } from "./members-section";
import { BillingSection } from "./billing-section";

export default async function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const workspace = await requireCurrentWorkspace(supabase, user.id, slug);
  const workspaceId = workspace.current.workspace.id;
  const adminClient = createAdminClient();

  const [membersResult, invitesResult, subResult, billingStateResult] =
    await Promise.all([
      getWorkspaceMembers(adminClient, workspaceId),
      getWorkspaceInvites(adminClient, workspaceId),
      getWorkspaceSubscription(supabase, workspaceId),
      getWorkspaceBillingState(supabase, workspaceId),
    ]);

  const members = membersResult.data ?? [];
  const invites = invitesResult.data ?? [];
  const subscription = subResult.data ?? null;
  const billingState = billingStateResult.data ?? {
    status: "none" as const,
    trialEnd: null,
    planName: null,
  };

  const priceIds = {
    basicMonthly: process.env.PADDLE_BASIC_PRICE_ID ?? "",
    basicYearly: process.env.PADDLE_BASIC_YEARLY_PRICE_ID ?? "",
    growthMonthly: process.env.PADDLE_GROWTH_PRICE_ID ?? "",
    growthYearly: process.env.PADDLE_GROWTH_YEARLY_PRICE_ID ?? "",
    proMonthly: process.env.PADDLE_PRO_PRICE_ID ?? "",
    proYearly: process.env.PADDLE_PRO_YEARLY_PRICE_ID ?? "",
  };

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/w/${slug}/dashboard`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to workspace
        </Link>
        <h1 className="mt-2 text-3xl font-bold">Workspace Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage {workspace.current.workspace.name}&apos;s details, members, and billing.
        </p>
      </div>

      <Suspense>
        <SettingsToast />
      </Suspense>

      <SettingsTabs
        basic={
          <div className="space-y-6">
            <BasicInfoSection
              name={workspace.current.workspace.name}
              slug={workspace.current.workspace.slug}
              role={workspace.current.role}
            />
            <LogoSection
              slug={workspace.current.workspace.slug}
              role={workspace.current.role}
              name={workspace.current.workspace.name}
              logoUrl={getWorkspaceLogoUrl(
                supabase,
                workspace.current.workspace.logo_path
              )}
            />
          </div>
        }
        members={
          <MembersSection
            slug={slug}
            members={members}
            invites={invites}
            currentUserId={user.id}
            currentRole={workspace.current.role}
          />
        }
        billing={
          <BillingSection
            subscription={subscription}
            billingState={billingState}
            workspaceId={workspaceId}
            billingOwnerUserId={
              workspace.current.workspace.billing_owner_user_id ?? user.id
            }
            userEmail={user.email ?? ""}
            slug={slug}
            canManageBilling={workspace.current.role === "owner"}
            priceIds={priceIds}
          />
        }
      />
    </div>
  );
}
