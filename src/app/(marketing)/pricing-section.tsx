"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  plans,
  PlanCard,
  BillingIntervalTabs,
  type BillingInterval,
} from "@/components/pricing-plans";

export function PricingSection() {
  const [interval, setInterval] = useState<BillingInterval>("monthly");

  return (
    <section id="pricing" className="bg-muted/40 px-4 py-10 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold">
          Simple, transparent pricing
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Start for free, upgrade when you need more
        </p>

        <div className="mt-8 flex justify-center">
          <BillingIntervalTabs
            interval={interval}
            onIntervalChange={setInterval}
          />
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.name}
              plan={plan}
              interval={interval}
              action={
                <>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/signup">Start for free</Link>
                  </Button>
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    No credit card required
                  </p>
                </>
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
