import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireCurrentWorkspace } from "@/lib/current-workspace";
import { FormMessage } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  getWorkspaceInvites,
  getWorkspaceMembers,
} from "@/domain/workspaces/workspace.service";
import {
  inviteWorkspaceMemberAction,
  removeWorkspaceMemberAction,
  updateWorkspaceMemberRoleAction,
} from "@/app/actions/workspaces";

export default async function WorkspaceMembersPage({
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
  const adminClient = createAdminClient();
  const [membersResult, invitesResult] = await Promise.all([
    getWorkspaceMembers(adminClient, workspace.current.workspace.id),
    getWorkspaceInvites(adminClient, workspace.current.workspace.id),
  ]);

  const members = membersResult.data ?? [];
  const invites = invitesResult.data ?? [];
  const canManageMembers =
    workspace.current.role === "owner" || workspace.current.role === "admin";
  const canChangeRoles = workspace.current.role === "owner";

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
        <h1 className="mt-2 text-3xl font-bold">Members</h1>
        <p className="mt-1 text-muted-foreground">
          Manage who can access {workspace.current.workspace.name}.
        </p>
      </div>

      <FormMessage />

      {canManageMembers && (
        <Card>
          <CardHeader>
            <CardTitle>Invite a teammate</CardTitle>
            <CardDescription>
              Send an email invite for this workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={inviteWorkspaceMemberAction} className="grid gap-4 md:grid-cols-[1fr_140px_160px]">
              <input type="hidden" name="workspace_slug" value={slug} />
              <Input name="email" type="email" placeholder="teammate@example.com" required />
              <select
                name="role"
                className="h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
                defaultValue="member"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <Button type="submit">Send invite</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active members</CardTitle>
          <CardDescription>
            Owners manage admins. Admins can remove members.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const fullName =
                  [member.first_name, member.last_name].filter(Boolean).join(" ") ||
                  "Unnamed user";
                const canRemove =
                  workspace.current.role === "owner" ||
                  (workspace.current.role === "admin" &&
                    member.role === "member") ||
                  member.user_id === user.id;
                return (
                  <TableRow key={member.id}>
                    <TableCell>{fullName}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      {canChangeRoles && member.role !== "owner" ? (
                        <form
                          action={updateWorkspaceMemberRoleAction}
                          className="flex justify-start"
                        >
                          <input type="hidden" name="workspace_slug" value={slug} />
                          <input type="hidden" name="membership_id" value={member.id} />
                          <select
                            name="role"
                            defaultValue={member.role}
                            className="h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                          <Button type="submit" variant="ghost" size="sm">
                            Save
                          </Button>
                        </form>
                      ) : (
                        <span className="capitalize">{member.role}</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(member.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {canRemove && member.role !== "owner" ? (
                        <form action={removeWorkspaceMemberAction} className="inline-block">
                          <input type="hidden" name="workspace_slug" value={slug} />
                          <input type="hidden" name="membership_id" value={member.id} />
                          <Button type="submit" variant="outline" size="sm">
                            {member.user_id === user.id ? "Leave" : "Remove"}
                          </Button>
                        </form>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending invites</CardTitle>
          <CardDescription>
            Open invites awaiting acceptance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending invites.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Invited by</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell>{invite.email}</TableCell>
                    <TableCell className="capitalize">{invite.role}</TableCell>
                    <TableCell>{invite.invited_by_email || "Unknown"}</TableCell>
                    <TableCell>{new Date(invite.expires_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
