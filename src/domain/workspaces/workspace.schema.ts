import { z } from "zod";
import { SLUG_REGEX } from "@/lib/slug";

export const workspaceRole = z.enum(["owner", "admin", "member"]);
export type WorkspaceRole = z.infer<typeof workspaceRole>;

export const workspaceStatus = z.enum([
  "active",
  "suspended",
  "deleting",
  "deleted",
]);
export type WorkspaceStatus = z.infer<typeof workspaceStatus>;

export const workspaceRow = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  owner_user_id: z.string().uuid(),
  billing_owner_user_id: z.string().uuid().nullable(),
  status: workspaceStatus,
  created_at: z.string(),
  updated_at: z.string(),
});
export type WorkspaceRow = z.infer<typeof workspaceRow>;

export const workspaceMembershipStatus = z.enum(["active", "invited", "suspended"]);
export type WorkspaceMembershipStatus = z.infer<typeof workspaceMembershipStatus>;

export const workspaceMembershipRow = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: workspaceRole,
  status: workspaceMembershipStatus,
  invited_by_user_id: z.string().uuid().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type WorkspaceMembershipRow = z.infer<typeof workspaceMembershipRow>;

export const workspaceInviteRow = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["admin", "member"]),
  token_hash: z.string(),
  invited_by_user_id: z.string().uuid(),
  accepted_by_user_id: z.string().uuid().nullable(),
  expires_at: z.string(),
  accepted_at: z.string().nullable(),
  revoked_at: z.string().nullable(),
  created_at: z.string(),
});
export type WorkspaceInviteRow = z.infer<typeof workspaceInviteRow>;

export const createWorkspaceInput = z.object({
  userId: z.string().uuid(),
  slug: z
    .string()
    .min(1, "Workspace slug is required")
    .max(50, "Workspace slug must be 50 characters or less")
    .regex(
      SLUG_REGEX,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  name: z.string().min(1, "Workspace name is required").max(100),
});
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceInput>;

export const inviteMemberInput = z.object({
  workspaceId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["admin", "member"]),
  invitedByUserId: z.string().uuid(),
});
export type InviteMemberInput = z.infer<typeof inviteMemberInput>;

export const acceptInviteInput = z.object({
  token: z.string().min(1, "Invite token is required"),
  userId: z.string().uuid(),
  email: z.string().email(),
});
export type AcceptInviteInput = z.infer<typeof acceptInviteInput>;

export const updateWorkspaceMemberRoleInput = z.object({
  workspaceId: z.string().uuid(),
  membershipId: z.string().uuid(),
  actorUserId: z.string().uuid(),
  role: z.enum(["admin", "member"]),
});
export type UpdateWorkspaceMemberRoleInput = z.infer<
  typeof updateWorkspaceMemberRoleInput
>;

export const removeWorkspaceMemberInput = z.object({
  workspaceId: z.string().uuid(),
  membershipId: z.string().uuid(),
  actorUserId: z.string().uuid(),
});
export type RemoveWorkspaceMemberInput = z.infer<
  typeof removeWorkspaceMemberInput
>;

export const updateWorkspaceDefaultInput = z.object({
  userId: z.string().uuid(),
  workspaceId: z.string().uuid(),
});
export type UpdateWorkspaceDefaultInput = z.infer<
  typeof updateWorkspaceDefaultInput
>;
