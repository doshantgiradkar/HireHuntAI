"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Check, Mail } from "lucide-react";

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <div className="bg-[oklch(0.2_0.016_258)] py-18 sm:py-22 lg:py-24">
      <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:px-6 md:gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <div>
          <h2 className="mb-4 max-w-[20ch] text-3xl font-bold leading-tight text-[oklch(0.94_0.01_255)] sm:text-4xl">Weekly hiring signals, no inbox noise</h2>
          <p className="max-w-[62ch] text-base leading-7 text-[oklch(0.76_0.02_252)] sm:text-lg">
            One concise note each week: new workflow releases, adoption benchmarks, and practical guidance from active recruiting teams.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-[oklch(0.33_0.018_258)] bg-[oklch(0.23_0.014_262)] p-5 sm:p-6 md:p-7 lg:p-6">
          <label htmlFor="newsletter-email" className="mb-3 block text-sm font-medium text-[oklch(0.82_0.015_252)]">
            Work email
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id="newsletter-email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 border-[oklch(0.34_0.022_258)] bg-[oklch(0.24_0.014_262)] text-[oklch(0.92_0.01_252)] placeholder:text-[oklch(0.72_0.018_252)]"
              required
            />
            <Button 
              type="submit" 
              className="min-h-11 min-w-11 bg-[oklch(0.21_0.006_285.885)] text-[oklch(0.985_0_0)] transition-colors hover:bg-[oklch(0.141_0.005_285.823)]"
              disabled={isSubmitted}
            >
              {isSubmitted ? <Check className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
            </Button>
          </div>
          <p className="mt-3 text-xs text-[oklch(0.7_0.014_252)]">No spam, unsubscribe anytime.</p>

          {isSubmitted && (
            <p className="mt-4 font-medium text-[oklch(0.79_0.133_154)]">Thanks for subscribing, check your email for confirmation.</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default NewsletterSection;
