import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  WorkspaceInviteView,
  WorkspaceMemberView,
} from "@/domain/workspaces/workspace.service";
import {
  inviteWorkspaceMemberAction,
  removeWorkspaceMemberAction,
  updateWorkspaceMemberRoleAction,
} from "@/app/actions/workspaces";

export function MembersSection({
  slug,
  members,
  invites,
  currentUserId,
  currentRole,
}: {
  slug: string;
  members: WorkspaceMemberView[];
  invites: WorkspaceInviteView[];
  currentUserId: string;
  currentRole: string;
}) {
  const canManageMembers = currentRole === "owner" || currentRole === "admin";
  const canChangeRoles = currentRole === "owner";

  return (
    <div className="space-y-8">
      {canManageMembers && (
        <Card>
          <CardHeader>
            <CardTitle>Invite a teammate</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={inviteWorkspaceMemberAction}
              className="grid gap-4 md:grid-cols-[1fr_140px_160px]"
            >
              <input type="hidden" name="workspace_slug" value={slug} />
              <Input
                name="email"
                type="email"
                placeholder="teammate@example.com"
                required
              />
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
                  [member.first_name, member.last_name]
                    .filter(Boolean)
                    .join(" ") || "Unnamed user";
                const canRemove =
                  currentRole === "owner" ||
                  (currentRole === "admin" && member.role === "member") ||
                  member.user_id === currentUserId;
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
                          <input
                            type="hidden"
                            name="workspace_slug"
                            value={slug}
                          />
                          <input
                            type="hidden"
                            name="membership_id"
                            value={member.id}
                          />
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
                    <TableCell>
                      {new Date(member.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {canRemove && member.role !== "owner" ? (
                        <form
                          action={removeWorkspaceMemberAction}
                          className="inline-block"
                        >
                          <input
                            type="hidden"
                            name="workspace_slug"
                            value={slug}
                          />
                          <input
                            type="hidden"
                            name="membership_id"
                            value={member.id}
                          />
                          <Button type="submit" variant="outline" size="sm">
                            {member.user_id === currentUserId
                              ? "Leave"
                              : "Remove"}
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
                    <TableCell>
                      {invite.invited_by_email || "Unknown"}
                    </TableCell>
                    <TableCell>
                      {new Date(invite.expires_at).toLocaleDateString()}
                    </TableCell>
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
