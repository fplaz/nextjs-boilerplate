import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getExpiredTrials, expireTrial } from "@/domain/trials/trials.service";
import { sendTrialExpired } from "@/domain/email/email.service";

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
    await expireTrial(adminClient, trial.user_id);

    // Send trial expired notification (fire-and-forget per user)
    try {
      const { data: { user } } = await adminClient.auth.admin.getUserById(trial.user_id);
      if (user?.email) {
        const { data: profile } = await adminClient
          .from("profiles")
          .select("first_name")
          .eq("user_id", trial.user_id)
          .maybeSingle();

        sendTrialExpired(user.email, profile?.first_name || undefined).catch(console.error);
      }
    } catch (err) {
      console.error(`Failed to send trial expired email for user ${trial.user_id}:`, err);
    }

    processed++;
  }

  return NextResponse.json({ ok: true, processed });
}
