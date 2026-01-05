"use client"
import React from 'react';
import { Sparkles, Target, Users, Zap, Shield, Award, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHeader } from '@/store/user.store';
import { useEffect } from 'react';

const Page = () => {
  const setTitle = useHeader(state => state.setTitle);
  useEffect(() => {
    setTitle("About Us")
  },[setTitle])
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Matching",
      description: "Our intelligent algorithms match candidates with opportunities that align perfectly with their skills and career goals."
    },
    {
      icon: Zap,
      title: "Streamlined Process",
      description: "From application to offer, we've simplified every step of the interview process for both candidates and employers."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security. We never share your information without permission."
    },
    {
      icon: Users,
      title: "Expert Support",
      description: "Our dedicated team is here to help you succeed at every stage of your job search or hiring process."
    }
  ];

  const stats = [
    { value: "50K+", label: "Active Users" },
    { value: "10K+", label: "Companies" },
    { value: "95%", label: "Success Rate" },
    { value: "24/7", label: "Support" }
  ];

  const values = [
    "Transparency in every interaction",
    "Innovation in recruitment technology",
    "Equality of opportunity for all",
    "Excellence in candidate experience",
    "Integrity in data handling",
    "Growth for both candidates and companies"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <div className="text-center space-y-4 mb-16">
          <Badge className="mb-2" variant="secondary">About Us</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Revolutionizing the Way
            <span className="block text-primary mt-2">People Find Opportunities</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-6">
            We're building the future of recruitment with AI-powered technology that connects talented individuals with their dream careers.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission Section */}
        <div className="mb-20">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Target className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Our Mission</h2>
          </div>
          <Card className="border-2">
            <CardContent className="pt-6">
              <p className="text-lg text-center text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                We believe that finding the right job shouldn't be complicated or time-consuming. Our mission is to leverage cutting-edge AI technology to create meaningful connections between talented professionals and forward-thinking companies, making the interview process efficient, transparent, and accessible for everyone.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">What Makes Us Different</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Award className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Our Core Values</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                {values.map((value) => (
                  <div key={value} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Story Section */}
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold">Our Story</h2>
          <div className="max-w-3xl mx-auto space-y-4 text-muted-foreground">
            <p>
              Founded in 2024, our platform was born from a simple observation: the traditional interview process was broken. Candidates spent countless hours applying to jobs that weren't the right fit, while companies struggled to find qualified talent buried in mountains of applications.
            </p>
            <p>
              We set out to change that. By combining artificial intelligence with human insight, we've created a platform that understands what candidates truly want and what companies actually need. Today, we're proud to help thousands of professionals find their perfect career match every month.
            </p>
            <p className="font-medium text-foreground pt-4">
              Join us in reshaping the future of work, one perfect match at a time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
