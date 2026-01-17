"use client"
import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, ExternalLink, Calendar, Briefcase, FileText, CheckCircle2, XCircle, Target, Clock } from 'lucide-react';

const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

const StatusBadge = ({ status }) => {
  const labels = {
    pending: 'Pending Review',
    reviewed: 'Reviewed',
    interviewing: 'Interviewing',
    accepted: 'Accepted',
    rejected: 'Rejected'
  };
  return <Badge variant="secondary" className="text-xs font-medium">{labels[status?.toLowerCase()] || 'Pending Review'}</Badge>;
};

const EligibilityBadge = ({ isEligible, matchScore }) => {
  const Icon = isEligible ? CheckCircle2 : XCircle;
  return (
    <Badge variant={isEligible ? 'default' : 'destructive'} className="text-xs font-medium gap-1">
      <Icon className="h-3 w-3" />
      {isEligible ? 'Eligible' : 'Not Eligible'} · {matchScore}%
    </Badge>
  );
};

const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified';

const Section = ({ title, icon, children }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      {icon}
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</h3>
    </div>
    <div className="rounded-lg border bg-muted/40 p-5">{children}</div>
  </div>
);

const InfoField = ({ label, icon, children, fullWidth }) => (
  <div className={`space-y-2 ${fullWidth ? 'col-span-full' : ''}`}>
    <Label className="text-xs text-muted-foreground font-normal">{label}</Label>
    <div className="flex items-center gap-2.5">
      {icon}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  </div>
);

export default function JobApplicationDetailsPage({ params }) {
  const { id } = params;
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/application/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load application');
        return res.json();
      })
      .then(data => {
        setApplication(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 py-10 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="shadow-md">
            <CardContent className="py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-muted/30 py-10 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="shadow-md border-destructive">
            <CardContent className="py-12 text-center">
              <p className="text-destructive">{error || 'Application not found'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="space-y-6 pb-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-muted-foreground">Job Application Form</h2>
              <p className="text-xs text-muted-foreground mt-1">Application ID: {id}</p>
            </div>
            <Separator />
            <div className="flex flex-col items-center gap-4 pt-2">
              <Avatar className="h-28 w-28 border-4 border-background shadow-lg ring-2 ring-muted">
                <AvatarImage src={application.profileImage} alt={application.fullName} />
                <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                  {getInitials(application.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">{application.fullName}</h1>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{application.email}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <StatusBadge status={application.status} />
                <EligibilityBadge isEligible={application.eligibility?.isEligible} matchScore={application.eligibility?.matchScore || 0} />
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-8 pt-8 pb-8">
            <Section title="AI Assessment" icon={<Target className="h-4 w-4 text-muted-foreground" />}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Match Score</p>
                  <p className="text-xs text-muted-foreground">Automated eligibility evaluation</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">{application.eligibility?.matchScore || 0}%</p>
                  <p className="text-xs text-muted-foreground">compatibility</p>
                </div>
              </div>
            </Section>
            <Section title="Contact Information" icon={<Mail className="h-4 w-4 text-muted-foreground" />}>
              <div className="grid gap-5">
                <InfoField label="Email Address" icon={<Mail className="h-4 w-4 flex-shrink-0 text-muted-foreground" />}>
                  <a href={`mailto:${application.email}`} className="text-sm hover:underline">{application.email}</a>
                </InfoField>
                <InfoField label="Phone Number" icon={<Phone className="h-4 w-4 flex-shrink-0 text-muted-foreground" />}>
                  <a href={`tel:${application.phone}`} className="text-sm hover:underline">{application.phone}</a>
                </InfoField>
                <InfoField label="Resume / CV" icon={<FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />} fullWidth>
                  <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                    View Resume Document
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </InfoField>
              </div>
            </Section>
            <Section title="Job Details" icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}>
              <div className="grid gap-5">
                <InfoField label="Position Applied For" icon={<Briefcase className="h-4 w-4 flex-shrink-0 text-muted-foreground" />}>
                  <span className="text-sm font-medium">Job ID: {application.jobId}</span>
                </InfoField>
                <InfoField label="Application Status" icon={<Clock className="h-4 w-4 flex-shrink-0 text-muted-foreground" />}>
                  <StatusBadge status={application.status} />
                </InfoField>
                <InfoField label="Available From" icon={<Calendar className="h-4 w-4 flex-shrink-0 text-muted-foreground" />} fullWidth>
                  <span className="text-sm">{formatDate(application.availabilityDate)}</span>
                </InfoField>
              </div>
            </Section>
            {application.skills && application.skills.length > 0 && (
              <Section title="Skills & Qualifications">
                <div>
                  <Label className="text-xs text-muted-foreground mb-3 block">
                    {application.skills.length} {application.skills.length === 1 ? 'skill' : 'skills'} listed
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {application.skills.map((skill, i) => <Badge key={i} variant="secondary" className="font-normal">{skill}</Badge>)}
                  </div>
                </div>
              </Section>
            )}
            {application.experienceSummary && (
              <Section title="Professional Experience">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Experience Summary</Label>
                  <p className="text-sm leading-relaxed text-foreground/90">{application.experienceSummary}</p>
                </div>
              </Section>
            )}
            {application.coverLetter && (
              <Section title="Cover Letter">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Letter of Interest</Label>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">{application.coverLetter}</p>
                </div>
              </Section>
            )}
            {application.whyInterested && (
              <Section title="Additional Information">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Why Are You Interested in This Position?</Label>
                  <p className="text-sm leading-relaxed text-foreground/90">{application.whyInterested}</p>
                </div>
              </Section>
            )}
            <div className="pt-6">
              <Separator className="mb-6" />
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email to Applicant
                </Button>
                <Button size="lg" variant="outline" className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Interview
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}