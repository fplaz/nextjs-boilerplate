import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const items = [
  {
    question: "What is LaunchKit?",
    answer:
      "LaunchKit is a generic SaaS starter built with Next.js, Supabase, billing flows, admin tools, and a reusable UI layer.",
  },
  {
    question: "What parts are production-ready?",
    answer:
      "Authentication, protected routing, account settings, billing UI, trial/subscription handling, admin screens, and the app shell are already wired.",
  },
  {
    question: "Can I replace the product-specific parts?",
    answer:
      "Yes. The starter is meant to be adapted. Swap landing-page copy, dashboard workflows, and domain models for your own product.",
  },
  {
    question: "Does it include billing?",
    answer:
      "Yes. The starter includes plan presentation, checkout hooks, subscription states, and trial-aware billing UI.",
  },
  {
    question: "Does it use Supabase?",
    answer:
      "Yes. Supabase is used for authentication, database access, and server/client helpers across the app.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="bg-muted/30 px-4 py-16 md:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Frequently asked questions</h2>
          <p className="mt-4 text-muted-foreground">The quick answers before you start customizing the starter.</p>
        </div>
        <Accordion type="single" collapsible className="mt-10 rounded-2xl border bg-background px-6">
          {items.map((item, index) => (
            <AccordionItem key={item.question} value={`item-${index}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
