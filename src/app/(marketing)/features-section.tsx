import { CreditCard, LayoutDashboard, ShieldCheck, Users } from "lucide-react";

const features = [
  {
    title: "Authentication flows",
    description: "Email/password, magic links, password recovery, and protected routes are already wired.",
    icon: ShieldCheck,
  },
  {
    title: "Billing foundation",
    description: "Trials, subscriptions, pricing tables, and billing-state UI give you a clean monetization base.",
    icon: CreditCard,
  },
  {
    title: "Admin tooling",
    description: "Review users, trials, and subscriptions from a built-in admin area without bolting one on later.",
    icon: Users,
  },
  {
    title: "App shell included",
    description: "A dashboard, account settings, navigation, toast flows, and reusable components are ready to extend.",
    icon: LayoutDashboard,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Everything you need to start from a real SaaS baseline</h2>
          <p className="mt-4 text-muted-foreground">
            LaunchKit is not a toy landing page. It gives you the foundation most products rebuild over and over.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map(({ title, description, icon: Icon }) => (
            <div key={title} className="rounded-2xl border bg-background p-6 shadow-sm">
              <Icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
