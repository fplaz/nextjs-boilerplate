import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  resolveWorkspaceForUser,
  type ResolvedWorkspace,
} from "@/domain/workspaces/workspace.service";

export async function requireCurrentWorkspace(
  _supabase: SupabaseClient,
  userId: string,
  slug?: string
): Promise<ResolvedWorkspace> {
  const adminClient = createAdminClient();
  const result = await resolveWorkspaceForUser(adminClient, userId, slug);

  if (result.error || !result.data) {
    redirect("/account?error=No workspace found");
  }

  return result.data;
}
