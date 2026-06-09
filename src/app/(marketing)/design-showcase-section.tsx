import { CheckSquare, Database, Mail, PanelsTopLeft } from "lucide-react";

const items = [
  {
    title: "Structured domain layer",
    description: "Validation, services, and thin actions keep business logic out of UI code.",
    icon: Database,
  },
  {
    title: "Polished onboarding screens",
    description: "Signup, login, password recovery, and account settings are already implemented.",
    icon: PanelsTopLeft,
  },
  {
    title: "Email-ready workflows",
    description: "Template scaffolding and mail delivery hooks make transactional email easier to ship.",
    icon: Mail,
  },
  {
    title: "Pragmatic testing setup",
    description: "Vitest, Testing Library, and predictable file structure are already in place.",
    icon: CheckSquare,
  },
];

export function DesignShowcaseSection() {
  return (
    <section className="bg-muted/30 px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">A starter kit that stays maintainable as you customize it</h2>
          <p className="mt-4 text-muted-foreground">
            Use the starter as a baseline, not a trap. The architecture stays readable as your actual product grows.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {items.map(({ title, description, icon: Icon }) => (
            <div key={title} className="rounded-2xl border bg-background p-6 shadow-sm">
              <Icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
