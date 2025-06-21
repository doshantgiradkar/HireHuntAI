"use-client";

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

  return (
    <div className="py-20 sm:py-24 bg-slate-50 dark:bg-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
            Start free, then choose a plan that scales with your hiring needs.
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Label htmlFor="pricing-toggle" className="text-slate-600 dark:text-slate-300">
              Monthly
            </Label>
            <Switch
              id="pricing-toggle"
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
            />
            <Label htmlFor="pricing-toggle" className="text-slate-600 dark:text-slate-300">
              Annual
            </Label>
            <Badge variant="secondary" className="ml-2">Save 20%</Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-blue-600 scale-105' : ''} transition-all duration-300 hover:shadow-xl`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                  {plan.name}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    /{isAnnual ? 'year' : 'month'}
                  </span>
                </div>
                <CardDescription className="mt-4">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}>
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingSection;