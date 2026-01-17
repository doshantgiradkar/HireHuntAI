"use client";

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
  ExternalLink,
  Mail,
  Award,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useHeader } from "@/store/user.store";
import { use } from "react";

export default function Page({ params }) {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [candidatesError, setCandidatesError] = useState(null);
  const [activeTab, setActiveTab] = useState("description");

  const router = useRouter();
  const jobId =  use(params).id;
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

  useEffect(() => {
    if (activeTab === "candidates" && applications.length === 0) {
      fetchCandidates();
    }
  }, [activeTab]);

  const fetchCandidates = async () => {
    setCandidatesLoading(true);
    setCandidatesError(null);
    try {
      const res = await axios.get(`/api/application/candidates/${jobId}`);
      setApplications(res.data.applications || []);
      console.log(res.data);
    } catch (err) {
      setCandidatesError("Failed to load candidates");
    } finally {
      setCandidatesLoading(false);
    }
  };

  const formatSalary = (min, max, currency = "INR") => {
    if (!min && !max) return "Not disclosed";
    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
    if (min && max)
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    return formatter.format(min || max);
  };

  const getCandidateName = (app) =>
    app.user
      ? `${app.user.firstName || ""} ${app.user.lastName || ""}`.trim()
      : "Unknown";

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  const getCandidateSkills = (app) => app.candidate?.resume?.skills || [];

  const getCandidateExperience = (app) =>
    app.candidate?.resume?.experience || [];

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

  const getStatusColor = (status) => {
    const colors = {
      applied: "bg-gray-100 text-gray-800 border-gray-200",
      shortlisted: "bg-blue-100 text-blue-800 border-blue-200",
      interview_scheduled: "bg-yellow-100 text-yellow-800 border-yellow-200",
      hired: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || colors.applied;
  };

  const formatStatusLabel = (status) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="description">
            <FileText className="h-4 w-4 mr-2" /> Description
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Timer className="h-4 w-4 mr-2" /> Stats & Timeline
          </TabsTrigger>
          <TabsTrigger value="candidates">
            <Users className="h-4 w-4 mr-2" /> Candidates
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
              <p>
                <strong>Salary:</strong>{" "}
                {formatSalary(
                  details.salaryRange?.min,
                  details.salaryRange?.max
                )}
              </p>
              <p>
                <strong>Openings:</strong> {details.openings}
              </p>
              <p>
                <strong>Posted On:</strong> {formatDate(details.postedAt)}
              </p>
              {details.viewsCount > 0 && (
                <p className="flex items-center gap-2">
                  <Eye className="h-4 w-4" /> {details.viewsCount} views
                </p>
              )}
              {details.applicationsCount > 0 && (
                <p>
                  <strong>Total Applications:</strong>{" "}
                  {details.applicationsCount}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* ---------------- CANDIDATES TAB ---------------- */}
        <TabsContent value="candidates" className="mt-6">
          {candidatesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : candidatesError ? (
            <Alert variant="destructive">
              <AlertDescription>{candidatesError}</AlertDescription>
            </Alert>
          ) : applications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                No candidates have applied yet
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium">
                          Candidate
                        </th>
                        <th className="text-left p-4 text-sm font-medium">
                          Email
                        </th>
                        <th className="text-left p-4 text-sm font-medium">
                          Match Score
                        </th>
                        <th className="text-left p-4 text-sm font-medium">
                          Experience
                        </th>
                        <th className="text-left p-4 text-sm font-medium">
                          Status
                        </th>
                        <th className="text-left p-4 text-sm font-medium">
                          Applied
                        </th>
                        <th className="text-left p-4 text-sm font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {applications.map((app) => (
                        <tr
                          key={app._id}
                          className="border-b hover:bg-muted/50 transition-colors"
                        >
                          {/* Candidate */}
                          <td
                            className="p-4"
                            onClick={() =>
                              router.push(
                                `/recruiter/candidate/${app.candidateId}`
                              )
                            }
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 cursor-pointer">
                                <AvatarImage src={app.user?.imageUrl} />
                                <AvatarFallback>
                                  {getInitials(getCandidateName(app))}
                                </AvatarFallback>
                              </Avatar>

                              <div>
                                <p className="font-medium leading-none">
                                  {getCandidateName(app)}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {app.user?.email}
                            </div>
                          </td>

                          {/* Match Score */}
                          <td className="p-4">
                            {app.eligibility?.matchScore ? (<div className="flex items-center gap-1">
                              
                              {app.eligibility?.matchScore}%
                            </div>) : (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </td>
                

                          {/* Experience */}
                          <td className="p-4">
                            {app.candidate?.totalExperienceDuration ? (<div className="flex items-center gap-1">
                              
                              {app.candidate?.totalExperienceDuration} years
                            </div>) : (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            <Badge className={getStatusColor(app.status)}>
                              {formatStatusLabel(app.status)}
                            </Badge>
                          </td>

                          {/* Applied Date */}
                          <td className="p-4 text-xs text-muted-foreground">
                            {formatDate(app.createdAt)}
                          </td>

                          {/* Actions */}
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  router.push(
                                    `/recruiter/applications/${app._id}`
                                  )
                                }
                              >
                                See Details
                              </Button>

                              {app.resumeUrl && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    window.open(app.resumeUrl, "_blank")
                                  }
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
