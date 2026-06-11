import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireCurrentWorkspace } from "@/lib/current-workspace";

export default async function BillingRedirectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const workspace = await requireCurrentWorkspace(supabase, user.id);
  redirect(`/w/${workspace.current.workspace.slug}/settings?tab=billing`);
}
