"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  ExternalLink,
  Calendar,
  Briefcase,
  FileText,
  CheckCircle2,
  XCircle,
  Target,
  Clock,
  User,
  MapPin,
  GraduationCap,
  Award,
  Download,
  Send,
  MessageSquare,
  ChevronRight,
  Building2,
  DollarSign,
  Users,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import axios from "axios";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const StatusBadge = ({ status }) => {
  const statusConfig = {
    applied: { label: "Applied", variant: "secondary", icon: Clock },
    shortlisted: {
      label: "Shortlisted",
      variant: "default",
      icon: CheckCircle2,
    },
    interview_scheduled: {
      label: "Interview Scheduled",
      variant: "outline",
      icon: Calendar,
    },
    hired: { label: "Hired", variant: "default", icon: Award },
    rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
    pending: { label: "Pending Review", variant: "secondary", icon: Clock },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1.5 px-3 py-1.5 font-medium">
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
};

const MatchScoreIndicator = ({ score, isEligible }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Match Score</span>
        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
          {score}%
        </span>
      </div>
      <Progress value={score} className={`h-2 ${getProgressColor(score)}`} />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Poor</span>
        <span>Excellent</span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        {isEligible ? (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Eligible
          </Badge>
        ) : (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Not Eligible
          </Badge>
        )}
      </div>
    </div>
  );
};

const InfoCard = ({ title, icon, children, className = "" }) => (
  <Card className={className}>
    <CardHeader className="pb-3">
      <div className="flex items-center gap-2">
        {icon}
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const InfoItem = ({ label, value, icon, className = "" }) => (
  <div className={`space-y-1 ${className}`}>
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {icon}
      <span>{label}</span>
    </div>
    <p className="font-medium">{value || "Not specified"}</p>
  </div>
);

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not specified";

export default function JobApplicationDetailsPage({ params }) {
  const { id } = React.use(params);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
  if (!id) return;

  const fetchApplication = async () => {
    try {
      const res = await axios.get(`/api/application/${id}`);
      console.log("application data:",res.data);
      setApplication(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  fetchApplication();
}, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>

            {/* Tabs Skeleton */}
            <Skeleton className="h-10 w-full" />

            {/* Content Skeleton */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error || "Application not found"}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Calculate total experience
  const totalExperience =
    application.candidate?.totalExperienceDuration || "Not specified";
  const candidateSkills =
    application.candidate?.resume?.skills || application.skills || [];
  const user = application.user || {};
  const candidate = application.candidate || {};

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="space-y-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Application Details
            </h1>
            <p className="text-muted-foreground">
              Review candidate application and manage status
            </p>
          </div>

          {/* Candidate Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* Avatar and Basic Info */}
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="h-20 w-20 border-4 border-background">
                    <AvatarImage
                      src={user.imageUrl}
                      alt={application.fullName}
                    />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {getInitials(application.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {application.fullName}
                      </h2>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{application.email || user.email}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={application.status} />
                      {application.eligibility?.matchScore && (
                        <Badge variant="outline" className="gap-1.5">
                          <Target className="h-3.5 w-3.5" />
                          {application.eligibility.matchScore}% Match
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {application.resumeUrl && (
                    <Button variant="outline" className="gap-2" asChild>
                      <a
                        href={application.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye className="h-4 w-4" />
                        View Resume
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </Button>
                  <Button className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Schedule Interview
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <InfoItem
                        label="Email"
                        value={application.email || user.email}
                        icon={<Mail className="h-4 w-4" />}
                      />
                      <InfoItem
                        label="Phone"
                        value={application.phone}
                        icon={<Phone className="h-4 w-4" />}
                      />
                      <InfoItem
                        label="Location"
                        value={candidate.location}
                        icon={<MapPin className="h-4 w-4" />}
                        className="md:col-span-2"
                      />
                    </div>

                    {application.resumeUrl && (
                      <div className="pt-4 border-t">
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          asChild
                        >
                          <a
                            href={application.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4" />
                            Download Resume
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Professional Summary */}
                {application.experienceSummary && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Professional Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {application.experienceSummary}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="experience" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Work Experience</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Total Experience */}
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Total Experience</p>
                          <p className="text-sm text-muted-foreground">
                            {typeof application?.candidate
                              ?.totalExperienceDuration === "number"
                              ? `${application.candidate.totalExperienceDuration} months`
                              : "Not specified"}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">Profile Verified</Badge>
                    </div>

                    {/* Experience List */}
                    {application?.candidate?.resume?.experience &&
                    application.candidate.resume.experience.length > 0 ? (
                      <div className="space-y-4">
                        {application.candidate.resume.experience.map(
                          (exp, index) => (
                            <div
                              key={index}
                              className="border-l-2 border-primary pl-4 py-2"
                            >
                              <h4 className="font-semibold">{exp.jobTitle}</h4>
                              <p className="text-sm text-muted-foreground">
                                {exp.jobDesc}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No detailed work experience provided
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cover-letter" className="space-y-6">
                {/* Cover Letter */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cover Letter</CardTitle>
                    {application.whyInterested && (
                      <CardDescription>
                        Includes motivation and interest in the role
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {application.coverLetter ? (
                        <div className="prose prose-sm max-w-none">
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {application.coverLetter}
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">
                          No cover letter provided
                        </p>
                      )}

                      {application.whyInterested && (
                        <div className="mt-6 pt-6 border-t">
                          <h4 className="font-medium mb-2">
                            Why interested in this position?
                          </h4>
                          <p className="text-muted-foreground leading-relaxed">
                            {application.whyInterested}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills" className="space-y-6">
                {/* Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Skills & Technologies
                    </CardTitle>
                    <CardDescription>
                      {candidateSkills.length} skills identified
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {candidateSkills.map((skill, index) => (
                        <TooltipProvider key={index}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="secondary"
                                className="px-3 py-1.5 font-medium hover:bg-secondary/80 transition-colors"
                              >
                                {skill}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Click to filter by this skill</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* AI Match Score */}
            <InfoCard
              title="AI Match Score"
              icon={<Target className="h-4 w-4 text-primary" />}
            >
              <MatchScoreIndicator
                score={application.eligibility?.matchScore || 0}
                isEligible={application.eligibility?.isEligible || false}
              />
            </InfoCard>

            {/* Application Details */}
            <InfoCard
              title="Application Details"
              icon={<FileText className="h-4 w-4 text-primary" />}
            >
              <div className="space-y-4">
                <InfoItem
                  label="Applied Date"
                  value={formatDate(application.createdAt)}
                  icon={<Calendar className="h-4 w-4" />}
                />
                <InfoItem
                  label="Available From"
                  value={formatDate(application.availabilityDate)}
                  icon={<Clock className="h-4 w-4" />}
                />
                <InfoItem
                  label="Job ID"
                  value={application.jobId?.substring(0, 8) + "..."}
                  icon={<Briefcase className="h-4 w-4" />}
                />
              </div>
            </InfoCard>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="text-sm text-muted-foreground">
              Application ID: {application._id?.substring(0, 8)}...
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.history.back()}>
                Back to Applications
              </Button>
              <Button>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Make Decision
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
