'use client';
import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
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
  UserCheck,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHeader } from "@/store/user.store";
import { XCircle } from "lucide-react";
import axios from "axios";

export default function Page({ params }) {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({});
  const [eligibile, setEligibility] = useState({});
  const { userId } = useAuth();
  const jobId = React.use(params).id;
  const setTitle = useHeader((state) => state.setTitle);

  useEffect(() => {
    setTitle("Job Details");
  }, [setTitle]);

  useEffect(() => {
    axios.get("/api/candidate").then((resp) => {
      setUser(resp.data.candidate);
    });

    axios.get(`/api/candidate/${userId}/eligibility?jobId=${jobId}`).then((resp) => {
      setEligibility(resp.data);
    });
  }, [setUser, setEligibility]);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await axios.get(`/api/job/${jobId}`);
        if (response.status != 200) {
          throw new Error("Failed to fetch job details");
        }
        const data = await response.data;
        setDetails(data.job);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load job details");
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const handleApply = () => {
    window.location.href = `/candidate/jobs/${jobId}/apply`;
  };

  const formatSalary = (min, max, currency) => {
    if (!min && !max) return "Not disclosed";
    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    });
    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    }
    return formatter.format(min || max);
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Alert>
          <AlertDescription>Job not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl pb-24 lg:pb-8">
      {/* Header Card and Apply Button */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Header Card */}
        <Card className="lg:col-span-2">
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
                <CardTitle className="text-2xl mb-2">{details.title}</CardTitle>
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">{details.companyName}</span>
                </div>
                <div className="flex flex-wrap gap-2">
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
                  {details.experienceLevel && (
                    <Badge variant="secondary">{details.experienceLevel}</Badge>
                  )}
                  <Badge
                    variant={details.status === "Open" ? "default" : "outline"}
                  >
                    {details.status}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Desktop Apply Button */}
        <Card className="hidden lg:block">
          <CardContent className="pt-6">
            <Button
              onClick={handleApply}
              className="w-full"
              size="lg"
              disabled={details.status !== "Open" || !eligibile.isEligible}
            >
              {details.status === "Open" ? "Apply Now" : "Applications Closed"}
            </Button>
            {details.applicationDeadline && (
              <p className="text-sm text-muted-foreground text-center mt-3">
                Apply before {formatDate(details.applicationDeadline)}
                <span className="text-red-600 block mt-1">
                  {!eligibile.isEligible ? 'Not Eligible': ''}
                </span>
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="description" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Description</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <span className="hidden sm:inline">Timeline</span>
          </TabsTrigger>
          <TabsTrigger value="eligibility" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Eligibility</span>
          </TabsTrigger>
        </TabsList>

        {/* Job Description Tab */}
        <TabsContent value="description" className="space-y-6 mt-6">
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

          {details.skills && details.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {details.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Salary</p>
                  <p className="text-sm text-muted-foreground">
                    {formatSalary(
                      details.salaryRange?.min,
                      details.salaryRange?.max,
                      details.salaryRange?.currency,
                    )}
                  </p>
                </div>
              </div>

              {details.experienceRange &&
                (details.experienceRange.min ||
                  details.experienceRange.max) && (
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Experience</p>
                        <p className="text-sm text-muted-foreground">
                          {details.experienceRange.min &&
                            details.experienceRange.max
                            ? `${details.experienceRange.min} - ${details.experienceRange.max} years`
                            : `${details.experienceRange.min || details.experienceRange.max} years`}
                        </p>
                      </div>
                    </div>
                  )}

              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Openings</p>
                  <p className="text-sm text-muted-foreground">
                    {details.openings}{" "}
                    {details.openings === 1 ? "position" : "positions"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Posted On</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(details.postedAt)}
                  </p>
                </div>
              </div>

              {details.viewsCount > 0 && (
                <div className="flex items-start gap-3">
                  <Eye className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Views</p>
                    <p className="text-sm text-muted-foreground">
                      {details.viewsCount}{" "}
                      {details.viewsCount === 1 ? "view" : "views"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hiring Timeline Tab */}
        {/* TODO: Improve timeline */}
        <TabsContent value="timeline" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Interview Process</CardTitle>
            </CardHeader>
            <CardContent>
              {details.interviewProcess ? (
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {details.interviewProcess}
                </p>
              ) : (
                <p className="text-muted-foreground">
                  No interview process details available.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Important Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Posted On</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(details.postedAt)}
                  </p>
                </div>
              </div>

              {details.applicationDeadline && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Application Deadline</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(details.applicationDeadline)}
                    </p>
                  </div>
                </div>
              )}

              {details.expiresAt && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Job Expires On</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(details.expiresAt)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {details.applicationsCount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Application Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total Applications
                  </span>
                  <span className="text-sm font-medium">
                    {details.applicationsCount}
                  </span>
                </div>
                {details.shortlistedCount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Shortlisted
                    </span>
                    <span className="text-sm font-medium">
                      {details.shortlistedCount}
                    </span>
                  </div>
                )}
                {details.hiredCount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Hired</span>
                    <span className="text-sm font-medium">
                      {details.hiredCount}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Eligibility Tab */}
        <TabsContent value="eligibility" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Experience Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {details.experienceRange &&
                (details.experienceRange.min ||
                  details.experienceRange.max) && (
                    <div className="flex items-start gap-3">
                      {details.experienceRange.min <
                        user.totalExperienceDuration ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">Years of Experience</p>
                        <p className="text-sm text-muted-foreground">
                          {details.experienceRange.min &&
                            details.experienceRange.max
                            ? `${details.experienceRange.min} - ${details.experienceRange.max} years`
                            : `${details.experienceRange.min || details.experienceRange.max} years`}
                        </p>
                      </div>
                    </div>
                  )}
            </CardContent>
          </Card>

          {details.skills && details.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {details.skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {user.resume?.skills.includes(skill) ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <span className="text-sm">{skill}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Alert>
            <AlertDescription>
              Make sure you meet these eligibility criteria before applying. The
              recruiter will review your profile against these requirements.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      {/* Mobile Fixed Apply Button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50">
        <Button
          onClick={handleApply}
          className="w-full"
          size="lg"
          disabled={details.status != "Open" || !eligibile.isEligible}
        >
          {details.status === "Open" ? "Apply Now" : "Applications Closed"}
        </Button>
        {details.applicationDeadline && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Apply before {formatDate(details.applicationDeadline)}
            <span className="text-red-600 block mt-1">
              {!eligibile.isEligible ? 'Not Eligible': ''}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
