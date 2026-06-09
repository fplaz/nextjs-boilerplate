import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Rocket } from "lucide-react";

export function GetStartedHero({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className="px-4 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.2fr,0.8fr] md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground">
            <Rocket className="h-4 w-4 text-primary" />
            Reusable SaaS foundation for your next product
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl">
            Ship the boring SaaS parts once. Reuse them everywhere.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            LaunchKit gives you auth, onboarding, billing, admin workflows, and a clean app shell so you can focus on the product you actually want to build.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
                {isAuthenticated ? "Open dashboard" : "Start free"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#features">Explore features</a>
            </Button>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Auth & sessions</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Billing & trials</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Admin tooling</div>
          </div>
        </div>

        <div className="rounded-2xl border bg-muted/30 p-6 shadow-sm">
          <div className="rounded-xl border bg-background p-5">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="text-sm font-medium">Launch checklist</p>
                <p className="text-sm text-muted-foreground">What you already get out of the box</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Starter-ready</span>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                "Email + password and magic-link authentication",
                "Protected app routes and account settings",
                "Trial and subscription management with Paddle",
                "Admin screens for users, trials, and subscriptions",
                "Reusable UI primitives, tests, and Supabase scaffolding",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
