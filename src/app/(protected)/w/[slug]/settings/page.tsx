import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireCurrentWorkspace } from "@/lib/current-workspace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function WorkspaceSettingsPage({
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
      <div>
        <Link
          href={`/w/${slug}/dashboard`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to workspace
        </Link>
        <h1 className="mt-2 text-3xl font-bold">Workspace Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Review identity and ownership details for this workspace.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace details</CardTitle>
          <CardDescription>Workspace slugs now live outside of user profiles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{workspace.current.workspace.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Slug</span>
            <span className="font-mono">{workspace.current.workspace.slug}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Your role</span>
            <span className="font-medium capitalize">{workspace.current.role}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
