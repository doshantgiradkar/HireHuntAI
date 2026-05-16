"use client";

import NewsletterSection from "@/components/newsletter-section";
import StickyCTA from "@/components/sticky-cta";
import {
  ArrowRight,
  Brain,
  Clock,
  Menu,
  Shield,
  SparklesIcon,
  X,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import AnimatedCounter from "@/components/animated-counter";
import HowItWorksSection from "@/components/how-it-works";
import TestimonialCarousel from "@/components/testimonial-carousel";
import PricingSection from "@/components/pricing-section";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/footer";
import { Search } from "lucide-react";

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const features = [
    {
      icon: <Brain className="h-8 w-8 text-[oklch(0.48_0.115_258)]" />,
      title: "AI shortlisting",
      description: "Rank candidates fast using skill and role-fit signals.",
      detail:
        "Auto-scored summaries surface role-fit evidence first, so recruiters can decide in minutes instead of deep-reading every profile.",
    },
    {
      icon: <Clock className="h-8 w-8 text-[oklch(0.56_0.106_196)]" />,
      title: "Live scheduling",
      description:
        "Coordinate interviews across calendars with fewer back-and-forth loops.",
    },
    {
      icon: <Shield className="h-8 w-8 text-[oklch(0.62_0.148_74)]" />,
      title: "Secure hiring ops",
      description:
        "Run recruiting workflows with enterprise-grade controls and auditability.",
    },
  ];

  const stats = [
    { value: "500+", label: "Hiring teams onboarded" },
    { value: "50K+", label: "Interviews completed" },
    { value: "95%", label: "Workflow completion" },
    { value: "5 min", label: "To first shortlist" },
  ];

  if (!hasMounted) {
    return null;
  }

  return (
    <div className="min-h-screen scroll-smooth bg-[oklch(0.18_0.012_262)] font-kerning-normal text-[oklch(0.92_0.009_255)]">
      <nav className="fixed w-full z-40 border-b border-[oklch(0.31_0.016_260)] bg-[oklch(0.21_0.014_262/0.96)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-2">
              {/* <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[oklch(0.35_0.02_258)] bg-[oklch(0.24_0.018_262)]">
                <Search className="h-5 w-5 text-[oklch(0.84_0.02_246)]" />
              </div>*/}
              <span className="text-xl font-bold text-[oklch(0.94_0.01_255)]">
                HireHunt AI
              </span>
            </div>

            <div className="hidden items-center space-x-8 md:flex">
              <a
                href="#features"
                className="rounded-sm text-sm font-medium tracking-[0.01em] text-[oklch(0.74_0.02_250)] transition-colors hover:text-[oklch(0.92_0.014_252)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.705_0.015_286.067)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.2_0.016_262)]"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="rounded-sm text-sm font-medium tracking-[0.01em] text-[oklch(0.74_0.02_250)] transition-colors hover:text-[oklch(0.92_0.014_252)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.705_0.015_286.067)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.2_0.016_262)]"
              >
                Pricing
              </a>
              <a
                href="#how-it-works"
                className="rounded-sm text-sm font-medium tracking-[0.01em] text-[oklch(0.74_0.02_250)] transition-colors hover:text-[oklch(0.92_0.014_252)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.705_0.015_286.067)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.2_0.016_262)]"
              >
                How it works
              </a>
              <Button
                className="bg-[oklch(0.62_0.12_252)] text-[oklch(0.2_0.014_262)] hover:bg-[oklch(0.56_0.116_252)]"
                onClick={() => router.push("/sign-in")}
              >
                Sign in
              </Button>
            </div>

            <button
              className="min-h-11 min-w-11 rounded-md p-2 text-[oklch(0.76_0.02_252)] md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {isMenuOpen && (
            <div className="space-y-4 border-t border-[oklch(0.32_0.022_258)] py-4 md:hidden">
              <a
                href="#features"
                className="block rounded-sm text-[oklch(0.74_0.02_250)] hover:text-[oklch(0.92_0.014_252)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.705_0.015_286.067)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.2_0.016_262)]"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="block rounded-sm text-[oklch(0.74_0.02_250)] hover:text-[oklch(0.92_0.014_252)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.705_0.015_286.067)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.2_0.016_262)]"
              >
                Pricing
              </a>
              <a
                href="#how-it-works"
                className="block rounded-sm text-[oklch(0.74_0.02_250)] hover:text-[oklch(0.92_0.014_252)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.705_0.015_286.067)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.2_0.016_262)]"
              >
                How it works
              </a>
              <div className="flex flex-col space-y-2 pt-4">
                <Button
                  className="w-full bg-[oklch(0.62_0.12_252)] text-[oklch(0.2_0.014_262)] hover:bg-[oklch(0.56_0.116_252)]"
                  onClick={() => router.push("/sign-in")}
                >
                  Sign in
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-x-0 top-0 h-72 bg-linear-to-b from-[oklch(0.26_0.015_286/0.4)] to-transparent" />
          <div className="absolute -left-28 top-24 h-72 w-72 rounded-full bg-[oklch(0.49_0.05_184/0.12)] blur-3xl" />
          <div className="absolute -right-24 top-32 h-64 w-64 rounded-full bg-[oklch(0.55_0.055_41/0.1)] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-9xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <section className="mx-auto max-w-[86ch] text-center">
            <Badge
              variant="secondary"
              className="mb-7 inline-flex items-center rounded-full border border-[oklch(0.44_0.06_84)] bg-[oklch(0.26_0.03_84)] px-5 py-2.5 text-sm font-medium text-[oklch(0.85_0.03_88)]"
            >
              <Zap className="mr-2 h-4 w-4 text-[oklch(0.77_0.09_84)]" />
              <span>Streamline your hiring!</span>
            </Badge>

            <h1 className="mx-auto mb-6 max-w-[24ch] text-4xl font-semibold leading-[1.06] tracking-tight text-[oklch(0.94_0.01_252)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom motion-safe:duration-500 sm:text-6xl lg:text-7xl">
              Build qualified interview slates before the day gets away
            </h1>

            <p className="mx-auto mb-8 max-w-[66ch] text-base leading-7 text-[oklch(0.77_0.014_252)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom motion-safe:duration-500 motion-safe:delay-100 sm:text-xl sm:leading-8">
              Start from one approved role brief, review ranked candidates, and
              send interview slots in a single recruiter workflow. Fast enough
              for daily hiring operations, controlled enough for enterprise
              teams.
            </p>

            <p className="mx-auto mb-8 max-w-[58ch] text-sm leading-6 text-[oklch(0.73_0.014_252)]">
              Best for recruiter operations leads and hiring managers running
              active pipelines.
            </p>

            <div className="mb-12 flex flex-row items-stretch justify-center gap-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom motion-safe:duration-700 motion-safe:delay-300 sm:flex-row sm:flex-wrap sm:items-center">
              <Button
                size="lg"
                className="group w-full bg-[oklch(0.58_0.09_252)] px-8 py-4 text-lg font-semibold text-[oklch(0.2_0.014_262)] transition-colors duration-200 hover:bg-[oklch(0.54_0.086_252)] focus-visible:ring-2 focus-visible:ring-[oklch(0.66_0.012_286)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.18_0.012_262)] sm:w-auto"
                onClick={() => router.push("/sign-in")}
              >
                Begin Onboarding
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <a
                href="#features"
                className="text-center text-sm font-medium text-[oklch(0.76_0.016_252)] underline underline-offset-4 hover:text-[oklch(0.86_0.012_252)] sm:text-left"
              >
                Review capabilities first
              </a>
            </div>

            <div className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-3 border-t border-[oklch(0.31_0.012_260)] pt-7 tabular-nums md:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-[oklch(0.31_0.012_260)] bg-[oklch(0.22_0.012_262)] px-3 py-4 text-center"
                >
                  <AnimatedCounter end={stat.value} />
                  <div className="text-sm leading-6 text-[oklch(0.73_0.024_252)]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div
        id="features"
        className="bg-[oklch(0.2_0.016_258)] py-18 sm:py-22 lg:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center sm:mb-14">
            <h2 className="mb-4 text-3xl font-bold text-[oklch(0.94_0.01_255)] sm:text-4xl">
              Why teams pick HireHunt AI
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-[oklch(0.76_0.02_252)]">
              Three capabilities that reduce hiring cycle time without adding
              process overhead.
            </p>
          </div>

          <div className="grid gap-4 md:gap-5 lg:grid-cols-[1.3fr_0.7fr]">
            <article className="rounded-2xl border border-[oklch(0.32_0.014_260)] bg-[oklch(0.23_0.013_260)] p-7 sm:p-9">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[oklch(0.34_0.024_258)] bg-[oklch(0.25_0.015_262)]">
                {features[0].icon}
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-[oklch(0.93_0.01_252)]">
                {features[0].title}
              </h3>
              <p className="mb-4 max-w-[66ch] text-base leading-7 text-[oklch(0.78_0.016_252)]">
                {features[0].detail}
              </p>
              <p className="text-sm font-medium tracking-[0.01em] text-[oklch(0.72_0.018_252)]">
                {features[0].description}
              </p>
            </article>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 lg:gap-5">
              {features.slice(1).map((feature, index) => (
                <article
                  key={index}
                  className="flex gap-4 rounded-2xl border border-[oklch(0.31_0.012_260)] bg-[oklch(0.22_0.012_262)] p-5"
                >
                  <div className="mt-1">{feature.icon}</div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-[oklch(0.92_0.012_252)]">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-6 text-[oklch(0.74_0.016_252)]">
                      {feature.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[oklch(0.19_0.016_194)] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-[oklch(0.94_0.01_255)] sm:text-4xl">
              Trusted by hiring teams
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-[oklch(0.76_0.02_252)]">
              Teams adopt quickly because first value arrives in the first
              session.
            </p>
          </div>
          <TestimonialCarousel />
        </div>
      </div>

      <div id="pricing" className="scroll-mt-20">
        <PricingSection />
      </div>

      <div id="how-it-works" className="scroll-mt-20">
        <HowItWorksSection />
      </div>

      <NewsletterSection />

      <Footer />

      <StickyCTA />
    </div>
  );
};

export default Home;
