import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWorkspaceInviteByToken } from "@/domain/workspaces/workspace.service";
import { acceptWorkspaceInviteAction } from "@/app/actions/workspaces";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function InviteAcceptPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token = "", error } = await searchParams;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invite not found</CardTitle>
            <CardDescription>This invite link is missing a token.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const inviteResult = await getWorkspaceInviteByToken(createAdminClient(), token);
  const invite = inviteResult.data;

  if (!invite) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invite not found</CardTitle>
            <CardDescription>
              This invite is invalid, expired, or has already been used.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?redirect_to=${encodeURIComponent(
        `/invite/accept?token=${token}`
      )}&invite_token=${encodeURIComponent(token)}`
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join {invite.workspace.name}</CardTitle>
          <CardDescription>
            Accept this invite to join the workspace as an{" "}
            <span className="font-medium">{invite.role}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4 text-sm">
            <p>
              Workspace: <span className="font-medium">{invite.workspace.name}</span>
            </p>
            <p>
              URL slug: <span className="font-mono">{invite.workspace.slug}</span>
            </p>
            <p>
              Invited email: <span className="font-medium">{invite.email}</span>
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <form action={acceptWorkspaceInviteAction}>
            <input type="hidden" name="token" value={token} />
            <Button className="w-full">Accept invite</Button>
          </form>

          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard">Cancel</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
