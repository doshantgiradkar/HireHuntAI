"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowRight, 
  Play, 
  Users, 
  Brain, 
  Clock, 
  Shield, 
  CheckCircle, 
  Star,
  Menu,
  X,
  Sparkles,
  Zap,
  Target,
  Quote,
  ChevronLeft,
  ChevronRight,
  Check,
  Mail,
  Sun,
  Moon,
  ArrowDown,
  Calendar,
  UserCheck,
  BarChart3
} from 'lucide-react';

// Mock components for Clerk (replace with actual imports)
const SignInButton = ({ children, mode }) => <div onClick={() => console.log('Sign in')}>{children}</div>;
const SignUpButton = ({ children, mode }) => <div onClick={() => console.log('Sign up')}>{children}</div>;

// Theme toggle component
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setIsDark(!isDark)}
      className="w-9 h-9 p-0"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
};

// Animated counter component
const AnimatedCounter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    
    let startTime;
    const endValue = parseInt(end.replace(/\D/g, ''));
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentCount = Math.floor(progress * endValue);
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`counter-${end}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [end]);

  return (
    <div id={`counter-${end}`} className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
      {end.includes('K') ? `${Math.floor(count/1000)}K` : count}{suffix}
    </div>
  );
};

// Feature card component
const FeatureCard = ({ icon, title, description, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Card className={`group transition-all duration-500 transform hover:-translate-y-2 hover:shadow-xl border-slate-100 dark:border-slate-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <CardHeader className="pb-4">
        <div className="text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-slate-600 dark:text-slate-300 leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

// Testimonial carousel
const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const testimonials = [
    {
      quote: "Agentic Interview transformed our hiring process. We've reduced time-to-hire by 60% while improving candidate quality.",
      author: "Sarah Chen",
      role: "Head of Talent",
      company: "TechCorp"
    },
    {
      quote: "The AI-powered matching is incredibly accurate. We're finding better candidates faster than ever before.",
      author: "Michael Rodriguez",
      role: "HR Director",
      company: "InnovateLabs"
    },
    {
      quote: "The automated scheduling and interview insights have streamlined our entire recruitment workflow.",
      author: "Emily Johnson",
      role: "Recruitment Manager",
      company: "GrowthCo"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative max-w-3xl mx-auto">
      <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200/50 dark:border-blue-700/50">
        <CardContent className="text-center">
          <Quote className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-6 opacity-20" />
          <blockquote className="text-xl leading-relaxed text-slate-700 dark:text-slate-300 mb-6">
            "{testimonials[currentIndex].quote}"
          </blockquote>
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <div className="font-semibold text-slate-900 dark:text-white">
                {testimonials[currentIndex].author}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {testimonials[currentIndex].role} at {testimonials[currentIndex].company}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-center mt-6 space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-blue-600 w-8' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Pricing section
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

// How it works section
const HowItWorksSection = () => {
  const steps = [
    {
      icon: <UserCheck className="h-8 w-8" />,
      title: "Upload Job Requirements",
      description: "Define your role requirements and ideal candidate profile"
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI Candidate Matching",
      description: "Our AI analyzes and ranks candidates based on job fit"
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Automated Scheduling",
      description: "Seamlessly schedule interviews with integrated calendars"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Get Insights",
      description: "Receive detailed analytics and hiring recommendations"
    }
  ];

  return (
    <div className="py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Get started in minutes with our streamlined hiring process.
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-0.5 w-0.5 h-full bg-gradient-to-b from-blue-600 to-purple-600 hidden lg:block"></div>
          
          <div className="space-y-12 lg:space-y-24">
            {steps.map((step, index) => (
              <div key={index} className={`flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} flex-col lg:space-x-12`}>
                <div className="flex-1 text-center lg:text-left">
                  <div className={`lg:${index % 2 === 0 ? 'pr-12' : 'pl-12'}`}>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white mb-4">
                      {step.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
                
                {/* Step number */}
                <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-white dark:bg-slate-900 border-4 border-blue-600 rounded-full text-blue-600 font-bold text-xl lg:mx-6 my-8 lg:my-0">
                  {index + 1}
                </div>
                
                <div className="flex-1 hidden lg:block">
                  {/* Spacer for alternating layout */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Newsletter signup
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
    <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Stay Updated
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Get the latest updates on AI hiring trends and product features.
        </p>
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex space-x-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white/90 border-white/20 text-slate-900"
              required
            />
            <Button 
              type="submit" 
              className="bg-white text-blue-600 hover:bg-blue-50 transition-colors"
              disabled={isSubmitted}
            >
              {isSubmitted ? <Check className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
            </Button>
          </div>
        </form>
        
        {isSubmitted && (
          <p className="mt-4 text-green-200 font-medium">
            ✓ Thanks for subscribing! Check your email for confirmation.
          </p>
        )}
      </div>
    </div>
  );
};

// Sticky CTA
const StickyCTA = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      setIsVisible(scrollPosition > windowHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-4 shadow-lg transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Ready to transform your hiring?
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Start your free trial today
          </p>
        </div>
        <SignUpButton mode="modal">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Get Started Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </SignUpButton>
      </div>
    </div>
  );
};

// Main component
const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 scroll-smooth">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                Agentic Interview
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
              <a href="#how-it-works" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
                How It Works
              </a>
              <ThemeToggle />
              <SignInButton mode="modal">
                <Button variant="outline" className="border-slate-300 dark:border-slate-600">
                  Login
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Get Started
                </Button>
              </SignUpButton>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-4 border-t border-slate-200 dark:border-slate-700">
              <a href="#features" className="block text-slate-600 dark:text-slate-300 hover:text-blue-600 py-2">
                Features
              </a>
              <a href="#pricing" className="block text-slate-600 dark:text-slate-300 hover:text-blue-600 py-2">
                Pricing
              </a>
              <a href="#how-it-works" className="block text-slate-600 dark:text-slate-300 hover:text-blue-600 py-2">
                How It Works
              </a>
              <div className="flex flex-col space-y-2 pt-4">
                <SignInButton mode="modal">
                  <Button variant="outline" className="w-full">Login</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
                </SignUpButton>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-400/30 to-orange-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="text-center">
            {/* Badge */}
            <Badge variant="secondary" className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 px-6 py-3 text-sm font-medium text-blue-700 dark:text-blue-300 mb-8 border border-blue-200/50 dark:border-blue-700/50">
              <Zap className="h-4 w-4 mr-2" />
              <span>AI-Powered Interview Management</span>
            </Badge>
            
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-8 animate-in fade-in slide-in-from-bottom duration-1000">
              Transform Your{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
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
              <SignUpButton mode="modal">
                <Button 
                  size="lg" 
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </SignUpButton>
              
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
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">Agentic Interview</span>
              </div>
              <p className="text-slate-400 mb-4 max-w-md">
                Transform your hiring process with AI-powered interview management. 
                Make better hiring decisions faster.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-slate-400 text-sm mb-4 md:mb-0">
              © 2025 Agentic Interview. All rights reserved.
            </div>
            <div className="flex space-x-6 text-slate-400 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky CTA */}
      <StickyCTA />
    </div>
  );
};

export default Home