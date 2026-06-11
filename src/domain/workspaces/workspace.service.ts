import crypto from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ZodError } from "zod";
import {
  acceptInviteInput,
  createWorkspaceInput,
  extensionForLogoType,
  inviteMemberInput,
  removeWorkspaceLogoInput,
  removeWorkspaceMemberInput,
  updateWorkspaceDefaultInput,
  updateWorkspaceMemberRoleInput,
  updateWorkspaceNameInput,
  uploadWorkspaceLogoInput,
  WORKSPACE_LOGO_BUCKET,
  type WorkspaceInviteRow,
  type WorkspaceMembershipRow,
  type WorkspaceRole,
  type WorkspaceRow,
} from "./workspace.schema";

type ServiceResult<T = null> =
  | { data: T; error: null }
  | { data: null; error: string };

export type WorkspaceMembershipWithWorkspace = WorkspaceMembershipRow & {
  workspace: WorkspaceRow;
};

export type ResolvedWorkspace = {
  current: WorkspaceMembershipWithWorkspace;
  memberships: WorkspaceMembershipWithWorkspace[];
};

export type WorkspaceMemberView = WorkspaceMembershipRow & {
  email: string;
  first_name: string | null;
  last_name: string | null;
};

export type WorkspaceInviteView = Omit<WorkspaceInviteRow, "token_hash"> & {
  invited_by_email: string;
};

export function formatWorkspaceNameFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function hashInviteToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function isPrivilegedWorkspaceRole(role: WorkspaceRole): boolean {
  return role === "owner" || role === "admin";
}

function canRemoveTarget(
  actorRole: WorkspaceRole,
  targetRole: WorkspaceRole,
  isSelf: boolean
): boolean {
  if (targetRole === "owner") return false;
  if (actorRole === "owner") return true;
  if (actorRole === "admin") {
    if (isSelf) return true;
    return targetRole === "member";
  }
  return isSelf;
}

function normalizeMembershipRow(row: Record<string, unknown>): WorkspaceMembershipWithWorkspace {
  const workspace = row.workspaces as Record<string, unknown> | null;

  return {
    id: String(row.id),
    workspace_id: String(row.workspace_id),
    user_id: String(row.user_id),
    role: row.role as WorkspaceRole,
    status: row.status as WorkspaceMembershipRow["status"],
    invited_by_user_id:
      typeof row.invited_by_user_id === "string" ? row.invited_by_user_id : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    workspace: {
      id: String(workspace?.id),
      slug: String(workspace?.slug),
      name: String(workspace?.name),
      owner_user_id: String(workspace?.owner_user_id),
      billing_owner_user_id:
        typeof workspace?.billing_owner_user_id === "string"
          ? workspace.billing_owner_user_id
          : null,
      status: (workspace?.status as WorkspaceRow["status"]) ?? "active",
      logo_path:
        typeof workspace?.logo_path === "string" ? workspace.logo_path : null,
      created_at: String(workspace?.created_at),
      updated_at: String(workspace?.updated_at),
    },
  };
}

export async function isWorkspaceSlugAvailable(
  adminClient: SupabaseClient,
  slug: string
): Promise<boolean> {
  const { data } = await adminClient
    .from("workspaces")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  return !data;
}

export async function createWorkspace(
  adminClient: SupabaseClient,
  input: { userId: string; slug: string; name?: string }
): Promise<ServiceResult<WorkspaceRow>> {
  try {
    const parsed = createWorkspaceInput.parse({
      ...input,
      name:
        input.name ??
        formatWorkspaceNameFromSlug(input.slug) ??
        "My Workspace",
    });

    const available = await isWorkspaceSlugAvailable(adminClient, parsed.slug);
    if (!available) {
      return { data: null, error: "This workspace slug is already in use" };
    }

    const { data: workspace, error: workspaceError } = await adminClient
      .from("workspaces")
      .insert({
        slug: parsed.slug,
        name: parsed.name,
        owner_user_id: parsed.userId,
        billing_owner_user_id: parsed.userId,
      })
      .select("*")
      .single();

    if (workspaceError || !workspace) {
      return {
        data: null,
        error: workspaceError?.message ?? "Could not create workspace.",
      };
    }

    const { error: membershipError } = await adminClient
      .from("workspace_memberships")
      .insert({
        workspace_id: workspace.id,
        user_id: parsed.userId,
        role: "owner",
        status: "active",
      });

    if (membershipError) {
      await adminClient.from("workspaces").delete().eq("id", workspace.id);
      return { data: null, error: "Could not create workspace membership." };
    }

    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        default_workspace_id: workspace.id,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", parsed.userId);

    if (profileError) {
      await adminClient.from("workspaces").delete().eq("id", workspace.id);
      return { data: null, error: "Could not link workspace to your profile." };
    }

    return { data: workspace as WorkspaceRow, error: null };
  } catch (err) {
    if (err instanceof ZodError) {
      return { data: null, error: err.issues[0].message };
    }
    throw err;
  }
}

