export function WhyQrCodesSection() {
  return (
    <section className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-4xl rounded-3xl border bg-muted/30 p-8 md:p-12">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Why use a starter?</p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Because rebuilding auth, billing, and admin flows for every idea is wasted motion.</h2>
        <div className="mt-6 space-y-4 text-muted-foreground">
          <p>
            Most SaaS products need the same baseline infrastructure: authentication, account management, subscription handling, and a secure app shell.
          </p>
          <p>
            LaunchKit gives you that baseline in a form that is easy to extend. Keep the architecture, rewrite the product layer, and ship faster with less repetitive setup work.
          </p>
        </div>
      </div>
    </section>
  );
}
