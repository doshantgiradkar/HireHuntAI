'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Mail, Phone, ExternalLink, Briefcase } from 'lucide-react';
import { use } from 'react';

/* ---------- Status Badge ---------- */
const StatusBadge = ({ status }) => {
  const label = status.replace('_', ' ').toUpperCase();
  return <Badge variant="secondary">{label}</Badge>;
};

/* ---------- Main Page ---------- */
export default function JobApplicationDetailsPage({ params }) {
  const { id: applicationId } = params; // 👈 dynamic route param
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!applicationId) return;

    const fetchApplication = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `/api/application/${applicationId}`
        );
        setApplication(res.data);
        console.log(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load application details');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId]);

  if (loading) {
    return <div className="p-8">Loading application details...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  if (!application) {
    return <div className="p-8">Application not found</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{application.fullName}</h1>
          <p className="text-muted-foreground">
            Application ID: {application._id}
          </p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={application.status} />
          <Badge
            className={
              application.eligibility?.isEligible
                ? 'bg-green-100 text-green-800'
                : ''
            }
            variant={
              application.eligibility?.isEligible
                ? 'secondary'
                : 'destructive'
            }
          >
            {application.eligibility?.isEligible ? 'Eligible' : 'Not Eligible'}
          </Badge>
        </div>
      </div>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div>
            <Label>Email</Label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {application.email}
            </div>
          </div>

          <div>
            <Label>Phone</Label>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {application.phone}
            </div>
          </div>

          <div>
            <Label>Job ID</Label>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              {application.jobId}
            </div>
          </div>

          <div>
            <Label>Resume</Label>
            <a
              href={application.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary"
            >
              <ExternalLink className="h-4 w-4" />
              View Resume
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Eligibility */}
      <Card>
        <CardHeader>
          <CardTitle>Eligibility Assessment</CardTitle>
          <CardDescription>AI-powered evaluation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-2">
            <span>Match Score</span>
            <span className="font-bold">
              {application.eligibility?.matchScore}%
            </span>
          </div>
          <Separator />
          <p className="mt-3 text-muted-foreground">
            {application.eligibility?.reason}
          </p>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          {application.skills?.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <CardTitle>Experience Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          {application.experienceSummary}
        </CardContent>
      </Card>

      {/* Cover Letter */}
      <Card>
        <CardHeader>
          <CardTitle>Cover Letter</CardTitle>
        </CardHeader>
        <CardContent className="whitespace-pre-wrap text-muted-foreground">
          {application.coverLetter}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button>Send Email</Button>
        <Button variant="outline">Schedule Interview</Button>
      </div>
    </div>
  );
}
