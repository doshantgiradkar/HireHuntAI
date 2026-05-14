"use client";

import { useState } from "react";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Check } from "lucide-react";
import { Button } from "./ui/button";

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  
  const plans = [
    {
      name: "Starter",
      monthlyPrice: 29,
      annualPrice: 290,
      description: "Perfect for small teams getting started",
      features: ["Up to 50 interviews/month", "Basic AI matching", "Email support", "Standard templates"]
    },
    {
      name: "Professional",
      monthlyPrice: 99,
      annualPrice: 990,
      description: "Ideal for growing companies",
      features: ["Up to 200 interviews/month", "Advanced AI matching", "Priority support", "Custom templates", "Analytics dashboard"],
      popular: true
    },
    {
      name: "Enterprise",
      monthlyPrice: 299,
      annualPrice: 2990,
      description: "For large organizations",
      features: ["Unlimited interviews", "Custom AI training", "24/7 dedicated support", "White-label solution", "Advanced integrations"]
    }
  ];

  const featuredPlan = plans.find((plan) => plan.popular);
  const supportPlans = plans.filter((plan) => !plan.popular);

  return (
    <div className="bg-[oklch(0.2_0.016_258)] py-18 sm:py-22 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid gap-6 sm:mb-14 lg:mb-16 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-[46ch]">
            <h2 className="mb-3 text-3xl font-bold text-[oklch(0.94_0.01_255)] sm:text-4xl">
              Choose Your Plan
            </h2>
            <p className="text-lg text-[oklch(0.76_0.02_252)] sm:text-xl">
              Start free, then choose a plan that scales with your hiring needs.
            </p>
          </div>

          <div className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-[oklch(0.31_0.012_260)] bg-[oklch(0.22_0.012_262)] px-4 py-3 sm:w-auto">
            <Label htmlFor="pricing-toggle" className="text-[oklch(0.74_0.016_252)]">Monthly</Label>
            <Switch id="pricing-toggle" checked={isAnnual} onCheckedChange={setIsAnnual} />
            <Label htmlFor="pricing-toggle" className="text-[oklch(0.74_0.016_252)]">Annual</Label>
            <Badge variant="secondary">Save 20%</Badge>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl gap-5 md:gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          {featuredPlan && (
            <Card className="border-[oklch(0.31_0.012_260)] bg-[oklch(0.22_0.012_262)] p-5 sm:p-6">
              <div className="grid gap-5 md:grid-cols-2 md:gap-6">
                <CardHeader className="p-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge className="bg-[oklch(0.23_0.07_259)] text-[oklch(0.97_0.003_286)]">Most selected by growing teams</Badge>
                    <span className="text-xs font-medium text-[oklch(0.72_0.014_252)]">No long-term contract</span>
                  </div>
                  <CardTitle className="text-4xl font-bold text-[oklch(0.94_0.01_255)]">{featuredPlan.name}</CardTitle>
                  <p className="mt-2 text-lg font-bold text-[oklch(0.86_0.01_252)]">
                    ${isAnnual ? featuredPlan.annualPrice : featuredPlan.monthlyPrice}
                    <span className="font-normal text-[oklch(0.72_0.014_252)]">/{isAnnual ? "year" : "month"}</span>
                  </p>
                  <CardDescription className="mt-3 max-w-[42ch] text-[oklch(0.76_0.016_252)]">{featuredPlan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col p-0">
                  <ul className="mb-5 grid gap-3">
                  {featuredPlan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="text-[oklch(0.8_0.012_252)]">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-col gap-3 pt-1">
                  <p className="text-sm text-[oklch(0.74_0.016_252)]">Includes analytics dashboard and priority support.</p>
                  <Button className="w-full bg-[oklch(0.23_0.07_259)] text-[oklch(0.97_0.003_286)] hover:bg-[oklch(0.2_0.065_259)]">Choose {featuredPlan.name}</Button>
                </div>
                </CardContent>
              </div>
            </Card>
          )}

          <aside className="rounded-2xl border border-[oklch(0.31_0.012_260)] bg-[oklch(0.22_0.012_262)] p-5 sm:p-6 lg:sticky lg:top-24 lg:self-start">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-[oklch(0.75_0.03_184)]">Also available</p>
            <div className="divide-y divide-[oklch(0.31_0.012_260)]">
              {supportPlans.map((plan, index) => (
                <div key={index} className="py-4 first:pt-0 last:pb-0">
                  <div className="mb-1 flex items-end justify-between gap-3">
                    <CardTitle className="text-lg font-semibold text-[oklch(0.92_0.01_255)]">{plan.name}</CardTitle>
                    <p className="text-sm font-semibold text-[oklch(0.86_0.01_252)]">
                      ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                      <span className="font-normal text-[oklch(0.72_0.014_252)]">/{isAnnual ? "year" : "month"}</span>
                    </p>
                  </div>
                  <CardDescription className="mb-3 text-[oklch(0.74_0.016_252)]">{plan.description}</CardDescription>
                  <p className="text-sm text-[oklch(0.78_0.012_252)]">{plan.features[0]}</p>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-5 w-full border-[oklch(0.34_0.02_258)] bg-transparent text-[oklch(0.88_0.01_252)] hover:bg-[oklch(0.24_0.012_262)]">
              Compare all plans
            </Button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
