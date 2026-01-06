"use client";

import NewsletterSection from "@/components/newsletter-section";
import StickyCTA from "@/components/sticky-cta";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Brain, Clock, Menu, Shield, SparklesIcon,Sparkles, Zap, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import AnimatedCounter from "@/components/animated-counter";
import FeatureCard from "@/components/feature-card";
import HowItWorksSection from "@/components/how-it-works";
import TestimonialCarousel from "@/components/testimonial-carousel";
import PricingSection from "@/components/pricing-section";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/footer";
import { X } from "lucide-react";


const Home = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMounted, setHasMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setHasMounted(true);
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const features = [
        {
            icon: <Brain className="h-8 w-8" />,
            title: "AI-Powered Matching",
            description: "Intelligent candidate screening with advanced AI algorithms that analyze skills, experience, and cultural fit."
        },
        {
            icon: <Clock className="h-8 w-8" />,
            title: "Real-time Scheduling",
            description: "Seamless interview scheduling with automated calendar integration and timezone handling."
        },
        {
            icon: <Shield className="h-8 w-8" />,
            title: "Secure & Compliant",
            description: "Enterprise-grade security with full compliance standards including GDPR and SOC 2."
        }
    ];

    const stats = [
        { value: "500+", label: "Companies Trust Us" },
        { value: "50K+", label: "Interviews Conducted" },
        { value: "95%", label: "Success Rate" },
        { value: "24/7", label: "Support Available" }
    ];

    if (!hasMounted) {
        // Prevent SSR/client mismatch
        return null;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center space-y-8">
                        <Skeleton className="h-12 w-3/4 mx-auto" />
                        <Skeleton className="h-6 w-1/2 mx-auto" />
                        <div className="flex justify-center space-x-4">
                            <Skeleton className="h-12 w-32" />
                            <Skeleton className="h-12 w-32" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }



    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 scroll-smooth">
            {/* Navigation */}
            <nav className="relative z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-linear-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                <SparklesIcon className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">
                                HireHunt AI
                            </span>
                        </div>
                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
                                Features
                            </a>
                            <a href="#pricing" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
                                Pricing
                            </a>
                            <a href="#about" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
                                About
                            </a>
                            <Button variant="outline" className="border-slate-300 dark:border-slate-600" onClick={() => router.push('/sign-in')}>
                                Login
                            </Button>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => router.push('/sign-in')}>
                                Get Started
                            </Button>
                        </div>
                        {/* Mobile menu button */}
                        <button
                            className="md:hidden p-2 rounded-md text-slate-600 dark:text-slate-300"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                    {/* Mobile Navigation */}
                    {isMenuOpen && (
                        <div className="md:hidden py-4 space-y-4 border-t border-slate-200 dark:border-slate-700">
                            <a href="#features" className="block text-slate-600 dark:text-slate-300 hover:text-blue-600">
                                Features
                            </a>
                            <a href="#pricing" className="block text-slate-600 dark:text-slate-300 hover:text-blue-600">
                                Pricing
                            </a>
                            <a href="#about" className="block text-slate-600 dark:text-slate-300 hover:text-blue-600">
                                About
                            </a>
                            <div className="flex flex-col space-y-2 pt-4">
                                <Button variant="outline" className="w-full" onClick={() => router.push('/sign-in')}>
                                    Login
                                </Button>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => router.push('/sign-in')}>
                                    Get Started
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-linear-to-r from-pink-400/30 to-orange-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-linear-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
                    <div className="text-center">
                        {/* Badge */}
                        <Badge variant="secondary" className="inline-flex items-center rounded-full bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 px-6 py-3 text-sm font-medium text-blue-700 dark:text-blue-300 mb-8 border border-blue-200/50 dark:border-blue-700/50">
                            <Zap className="h-4 w-4 mr-2" />
                            <span>Streamline Your Hiring</span>
                        </Badge>

                        {/* Main Heading */}
                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-8 animate-in fade-in slide-in-from-bottom duration-1000">
                            Transform Your{' '}
                            <span className="bg-linear-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                                Interview Process
                            </span>{' '}
                            with AI
                        </h1>

                        {/* Description */}
                        <p className="mx-auto max-w-2xl text-xl leading-8 text-slate-600 dark:text-slate-300 mb-12 animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
                            Streamline hiring with intelligent candidate matching, automated scheduling,
                            and comprehensive interview analytics. Make better hiring decisions faster.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
                            <Button
                                size="lg"
                                className="group bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                                onClick={() => router.push('/register')}
                            >
                                Start Free Trial
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="px-8 py-4 text-lg font-semibold border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
                            >
                                <Play className="mr-2 h-5 w-5" />
                                Watch Demo
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <AnimatedCounter end={stat.value} />
                                    <div className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="py-20 sm:py-24 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            Why Choose Agentic Interview?
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                            Our AI-powered platform revolutionizes how you conduct interviews and make hiring decisions.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <FeatureCard
                                key={index}
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.description}
                                delay={index * 200}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="py-20 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            What Our Customers Say
                        </h2>
                        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                            Join hundreds of companies already transforming their hiring process.
                        </p>
                    </div>
                    <TestimonialCarousel />
                </div>
            </div>

            {/* Pricing Section */}
            <div id="pricing">
                <PricingSection />
            </div>

            {/* How It Works Section */}
            <div id="how-it-works">
                <HowItWorksSection />
            </div>

            {/* Newsletter Section */}
            <NewsletterSection />

            {/* Footer */}
            <Footer/>

            {/* Sticky CTA */}
            <StickyCTA />
        </div>
    );
};

export default Home;
