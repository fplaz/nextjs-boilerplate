import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CreditCard, Settings, ShieldCheck, Sparkles, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireCurrentWorkspace } from "@/lib/current-workspace";
import { getWorkspaceBillingState } from "@/domain/subscriptions/subscriptions.service";
import { getUserRole } from "@/domain/auth/auth.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [billingStateResult, roleResult] = await Promise.all([
    getWorkspaceBillingState(supabase, workspace.current.workspace.id),
    getUserRole(supabase, user.id),
  ]);

  const billingState = billingStateResult.data ?? {
    status: "none" as const,
    trialEnd: null,
    planName: null,
  };
  const isPlatformAdmin = roleResult.data === "admin";

  const quickLinks = [
    {
      title: "Members",
      description: "Invite teammates, update roles, and remove access.",
      href: `/w/${slug}/members`,
      icon: Users,
    },
    {
      title: "Billing",
      description: "Review your workspace trial and subscription status.",
      href: `/w/${slug}/billing`,
      icon: CreditCard,
    },
    {
      title: "Workspace settings",
      description: "Review workspace identity and ownership details.",
      href: `/w/${slug}/settings`,
      icon: Settings,
    },
    ...(isPlatformAdmin
      ? [
          {
            title: "Admin area",
            description: "Inspect users, workspaces, subscriptions, and trials.",
            href: "/admin",
            icon: ShieldCheck,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-8">
      <FormMessage />

      <section className="rounded-3xl border bg-muted/30 p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Workspace Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              {workspace.current.workspace.name}
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              This workspace is now the unit of collaboration, billing, and access
              control in LaunchKit.
            </p>
          </div>
          <Button asChild>
            <Link href={`/w/${slug}/members`}>
              Manage members
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Plan status</CardTitle>
            <CardDescription>Your current workspace billing state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium capitalize">{billingState.status}</span></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Plan</span><span className="font-medium">{billingState.planName ?? "No active plan"}</span></div>
            {billingState.trialEnd && (
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Trial ends</span><span className="font-medium">{new Date(billingState.trialEnd).toLocaleDateString()}</span></div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workspace scope</CardTitle>
            <CardDescription>What changed with the multi-user model</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Memberships and invites are workspace-owned</div>
            <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Billing and trials now belong to the workspace</div>
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Personal profile settings stay user-scoped</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current role</CardTitle>
            <CardDescription>Your access inside this workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              You are currently an{" "}
              <span className="font-medium capitalize text-foreground">
                {workspace.current.role}
              </span>
              .
            </p>
            <p>Use the workspace switcher in the nav if you belong to more than one team.</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {quickLinks.map(({ title, description, href, icon: Icon }) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Icon className="h-5 w-5 text-primary" /> {title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href={href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
