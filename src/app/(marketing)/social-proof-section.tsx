const quotes = [
  {
    quote:
      "This starter gives you the boring but critical SaaS pieces up front, so you can spend time on the actual differentiator.",
    author: "Indie founder",
  },
  {
    quote:
      "The structure is pragmatic: auth, billing, admin, and account flows are already present without feeling over-engineered.",
    author: "Product engineer",
  },
  {
    quote:
      "Perfect as a base repo when you want to validate an idea quickly but still keep production-minded patterns.",
    author: "Technical operator",
  },
];

export function SocialProofSection() {
  return (
    <section className="bg-muted/30 px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Built for teams that want to move fast without starting messy</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            A good starter should reduce setup drag, not create a giant framework you have to fight.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {quotes.map((item) => (
            <blockquote key={item.author} className="rounded-2xl border bg-background p-6 shadow-sm">
              <p className="text-sm leading-6 text-foreground">“{item.quote}”</p>
              <footer className="mt-4 text-sm font-medium text-muted-foreground">{item.author}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
