import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { type ReactNode } from "react";

export type BillingInterval = "monthly" | "yearly";

export interface Plan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  highlighted: boolean;
  features: string[];
  priceKey: "basic" | "growth" | "pro";
}

export const plans: Plan[] = [
  {
    name: "Basic",
    monthlyPrice: 9.99,
    yearlyPrice: 99.9,
    highlighted: false,
    features: [
      "1 workspace",
      "Unlimited scans",
      "Core app features",
      "Usage insights",
      "Priority onboarding",
    ],
    priceKey: "basic",
  },
  {
    name: "Growth",
    monthlyPrice: 14.99,
    yearlyPrice: 149.9,
    highlighted: true,
    features: [
      "5 workspaces",
      "Unlimited scans",
      "Core app features",
      "Usage insights",
      "Priority onboarding",
    ],
    priceKey: "growth",
  },
  {
    name: "Professional",
    monthlyPrice: 29.99,
    yearlyPrice: 299.9,
    highlighted: false,
    features: [
      "Unlimited workspaces",
      "Unlimited scans",
      "Core app features",
      "Usage insights",
      "Priority onboarding",
      "Priority support",
    ],
    priceKey: "pro",
  },
];

export function BillingIntervalTabs({
  interval,
  onIntervalChange,
}: {
  interval: BillingInterval;
  onIntervalChange: (interval: BillingInterval) => void;
}) {
  return (
    <Tabs
      value={interval}
      onValueChange={(v) => onIntervalChange(v as BillingInterval)}
    >
      <TabsList>
        <TabsTrigger value="monthly">Monthly</TabsTrigger>
        <TabsTrigger value="yearly">
          Yearly
          <Badge variant="secondary" className="ml-2 text-xs">
            Save 2 months
          </Badge>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export function PlanCard({
  plan,
  interval,
  action,
}: {
  plan: Plan;
  interval: BillingInterval;
  action: ReactNode;
}) {
  const price =
    interval === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

  return (
    <Card
      className={`flex flex-col ${plan.highlighted ? "border-primary" : ""}`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {plan.name}
          {plan.highlighted && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
              Recommended
            </span>
          )}
        </CardTitle>
        <div className="mt-2">
          <span className="text-3xl font-bold">${price.toFixed(2)}</span>
          <span className="text-muted-foreground">
            /{interval === "monthly" ? "mo" : "yr"}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <ul className="space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              {feature}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-6">{action}</div>
      </CardContent>
    </Card>
  );
}
