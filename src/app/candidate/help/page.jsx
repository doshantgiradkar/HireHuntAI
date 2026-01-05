"use client"

import { useHeader } from '@/store/user.store';
import React, { useEffect, useState } from 'react';
import { Search, MessageCircle, Book, Mail, Phone, HelpCircle, ChevronDown, Users, Briefcase, Calendar, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Page = () => {
  const setTitle = useHeader((state) => state.setTitle);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    setTitle("Help");
  }, [setTitle]);

  const categories = [
    { id: 'all', name: 'All Topics', icon: Book, count: 16 },
    { id: 'account', name: 'Account & Profile', icon: Users, count: 4 },
    { id: 'jobs', name: 'Job Applications', icon: Briefcase, count: 4 },
    { id: 'interviews', name: 'Interviews', icon: Calendar, count: 3 },
    { id: 'technical', name: 'Technical Issues', icon: Settings, count: 5 }
  ];

  const faqs = [
    {
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Creating an account is simple! Click on the "Get Started" button in the top right corner at home page, fill in your email, create a password, and verify your email address.'
    },
    {
      category: 'account',
      question: 'How do I update my profile information?',
      answer: 'In HireHunt we have two types of profiles! "Resume Profile" and "User Profile", to update User Profile click on yur profile at bottom left corner, click on profile and here you can update your profile. Similarly you can update your candidate profile by visiting /candidate/edit-profile'
    },
    {
      category: 'account',
      question: 'Can I delete my account?',
      answer: 'Yes, you can delete your account at any time. Go to Sidebar > Your Name > Profile > Security > Delete Account. Please note that this action is permanent and will remove all your data, applications, and interview history from our system.'
    },
    {
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page. Enter your email address and we\'ll send you a password reset link. Follow the link in your email to create a new password. The link expires after 24 hours for security reasons.'
    },
    {
      category: 'jobs',
      question: 'How does the job matching algorithm work?',
      answer: 'Our AI-powered algorithm analyzes your profile, including your skills, experience, education, and preferences. It then compares this information with job requirements and company culture to calculate a match percentage. Jobs with higher match percentages are more aligned with your profile.'
    },
    {
      category: 'jobs',
      question: 'How do I apply for a job?',
      answer: 'Browse jobs on the Jobs Search page or from your dashboard recommendations. Click on a View Details for full details, then click the "Apply Now" button. You\'ll be asked to review your profile information and can add a cover letter. Submit your application and you\'ll receive a confirmation email.'
    },
    {
      category: 'jobs',
      question: 'How do I track my applications?',
      answer: 'Visit My Applications to see all your active applications and their current status. You can filter by status (applied, under review, interview scheduled, rejected, hired) and sort by date. You\'ll also receive email notifications for any status changes.'
    },
    {
      category: 'interviews',
      question: 'How do I schedule an interview?',
      answer: 'When a company invites you to interview, you\'ll receive an email notification and a notification in your dashboard. Visit Interviews page view available time slots and select your preferred time.'
    },
    {
      category: 'interviews',
      question: 'What happens during an AI-powered interview?',
      answer: 'AI-powered interviews use advanced algorithms to assess your responses. You\'ll answer questions via video and speach, and the AI evaluates your communication skills, technical knowledge, and cultural fit.'
    },
    {
      category: 'interviews',
      question: 'How should I prepare for an interview?',
      answer: 'Review the job description, research the company, prepare answers to common questions, and test your technology (camera, microphone, internet). For technical roles, practice coding problems. We also provide interview tips and practice questions in your interview confirmation email.'
    },
    {
      category: 'technical',
      question: 'What browsers are supported?',
      answer: 'Our platform works best on the latest versions of Chrome, Firefox, Safari, and Edge. We recommend using Chrome for the best experience, especially for video interviews. Make sure your browser is updated to the latest version.'
    },
    {
      category: 'technical',
      question: 'Why can\'t I upload my resume?',
      answer: 'Ensure your resume is in PDF format and is under 1MB in size. If you\'re still having issues, try clearing your browser cache or using a different browser. If the problem persists, contact our support team with details about the error message you\'re seeing.'
    },
    {
      category: 'technical',
      question: 'I\'m not receiving email notifications',
      answer: 'First, check your spam/junk folder. Add noreply@hirehunt.ai to your contacts. Then go to Settings > Notifications and ensure email notifications are enabled. If you\'re still not receiving emails, contact support to verify your email address.'
    },
    {
      category: 'technical',
      question: 'The video interview isn\'t working',
      answer: 'Check that your browser has permission to access your camera and microphone. Test your equipment in Settings > Device Test. Ensure you have a stable internet connection (minimum 5 Mbps). If issues persist, try using Chrome and disabling browser extensions that might block media access.'
    },
    {
      category: 'jobs',
      question: 'What does each application status mean?',
      answer: 'Pending: Application received. Under Review: Employer is reviewing your profile. Interview Scheduled: You have an upcoming interview. Rejected: Application was not successful. Offer Received: Congratulations! You\'ve received a job offer. Withdrawn: You withdrew your application.'
    },
    {
      category: 'technical',
      question: 'Is my data secure?',
      answer: 'Yes, we take security seriously. All data is encrypted in transit and at rest. We use industry-standard security measures and are compliant with protection regulations. We never share your personal information without your explicit consent. Read our Privacy Policy for full details.'
    }
  ];

  const contactOptions = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team',
      action: 'Start Chat',
      available: true
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'support@hirehunt.ai',
      action: 'Send Email',
      available: true
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Mon-Fri, 9AM-6PM EST',
      action: 'Call Us',
      available: false
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-6xl">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <HelpCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">How Can We Help You?</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Search our knowledge base or browse categories to find answers to your questions
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Search for help articles, FAQs, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-base"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          return (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'border-primary ring-2 ring-primary/20' : ''
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardContent className="p-4 text-center">
                <Icon className={`h-6 w-6 mx-auto mb-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="font-medium text-sm mb-1">{category.name}</div>
                <Badge variant="secondary" className="text-xs">
                  {category.count} articles
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {selectedCategory === 'all' ? 'All Questions' : categories.find(c => c.id === selectedCategory)?.name}
          </h2>
          <span className="text-sm text-muted-foreground">
            {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'}
          </span>
        </div>

        {filteredFaqs.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-2">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <span className="text-left font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or browse different categories
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Contact Support Section */}
      <div className="space-y-4 pt-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Still Need Help?</h2>
          <p className="text-muted-foreground">Our support team is here to assist you</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {contactOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card key={option.title} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                  </div>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    variant={option.available ? "default" : "secondary"}
                    disabled={!option.available}
                  >
                    {option.action}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Additional Resources */}
      <Card className="bg-muted/50">
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <Book className="h-12 w-12 text-primary mx-auto" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Looking for More Resources?</h3>
              <p className="text-muted-foreground mb-4">
                Check out our comprehensive guides and documentation
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="outline">Getting Started Guide</Button>
              <Button variant="outline">Video Tutorials</Button>
              <Button variant="outline">API Documentation</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
