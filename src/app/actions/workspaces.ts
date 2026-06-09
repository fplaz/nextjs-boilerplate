"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  acceptWorkspaceInvite,
  createWorkspaceInvite,
  removeWorkspaceMember,
  resolveWorkspaceForUser,
  updateWorkspaceMemberRole,
} from "@/domain/workspaces/workspace.service";
import { sendWorkspaceInviteEmail } from "@/domain/email/email.service";

function workspaceRedirect(
  slug: string,
  pathname: string,
  params: Record<string, string>
) {
  const search = new URLSearchParams(params);
  redirect(`/w/${slug}/${pathname}?${search.toString()}`);
}

export async function inviteWorkspaceMemberAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const workspaceSlug = formData.get("workspace_slug") as string;
  const adminClient = createAdminClient();
  const workspaceResult = await resolveWorkspaceForUser(
    adminClient,
    user.id,
    workspaceSlug
  );

  if (workspaceResult.error || !workspaceResult.data) {
    workspaceRedirect(workspaceSlug, "members", {
      error: workspaceResult.error ?? "Workspace not found.",
    });
  }

  const current = workspaceResult.data!.current;
  const inviteResult = await createWorkspaceInvite(adminClient, {
    workspaceId: current.workspace.id,
    email: formData.get("email") as string,
    role: formData.get("role") as "admin" | "member",
    invitedByUserId: user.id,
  });

  if (inviteResult.error || !inviteResult.data) {
    workspaceRedirect(workspaceSlug, "members", {
      error: inviteResult.error ?? "Could not create invite.",
    });
  }

  const inviteData = inviteResult.data!;
  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/invite/accept?token=${inviteData.token}`;
  await sendWorkspaceInviteEmail({
    email: inviteData.invite.email,
    inviterEmail: user.email ?? "A teammate",
    workspaceName: current.workspace.name,
    inviteUrl,
  });

  workspaceRedirect(workspaceSlug, "members", {
    message: `Invite sent to ${inviteData.invite.email}`,
  });
}

export async function acceptWorkspaceInviteAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const token = formData.get("token") as string;
  const adminClient = createAdminClient();
  const inviteResult = await acceptWorkspaceInvite(adminClient, {
    token,
    userId: user.id,
    email: user.email ?? "",
  });

  if (inviteResult.error || !inviteResult.data) {
    redirect(
      `/invite/accept?token=${encodeURIComponent(token)}&error=${encodeURIComponent(
        inviteResult.error ?? "Could not accept invite."
      )}`
    );
  }

  redirect(`/w/${inviteResult.data!.slug}/dashboard?message=Invite%20accepted`);
}

export async function updateWorkspaceMemberRoleAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const workspaceSlug = formData.get("workspace_slug") as string;
  const adminClient = createAdminClient();
  const workspaceResult = await resolveWorkspaceForUser(
    adminClient,
    user.id,
    workspaceSlug
  );

  if (workspaceResult.error || !workspaceResult.data) {
    workspaceRedirect(workspaceSlug, "members", {
      error: workspaceResult.error ?? "Workspace not found.",
    });
  }

  const result = await updateWorkspaceMemberRole(adminClient, {
    workspaceId: workspaceResult.data!.current.workspace.id,
    membershipId: formData.get("membership_id") as string,
    actorUserId: user.id,
    role: formData.get("role") as "admin" | "member",
  });

  if (result.error) {
    workspaceRedirect(workspaceSlug, "members", { error: result.error });
  }

  workspaceRedirect(workspaceSlug, "members", { message: "Member role updated" });
}

export async function removeWorkspaceMemberAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const workspaceSlug = formData.get("workspace_slug") as string;
  const adminClient = createAdminClient();
  const workspaceResult = await resolveWorkspaceForUser(
    adminClient,
    user.id,
    workspaceSlug
  );

  if (workspaceResult.error || !workspaceResult.data) {
    workspaceRedirect(workspaceSlug, "members", {
      error: workspaceResult.error ?? "Workspace not found.",
    });
  }

  const result = await removeWorkspaceMember(adminClient, {
    workspaceId: workspaceResult.data!.current.workspace.id,
    membershipId: formData.get("membership_id") as string,
    actorUserId: user.id,
  });

  if (result.error) {
    workspaceRedirect(workspaceSlug, "members", { error: result.error });
  }

  const remainingWorkspace = await resolveWorkspaceForUser(adminClient, user.id);
  if (remainingWorkspace.data) {
    redirect(
      `/w/${remainingWorkspace.data.current.workspace.slug}/dashboard?message=${encodeURIComponent(
        "Member removed"
      )}`
    );
  }

  redirect(`/account?message=${encodeURIComponent("Member removed")}`);
}
