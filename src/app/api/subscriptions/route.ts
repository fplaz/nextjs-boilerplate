import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWorkspaceBillingState } from "@/domain/subscriptions/subscriptions.service";
import { resolveWorkspaceForUser } from "@/domain/workspaces/workspace.service";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = new URL(request.url).searchParams.get("slug") ?? undefined;
  const adminClient = createAdminClient();
  const workspaceResult = await resolveWorkspaceForUser(adminClient, user.id, slug);

  if (workspaceResult.error || !workspaceResult.data) {
    return NextResponse.json(
      { error: workspaceResult.error ?? "Workspace not found" },
      { status: 404 }
    );
  }

  const result = await getWorkspaceBillingState(
    supabase,
    workspaceResult.data.current.workspace.id
  );

  if (result.error !== null) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: result.data });
}