export async function setDefaultWorkspaceForUser(
  adminClient: SupabaseClient,
  input: { userId: string; workspaceId: string }
): Promise<ServiceResult> {
  try {
    const parsed = updateWorkspaceDefaultInput.parse(input);

    const { data: membership, error: membershipError } = await adminClient
      .from("workspace_memberships")
      .select("id")
      .eq("workspace_id", parsed.workspaceId)
      .eq("user_id", parsed.userId)
      .eq("status", "active")
      .maybeSingle();

    if (membershipError) return { data: null, error: membershipError.message };
    if (!membership) return { data: null, error: "Workspace membership not found." };

    const { error } = await adminClient
      .from("profiles")
      .update({
        default_workspace_id: parsed.workspaceId,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", parsed.userId);

    if (error) return { data: null, error: error.message };
    return { data: null, error: null };
  } catch (err) {
    if (err instanceof ZodError) {
      return { data: null, error: err.issues[0].message };
    }
    throw err;
  }
}

export async function getWorkspaceMembershipsForUser(
  adminClient: SupabaseClient,
  userId: string
): Promise<ServiceResult<WorkspaceMembershipWithWorkspace[]>> {
  const { data, error } = await adminClient
    .from("workspace_memberships")
    .select(
      "id, workspace_id, user_id, role, status, invited_by_user_id, created_at, updated_at, workspaces!inner(id, slug, name, owner_user_id, billing_owner_user_id, status, logo_path, created_at, updated_at)"
    )
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (error) return { data: null, error: error.message };

  return {
    data: (data ?? []).map((row) =>
      normalizeMembershipRow(row as unknown as Record<string, unknown>)
    ),
    error: null,
  };
}

export async function resolveWorkspaceForUser(
  adminClient: SupabaseClient,
  userId: string,
  slug?: string
): Promise<ServiceResult<ResolvedWorkspace>> {
  const [profileResult, membershipsResult] = await Promise.all([
    adminClient
      .from("profiles")
      .select("default_workspace_id")
      .eq("user_id", userId)
      .maybeSingle(),
    getWorkspaceMembershipsForUser(adminClient, userId),
  ]);

  if (profileResult.error) {
    return { data: null, error: profileResult.error.message };
  }

  if (membershipsResult.error) {
    return { data: null, error: membershipsResult.error };
  }

  const memberships = membershipsResult.data ?? [];
  if (memberships.length === 0) {
    return { data: null, error: "You do not belong to any workspaces." };
  }

  const defaultWorkspaceId =
    (profileResult.data?.default_workspace_id as string | null | undefined) ?? null;

  const current =
    (slug
      ? memberships.find((membership) => membership.workspace.slug === slug)
      : undefined) ??
    (defaultWorkspaceId
      ? memberships.find(
          (membership) => membership.workspace.id === defaultWorkspaceId
        )
      : undefined) ??
    memberships[0];

  if (slug && current.workspace.slug !== slug) {
    return { data: null, error: "Workspace not found." };
  }

  if (current.workspace.id !== defaultWorkspaceId) {
    await setDefaultWorkspaceForUser(adminClient, {
      userId,
      workspaceId: current.workspace.id,
    });
  }

  return { data: { current, memberships }, error: null };
}

export async function getWorkspaceMembers(
  adminClient: SupabaseClient,
  workspaceId: string
): Promise<ServiceResult<WorkspaceMemberView[]>> {
  const [membershipsResult, profilesResult, authUsersResult] = await Promise.all([
    adminClient
      .from("workspace_memberships")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("status", "active")
      .order("created_at", { ascending: true }),
    adminClient
      .from("profiles")
      .select("user_id, first_name, last_name"),
    adminClient.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  if (membershipsResult.error) {
    return { data: null, error: membershipsResult.error.message };
  }
  if (profilesResult.error) {
    return { data: null, error: profilesResult.error.message };
  }
  if (authUsersResult.error) {
    return { data: null, error: authUsersResult.error.message };
  }

  const profileMap = new Map(
    (profilesResult.data ?? []).map((profile) => [
      profile.user_id,
      {
        first_name: profile.first_name as string | null,
        last_name: profile.last_name as string | null,
      },
    ])
  );
  const emailMap = new Map(
    authUsersResult.data.users.map((authUser) => [authUser.id, authUser.email ?? ""])
  );

  const members = (membershipsResult.data ?? []).map((membership) => {
    const profile = profileMap.get(membership.user_id) ?? {
      first_name: null,
      last_name: null,
    };

    return {
      ...(membership as WorkspaceMembershipRow),
      email: emailMap.get(membership.user_id) ?? "",
      first_name: profile.first_name,
      last_name: profile.last_name,
    };
  });

  return { data: members, error: null };
}

export async function getWorkspaceInvites(
  adminClient: SupabaseClient,
  workspaceId: string
): Promise<ServiceResult<WorkspaceInviteView[]>> {
  const [invitesResult, authUsersResult] = await Promise.all([
    adminClient
      .from("workspace_invites")
      .select("*")
      .eq("workspace_id", workspaceId)
      .is("accepted_at", null)
      .is("revoked_at", null)
      .order("created_at", { ascending: false }),
    adminClient.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  if (invitesResult.error) {
    return { data: null, error: invitesResult.error.message };
  }
  if (authUsersResult.error) {
    return { data: null, error: authUsersResult.error.message };
  }

  const emailMap = new Map(
    authUsersResult.data.users.map((authUser) => [authUser.id, authUser.email ?? ""])
  );

  const invites = (invitesResult.data ?? []).map((invite) => ({
    ...(invite as WorkspaceInviteRow),
    invited_by_email: emailMap.get(invite.invited_by_user_id) ?? "",
  }));

  return { data: invites, error: null };
}

export async function createWorkspaceInvite(
  adminClient: SupabaseClient,
  input: {
    workspaceId: string;
    email: string;
    role: "admin" | "member";
    invitedByUserId: string;
  }
): Promise<ServiceResult<{ invite: WorkspaceInviteRow; token: string }>> {
  try {
    const parsed = inviteMemberInput.parse(input);

    const actorResolution = await resolveWorkspaceForUser(
      adminClient,
      parsed.invitedByUserId
    );
    if (actorResolution.error) {
      return { data: null, error: actorResolution.error };
    }

    const actorMembership = actorResolution.data?.memberships.find(
      (membership) => membership.workspace.id === parsed.workspaceId
    );
    if (!actorMembership || !isPrivilegedWorkspaceRole(actorMembership.role)) {
      return { data: null, error: "You are not allowed to invite members." };
    }

    const normalizedEmail = parsed.email.toLowerCase();
    const authUsersResult = await adminClient.auth.admin.listUsers({ perPage: 1000 });
    if (authUsersResult.error) {
      return { data: null, error: authUsersResult.error.message };
    }

    const existingUser = authUsersResult.data.users.find(
      (authUser) => authUser.email?.toLowerCase() === normalizedEmail
    );

    if (existingUser) {
      const { data: existingMembership, error: existingMembershipError } =
        await adminClient
          .from("workspace_memberships")
          .select("id")
          .eq("workspace_id", parsed.workspaceId)
          .eq("user_id", existingUser.id)
          .eq("status", "active")
          .maybeSingle();

      if (existingMembershipError) {
        return { data: null, error: existingMembershipError.message };
      }
      if (existingMembership) {
        return { data: null, error: "That user is already a workspace member." };
      }
    }

    const { data: existingInvite, error: existingInviteError } = await adminClient
      .from("workspace_invites")
      .select("id")
      .eq("workspace_id", parsed.workspaceId)
      .eq("email", normalizedEmail)
      .is("accepted_at", null)
      .is("revoked_at", null)
      .maybeSingle();

    if (existingInviteError) {
      return { data: null, error: existingInviteError.message };
    }
    if (existingInvite) {
      return { data: null, error: "There is already a pending invite for that email." };
    }

    const token = crypto.randomBytes(24).toString("hex");
    const tokenHash = hashInviteToken(token);

    const { data: invite, error } = await adminClient
      .from("workspace_invites")
      .insert({
        workspace_id: parsed.workspaceId,
        email: normalizedEmail,
        role: parsed.role,
        token_hash: tokenHash,
        invited_by_user_id: parsed.invitedByUserId,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select("*")
      .single();

    if (error || !invite) {
      return { data: null, error: error?.message ?? "Could not create invite." };
    }

    return {
      data: { invite: invite as WorkspaceInviteRow, token },
      error: null,
    };
  } catch (err) {
    if (err instanceof ZodError) {
      return { data: null, error: err.issues[0].message };
    }
    throw err;
  }
}

export async function getWorkspaceInviteByToken(
  adminClient: SupabaseClient,
  token: string
): Promise<ServiceResult<(WorkspaceInviteRow & { workspace: WorkspaceRow }) | null>> {
  const { data, error } = await adminClient
    .from("workspace_invites")
    .select(
      "*, workspaces!inner(id, slug, name, owner_user_id, billing_owner_user_id, status, logo_path, created_at, updated_at)"
    )
    .eq("token_hash", hashInviteToken(token))
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: null };

  return {
    data: {
      ...(data as WorkspaceInviteRow),
      workspace: (data.workspaces as WorkspaceRow) ?? null,
    } as WorkspaceInviteRow & { workspace: WorkspaceRow },
    error: null,
  };
}

export async function acceptWorkspaceInvite(
  adminClient: SupabaseClient,
  input: { token: string; userId: string; email: string }
): Promise<ServiceResult<WorkspaceRow>> {
  try {
    const parsed = acceptInviteInput.parse(input);
    const inviteResult = await getWorkspaceInviteByToken(adminClient, parsed.token);

    if (inviteResult.error) {
      return { data: null, error: inviteResult.error };
    }

    const invite = inviteResult.data;
    if (!invite) {
      return { data: null, error: "Invite not found." };
    }
    if (invite.accepted_at) {
      return { data: null, error: "This invite has already been accepted." };
    }
    if (invite.revoked_at) {
      return { data: null, error: "This invite has been revoked." };
    }
    if (new Date(invite.expires_at).getTime() < Date.now()) {
      return { data: null, error: "This invite has expired." };
    }
    if (invite.email.toLowerCase() !== parsed.email.toLowerCase()) {
      return {
        data: null,
        error: `This invite is for ${invite.email}. Sign in with that email to accept it.`,
      };
    }

    const { error: membershipError } = await adminClient
      .from("workspace_memberships")
      .upsert(
        {
          workspace_id: invite.workspace_id,
          user_id: parsed.userId,
          role: invite.role,
          status: "active",
          invited_by_user_id: invite.invited_by_user_id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "workspace_id,user_id" }
      );

    if (membershipError) {
      return { data: null, error: membershipError.message };
    }

    const { error: inviteUpdateError } = await adminClient
      .from("workspace_invites")
      .update({
        accepted_at: new Date().toISOString(),
        accepted_by_user_id: parsed.userId,
      })
      .eq("id", invite.id);

    if (inviteUpdateError) {
      return { data: null, error: inviteUpdateError.message };
    }

    const { data: profile } = await adminClient
      .from("profiles")
      .select("default_workspace_id")
      .eq("user_id", parsed.userId)
      .maybeSingle();

    if (!profile?.default_workspace_id) {
      await setDefaultWorkspaceForUser(adminClient, {
        userId: parsed.userId,
        workspaceId: invite.workspace_id,
      });
    }

    return { data: invite.workspace, error: null };
  } catch (err) {
    if (err instanceof ZodError) {
      return { data: null, error: err.issues[0].message };
    }
    throw err;
  }
}

export async function updateWorkspaceMemberRole(
  adminClient: SupabaseClient,
  input: {
    workspaceId: string;
    membershipId: string;
    actorUserId: string;
    role: "admin" | "member";
  }
): Promise<ServiceResult> {
  try {
    const parsed = updateWorkspaceMemberRoleInput.parse(input);
    const actorResult = await resolveWorkspaceForUser(adminClient, parsed.actorUserId);
    if (actorResult.error) return { data: null, error: actorResult.error };

    const actorMembership = actorResult.data?.memberships.find(
      (membership) => membership.workspace.id === parsed.workspaceId
    );
    if (!actorMembership || actorMembership.role !== "owner") {
      return { data: null, error: "Only the workspace owner can change roles." };
    }

    const { data: targetMembership, error: targetError } = await adminClient
      .from("workspace_memberships")
      .select("*")
      .eq("id", parsed.membershipId)
      .eq("workspace_id", parsed.workspaceId)
      .maybeSingle();

    if (targetError) return { data: null, error: targetError.message };
    if (!targetMembership) {
      return { data: null, error: "Workspace member not found." };
    }
    if (targetMembership.role === "owner") {
      return { data: null, error: "Owner role cannot be changed here." };
    }

    const { error } = await adminClient
      .from("workspace_memberships")
      .update({
        role: parsed.role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.membershipId);

    if (error) return { data: null, error: error.message };
    return { data: null, error: null };
  } catch (err) {
    if (err instanceof ZodError) {
      return { data: null, error: err.issues[0].message };
    }
    throw err;
  }
}

export async function updateWorkspaceName(
  adminClient: SupabaseClient,
  input: { workspaceId: string; actorUserId: string; name: string }
): Promise<ServiceResult<WorkspaceRow>> {
  try {
    const parsed = updateWorkspaceNameInput.parse({
      ...input,
      name: input.name?.trim(),
    });

    const actorResult = await resolveWorkspaceForUser(adminClient, parsed.actorUserId);
    if (actorResult.error) return { data: null, error: actorResult.error };

    const actorMembership = actorResult.data?.memberships.find(
      (membership) => membership.workspace.id === parsed.workspaceId
    );
    if (!actorMembership || !isPrivilegedWorkspaceRole(actorMembership.role)) {
      return { data: null, error: "You are not allowed to edit this workspace." };
    }

    const { data: workspace, error } = await adminClient
      .from("workspaces")
      .update({
        name: parsed.name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.workspaceId)
      .select("*")
      .single();

    if (error || !workspace) {
      return { data: null, error: error?.message ?? "Could not update workspace." };
    }

    return { data: workspace as WorkspaceRow, error: null };
  } catch (err) {
    if (err instanceof ZodError) {
      return { data: null, error: err.issues[0].message };
    }
    throw err;
  }
}

export function getWorkspaceLogoUrl(
  client: SupabaseClient,
  logoPath: string | null
): string | null {
  if (!logoPath) return null;
  const { data } = client.storage
    .from(WORKSPACE_LOGO_BUCKET)
    .getPublicUrl(logoPath);
  return data.publicUrl;
}

export async function uploadWorkspaceLogo(
  adminClient: SupabaseClient,
  input: { workspaceId: string; actorUserId: string; file: File }
): Promise<ServiceResult<{ logoPath: string; logoUrl: string }>> {
  try {
    const parsed = uploadWorkspaceLogoInput.parse(input);

    const actorResult = await resolveWorkspaceForUser(
      adminClient,
      parsed.actorUserId
    );
    if (actorResult.error) return { data: null, error: actorResult.error };

    const actorMembership = actorResult.data?.memberships.find(
      (membership) => membership.workspace.id === parsed.workspaceId
    );
    if (!actorMembership || !isPrivilegedWorkspaceRole(actorMembership.role)) {
      return { data: null, error: "You are not allowed to edit this workspace." };
    }

    const ext = extensionForLogoType(parsed.file.type);
    if (!ext) {
      return { data: null, error: "Logo must be a PNG or JPEG image" };
    }

    const previousPath = actorMembership.workspace.logo_path;
    const objectPath = `${parsed.workspaceId}/logo-${Date.now()}.${ext}`;

    const { error: uploadError } = await adminClient.storage
      .from(WORKSPACE_LOGO_BUCKET)
      .upload(objectPath, parsed.file, {
        contentType: parsed.file.type,
        upsert: true,
      });

    if (uploadError) {
      return { data: null, error: uploadError.message };
    }

    const { data: workspace, error } = await adminClient
      .from("workspaces")
      .update({ logo_path: objectPath, updated_at: new Date().toISOString() })
      .eq("id", parsed.workspaceId)
      .select("*")
      .single();

    if (error || !workspace) {
      // Avoid orphaning the just-uploaded object if the row update failed.
      await adminClient.storage.from(WORKSPACE_LOGO_BUCKET).remove([objectPath]);
      return {
        data: null,
        error: error?.message ?? "Could not update workspace logo.",
      };
    }

    // Best-effort cleanup of the replaced logo.
    if (previousPath && previousPath !== objectPath) {
      await adminClient.storage
        .from(WORKSPACE_LOGO_BUCKET)
        .remove([previousPath]);
    }

    return {
      data: {
        logoPath: objectPath,
        logoUrl: getWorkspaceLogoUrl(adminClient, objectPath) ?? "",
      },
      error: null,
    };
  } catch (err) {
    if (err instanceof ZodError) {
      return { data: null, error: err.issues[0].message };
    }
    throw err;
  }
}

export async function removeWorkspaceLogo(
  adminClient: SupabaseClient,
  input: { workspaceId: string; actorUserId: string }
): Promise<ServiceResult> {
  try {
    const parsed = removeWorkspaceLogoInput.parse(input);

    const actorResult = await resolveWorkspaceForUser(
      adminClient,
      parsed.actorUserId
    );
    if (actorResult.error) return { data: null, error: actorResult.error };

    const actorMembership = actorResult.data?.memberships.find(
      (membership) => membership.workspace.id === parsed.workspaceId
    );
    if (!actorMembership || !isPrivilegedWorkspaceRole(actorMembership.role)) {
      return { data: null, error: "You are not allowed to edit this workspace." };
    }

    const previousPath = actorMembership.workspace.logo_path;

    const { error } = await adminClient
      .from("workspaces")
      .update({ logo_path: null, updated_at: new Date().toISOString() })
      .eq("id", parsed.workspaceId);

    if (error) return { data: null, error: error.message };

    if (previousPath) {
      await adminClient.storage
        .from(WORKSPACE_LOGO_BUCKET)
        .remove([previousPath]);
    }

    return { data: null, error: null };
  } catch (err) {
    if (err instanceof ZodError) {
      return { data: null, error: err.issues[0].message };
    }
    throw err;
  }
}

export async function removeWorkspaceMember(
  adminClient: SupabaseClient,
  input: { workspaceId: string; membershipId: string; actorUserId: string }
): Promise<ServiceResult> {
  try {
    const parsed = removeWorkspaceMemberInput.parse(input);
    const actorResult = await resolveWorkspaceForUser(adminClient, parsed.actorUserId);
    if (actorResult.error) return { data: null, error: actorResult.error };

    const actorMembership = actorResult.data?.memberships.find(
      (membership) => membership.workspace.id === parsed.workspaceId
    );
    if (!actorMembership) {
      return { data: null, error: "Workspace membership not found." };
    }

    const { data: targetMembership, error: targetError } = await adminClient
      .from("workspace_memberships")
      .select("*")
      .eq("id", parsed.membershipId)
      .eq("workspace_id", parsed.workspaceId)
      .maybeSingle();

    if (targetError) return { data: null, error: targetError.message };
    if (!targetMembership) {
      return { data: null, error: "Workspace member not found." };
    }

    const isSelf = targetMembership.user_id === parsed.actorUserId;
    if (
      !canRemoveTarget(
        actorMembership.role,
        targetMembership.role as WorkspaceRole,
        isSelf
      )
    ) {
      return { data: null, error: "You are not allowed to remove that member." };
    }

    const { error } = await adminClient
      .from("workspace_memberships")
      .delete()
      .eq("id", parsed.membershipId);

    if (error) return { data: null, error: error.message };

    if (isSelf) {
      const fallbackMemberships = actorResult.data?.memberships.filter(
        (membership) => membership.id !== parsed.membershipId
      );
      const fallbackWorkspaceId = fallbackMemberships?.[0]?.workspace.id ?? null;
      await adminClient
        .from("profiles")
        .update({
          default_workspace_id: fallbackWorkspaceId,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", parsed.actorUserId);
    }

    return { data: null, error: null };
  } catch (err) {
    if (err instanceof ZodError) {
      return { data: null, error: err.issues[0].message };
    }
    throw err;
  }
}
