import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { expireTrial, getExpiredTrials } from "@/domain/trials/trials.service";
import { sendTrialExpired } from "@/domain/email/email.service";

async function getWorkspaceContact(
  adminClient: ReturnType<typeof createAdminClient>,
  workspaceId: string
) {
  const { data: workspace } = await adminClient
    .from("workspaces")
    .select("owner_user_id, billing_owner_user_id")
    .eq("id", workspaceId)
    .maybeSingle();

  if (!workspace) return null;

  const contactUserId =
    (workspace.billing_owner_user_id as string | null) ??
    (workspace.owner_user_id as string);

  const [{ data: authUser }, { data: profile }] = await Promise.all([
    adminClient.auth.admin.getUserById(contactUserId),
    adminClient
      .from("profiles")
      .select("first_name")
      .eq("user_id", contactUserId)
      .maybeSingle(),
  ]);

  return {
    email: authUser.user?.email ?? "",
    firstName: (profile?.first_name as string | null) ?? undefined,
  };
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const result = await getExpiredTrials(adminClient);
  if (result.error !== null) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  let processed = 0;
  for (const trial of result.data) {
    await expireTrial(adminClient, trial.workspace_id);

    try {
      const contact = await getWorkspaceContact(adminClient, trial.workspace_id);
      if (contact?.email) {
        sendTrialExpired(contact.email, contact.firstName).catch(console.error);
      }
    } catch (err) {
      console.error(
        `Failed to send trial expired email for workspace ${trial.workspace_id}:`,
        err
      );
    }

    processed++;
  }

  return NextResponse.json({ ok: true, processed });
}
