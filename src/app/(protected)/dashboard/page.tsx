import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserBillingState } from "@/domain/subscriptions/subscriptions.service";
import { getUserRole } from "@/domain/auth/auth.service";
import { ArrowRight, CreditCard, Settings, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardToast } from "./dashboard-toast";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [billingStateResult, roleResult] = await Promise.all([
    getUserBillingState(supabase, user!.id),
    getUserRole(supabase, user!.id),
  ]);

  const billingState = billingStateResult.data ?? {
    status: "none" as const,
    trialEnd: null,
    planName: null,
  };
  const isAdmin = roleResult.data === "admin";

  const quickLinks = [
    {
      title: "Account settings",
      description: "Update your profile, email, and password.",
      href: "/account",
      icon: Settings,
    },
    {
      title: "Billing",
      description: "Review your plan, trial, and subscription status.",
      href: "/billing",
      icon: CreditCard,
    },
    ...(isAdmin
      ? [
          {
            title: "Admin area",
            description: "Inspect users, subscriptions, and trial records.",
            href: "/admin",
            icon: Users,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-8">
      <DashboardToast />

      <section className="rounded-3xl border bg-muted/30 p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Your starter kit is ready to customize</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              LaunchKit is now acting as a generic SaaS foundation. Use this area as the entry point for your product-specific workflows.
            </p>
          </div>
          <Button asChild>
            <Link href="/account">
              Open account settings
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Plan status</CardTitle>
            <CardDescription>Your current billing state</CardDescription>
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
            <CardTitle>Included foundation</CardTitle>
            <CardDescription>Core product scaffolding already in place</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Protected auth flows</div>
            <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Trials and billing screens</div>
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Reusable UI + validation setup</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suggested next steps</CardTitle>
            <CardDescription>Turn the starter into your actual product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Define your domain models and replace the placeholder dashboard widgets.</p>
            <p>Customize pricing and onboarding copy for your niche.</p>
            <p>Keep the auth, billing, admin, and account flows as your reusable base.</p>
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
