import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  resolveWorkspaceForUser,
  setDefaultWorkspaceForUser,
} from "@/domain/workspaces/workspace.service";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const slug = request.nextUrl.searchParams.get("slug");
  const next = request.nextUrl.searchParams.get("next");

  if (!slug) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const adminClient = createAdminClient();
  const workspaceResult = await resolveWorkspaceForUser(adminClient, user.id, slug);

  if (workspaceResult.error || !workspaceResult.data) {
    return NextResponse.redirect(
      new URL("/account?error=Workspace%20not%20found", request.url)
    );
  }

  await setDefaultWorkspaceForUser(adminClient, {
    userId: user.id,
    workspaceId: workspaceResult.data.current.workspace.id,
  });

  const destination =
    next && next.startsWith("/") ? next : `/w/${workspaceResult.data.current.workspace.slug}/dashboard`;

  return NextResponse.redirect(new URL(destination, request.url));
}
