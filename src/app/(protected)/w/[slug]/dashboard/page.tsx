import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireCurrentWorkspace } from "@/lib/current-workspace";
import { FormMessage } from "@/components/form-message";

export default async function WorkspaceDashboardPage({
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

  return (
    <div className="space-y-8">
      <FormMessage />

      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-dashed bg-muted/20 p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">
          {workspace.current.workspace.name}
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          This is your blank canvas. LaunchKit handles auth, workspaces, members,
          and billing — start building your product right here.
        </p>
      </div>
    </div>
  );
}
