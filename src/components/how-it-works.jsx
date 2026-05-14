"use client";

import { Brain, Calendar, UserCheck } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: <UserCheck className="h-8 w-8" />,
      title: "Capture role intent",
      description: "Upload the brief once, then lock interview criteria before review starts."
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Review ranked candidates",
      description: "See role-fit evidence, compare top matches, and approve your shortlist."
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Launch interview loop",
      description: "Send slots, confirm interviewers, and keep every participant in sync."
    },
  ];

  return (
    <div className="bg-[oklch(0.19_0.016_194)] py-18 sm:py-22 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-14">
          <h2 className="mb-4 text-3xl font-bold text-[oklch(0.94_0.01_255)] sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-[oklch(0.76_0.02_252)]">
            One operating flow from intake to confirmed interviews.
          </p>
        </div>

        <div className="grid gap-6 md:gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <aside className="rounded-2xl border border-[oklch(0.33_0.014_258)] bg-[oklch(0.22_0.015_262)] p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-[oklch(0.74_0.03_184)]">Expected outcome</p>
            <p className="mb-4 text-2xl font-semibold leading-tight text-[oklch(0.93_0.012_252)]">From approved role brief to first interview day in under a week.</p>
            <p className="text-sm leading-6 text-[oklch(0.75_0.016_252)]">Every handoff stays in one place, so the team spends less time coordinating status and more time making hiring decisions.</p>
          </aside>

          <div className="space-y-3 md:space-y-4">
            {steps.map((step, index) => (
              <article key={index} className="grid gap-4 rounded-2xl border border-[oklch(0.31_0.012_260)] bg-[oklch(0.21_0.013_262)] p-5 sm:grid-cols-[auto_1fr] sm:items-start">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[oklch(0.34_0.024_258)] bg-[oklch(0.24_0.016_262)] text-[oklch(0.84_0.02_246)]">
                    {step.icon}
                  </div>
                  <span className="text-sm font-semibold text-[oklch(0.78_0.06_184)]">Step {index + 1}</span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-[oklch(0.92_0.01_255)]">{step.title}</h3>
                  <p className="text-base leading-7 text-[oklch(0.76_0.02_252)]">{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HowItWorksSection;
