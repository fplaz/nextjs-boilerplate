import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { paddle } from "@/lib/paddle";
import { getWorkspaceSubscription } from "@/domain/subscriptions/subscriptions.service";
import { resolveWorkspaceForUser } from "@/domain/workspaces/workspace.service";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const slug = typeof body.slug === "string" ? body.slug : undefined;
  const adminClient = createAdminClient();
  const workspaceResult = await resolveWorkspaceForUser(adminClient, user.id, slug);
  if (workspaceResult.error || !workspaceResult.data) {
    return NextResponse.json(
      { error: workspaceResult.error ?? "Workspace not found" },
      { status: 404 }
    );
  }
  if (workspaceResult.data.current.role !== "owner") {
    return NextResponse.json(
      { error: "Only the workspace owner can manage billing." },
      { status: 403 }
    );
  }

  const result = await getWorkspaceSubscription(
    supabase,
    workspaceResult.data.current.workspace.id
  );
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  const subscription = result.data;
  if (!subscription?.paddle_subscription_id) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }
  if (!subscription.scheduled_cancelation_date) {
    return NextResponse.json(
      { error: "Subscription does not have a pending cancellation" },
      { status: 400 }
    );
  }

  try {
    await paddle.subscriptions.update(subscription.paddle_subscription_id, {
      scheduledChange: null,
    });

    return NextResponse.json({ data: { reactivated: true } });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to reactivate subscription";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
