'use client';

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Loader2,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Users,
  Calendar,
  Building2,
  Eye,
  CheckCircle2,
  FileText,
  Timer,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHeader } from "@/store/user.store";

export default function Page({ params }) {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);

  const jobId = params.id;
  const setTitle = useHeader((state) => state.setTitle);

  useEffect(() => {
    setTitle("Job Details");
  }, [setTitle]);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const res = await axios.get(`/api/job/${jobId}`);
        setDetails(res.data.job);
      } catch (err) {
        setError("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const formatSalary = (min, max, currency = "INR") => {
    if (!min && !max) return "Not disclosed";
    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
    if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`;
    return formatter.format(min || max);
  };

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

  if (loading) {
    return (
      <div className="flex justify-center min-h-screen items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-4xl mx-auto mt-6">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!details) {
    return (
      <Alert className="max-w-4xl mx-auto mt-6">
        <AlertDescription>Job not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start gap-4">
            {details.companyLogo && (
              <img
                src={details.companyLogo}
                alt={details.companyName}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <CardTitle className="text-2xl">{details.title}</CardTitle>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Building2 className="h-4 w-4" />
                {details.companyName}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary">
                  <MapPin className="h-3 w-3 mr-1" />
                  {details.location}
                </Badge>
                <Badge variant="secondary">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {details.workMode}
                </Badge>
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  {details.employmentType}
                </Badge>
                <Badge>{details.status}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="description">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="description">
            <FileText className="h-4 w-4 mr-2" /> Description
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Timer className="h-4 w-4 mr-2" /> Stats & Timeline
          </TabsTrigger>
        </TabsList>

        {/* Description */}
        <TabsContent value="description" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {details.description}
              </p>
            </CardContent>
          </Card>

          {details.skills?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills Required</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {details.skills.map((skill, i) => (
                  <Badge key={i} variant="outline">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {skill}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Timeline & Stats */}
        <TabsContent value="timeline" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p><strong>Salary:</strong> {formatSalary(details.salaryRange?.min, details.salaryRange?.max)}</p>
              <p><strong>Openings:</strong> {details.openings}</p>
              <p><strong>Posted On:</strong> {formatDate(details.postedAt)}</p>
              {details.viewsCount > 0 && (
                <p className="flex items-center gap-2">
                  <Eye className="h-4 w-4" /> {details.viewsCount} views
                </p>
              )}
              {details.applicationsCount > 0 && (
                <p><strong>Total Applications:</strong> {details.applicationsCount}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
