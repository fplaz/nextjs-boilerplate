import { BadgeCheck, CreditCard, Lock, Settings2, Sparkles, Users } from "lucide-react";

const modules = [
  { title: "Authentication", description: "Email, password, and magic-link flows.", icon: Lock },
  { title: "Billing", description: "Trials, plans, and subscription state handling.", icon: CreditCard },
  { title: "Admin", description: "User, trial, and subscription oversight screens.", icon: Users },
  { title: "Settings", description: "Account management and profile workflows.", icon: Settings2 },
  { title: "Polish", description: "Toasts, validation, and reusable UI primitives.", icon: Sparkles },
  { title: "Production basics", description: "Route protection, role checks, and environment scaffolding.", icon: BadgeCheck },
];

export function QrTypesSection() {
  return (
    <section className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Starter modules</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Swap the product layer, keep the foundation</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            LaunchKit is designed to be re-skinned and repurposed. These are the core pieces you can reuse across products.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {modules.map(({ title, description, icon: Icon }) => (
            <div key={title} className="rounded-2xl border bg-background p-6 shadow-sm">
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
