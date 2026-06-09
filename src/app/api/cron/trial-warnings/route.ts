import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getTrialsNeedingOneDayWarning,
  getTrialsNeedingTwoDayWarning,
  markOneDayWarningSent,
  markTwoDayWarningSent,
} from "@/domain/trials/trials.service";
import {
  sendTrialOneDayWarning,
  sendTrialTwoDayWarning,
} from "@/domain/email/email.service";

async function getWorkspaceContact(
  adminClient: ReturnType<typeof createAdminClient>,
  workspaceId: string
) {
  const { data: workspace, error } = await adminClient
    .from("workspaces")
    .select("owner_user_id, billing_owner_user_id")
    .eq("id", workspaceId)
    .maybeSingle();

  if (error || !workspace) return null;

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
  let twoDayCount = 0;
  let oneDayCount = 0;

  const twoDayResult = await getTrialsNeedingTwoDayWarning(adminClient);
  if (twoDayResult.error === null) {
    for (const trial of twoDayResult.data) {
      try {
        const contact = await getWorkspaceContact(adminClient, trial.workspace_id);
        if (!contact?.email) continue;

        const result = await sendTrialTwoDayWarning(contact.email, contact.firstName);
        if (result.error === null) {
          await markTwoDayWarningSent(adminClient, trial.workspace_id);
          twoDayCount++;
        }
      } catch (err) {
        console.error(
          `Error processing 2-day warning for workspace ${trial.workspace_id}:`,
          err
        );
      }
    }
  }

  const oneDayResult = await getTrialsNeedingOneDayWarning(adminClient);
  if (oneDayResult.error === null) {
    for (const trial of oneDayResult.data) {
      try {
        const contact = await getWorkspaceContact(adminClient, trial.workspace_id);
        if (!contact?.email) continue;

        const result = await sendTrialOneDayWarning(contact.email, contact.firstName);
        if (result.error === null) {
          await markOneDayWarningSent(adminClient, trial.workspace_id);
          oneDayCount++;
        }
      } catch (err) {
        console.error(
          `Error processing 1-day warning for workspace ${trial.workspace_id}:`,
          err
        );
      }
    }
  }

  return NextResponse.json({ ok: true, twoDayWarnings: twoDayCount, oneDayWarnings: oneDayCount });
}
