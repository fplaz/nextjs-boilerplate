import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getTrialsNeedingTwoDayWarning,
  getTrialsNeedingOneDayWarning,
  markTwoDayWarningSent,
  markOneDayWarningSent,
} from "@/domain/trials/trials.service";
import {
  sendTrialTwoDayWarning,
  sendTrialOneDayWarning,
} from "@/domain/email/email.service";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();
  let twoDayCount = 0;
  let oneDayCount = 0;

  // Send 2-day warnings
  const twoDayResult = await getTrialsNeedingTwoDayWarning(adminClient);
  if (twoDayResult.error === null) {
    for (const trial of twoDayResult.data) {
      try {
        const { data: { user } } = await adminClient.auth.admin.getUserById(trial.user_id);
        if (!user?.email) continue;

        const { data: profile } = await adminClient
          .from("profiles")
          .select("first_name")
          .eq("user_id", trial.user_id)
          .maybeSingle();

        const result = await sendTrialTwoDayWarning(user.email, profile?.first_name || undefined);
        if (result.error === null) {
          await markTwoDayWarningSent(adminClient, trial.user_id);
          twoDayCount++;
        } else {
          console.error(`Failed to send 2-day warning to ${user.email}:`, result.error);
        }
      } catch (err) {
        console.error(`Error processing 2-day warning for user ${trial.user_id}:`, err);
      }
    }
  }

  // Send 1-day warnings
  const oneDayResult = await getTrialsNeedingOneDayWarning(adminClient);
  if (oneDayResult.error === null) {
    for (const trial of oneDayResult.data) {
      try {
        const { data: { user } } = await adminClient.auth.admin.getUserById(trial.user_id);
        if (!user?.email) continue;

        const { data: profile } = await adminClient
          .from("profiles")
          .select("first_name")
          .eq("user_id", trial.user_id)
          .maybeSingle();

        const result = await sendTrialOneDayWarning(user.email, profile?.first_name || undefined);
        if (result.error === null) {
          await markOneDayWarningSent(adminClient, trial.user_id);
          oneDayCount++;
        } else {
          console.error(`Failed to send 1-day warning to ${user.email}:`, result.error);
        }
      } catch (err) {
        console.error(`Error processing 1-day warning for user ${trial.user_id}:`, err);
      }
    }
  }

  return NextResponse.json({ ok: true, twoDayWarnings: twoDayCount, oneDayWarnings: oneDayCount });
}
