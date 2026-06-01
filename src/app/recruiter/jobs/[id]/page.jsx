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
  Mail,
  Award,
  Download,
  TicketCheck,
  Edit,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import DeleteConfirmationDialog from "@/components/delete-confirmation-model"; // Import the component
import { useHeader } from "@/store/user.store";
import RecruiterAIPanel from "@/components/recruiter-ai-panel";
import RecruiterAIToggle from "@/components/recruiter-ai-toggle";
import { useRecruiterAI } from "@/hooks/useRecruiterAI";
import { use } from "react";
import ScheduleInterviewDialog from "@/components/schedule-interview-dialog";
import HireDialog from "@/components/hire-dialog";

export default function Page({ params }) {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [candidatesError, setCandidatesError] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [hireDialogOpen, setHireDialogOpen] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);
  const [hireSuccess, setHireSuccess] = useState(false);

  const router = useRouter();
  const jobId = use(params).id;
  const setTitle = useHeader((state) => state.setTitle);
  const { isOpen, openPanel, closePanel } = useRecruiterAI("job");

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

    fetchCandidates();
    fetchJobDetails();
  }, [jobId]);

  useEffect(() => {
    if (scheduleSuccess) {
      const timer = setTimeout(() => setScheduleSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [scheduleSuccess]);

  const fetchCandidates = async () => {
    setCandidatesLoading(true);
    setCandidatesError(null);
    try {
      const res = await axios.get(`/api/application/candidates/${jobId}`);
      setApplications(res.data.applications || []);
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

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

  const formatStatusLabel = (status) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusVariant = (status) => {
    const variants = {
      applied: "secondary",
      shortlisted: "default",
      interview_scheduled: "outline",
      hired: "default",
      rejected: "destructive",
    };
    return variants[status] || "secondary";
  };

  const buildApplicantsSummary = () => {
    if (!applications || applications.length === 0) return "";

    const summary = applications.map((app) => {
      const name = getCandidateName(app);
      const email = app.user?.email || "Unknown";
      const experience = app.candidate?.totalExperienceDuration || 0;
      const matchScore = app.eligibility?.matchScore || 0;
      const status = formatStatusLabel(app.status);
      const skills =
        app.candidate?.resume?.skills?.slice(0, 5).join(", ") ||
        "Not specified";

      return `- ${name} (${email}): ${experience}y exp, ${matchScore}% match, Status: ${status}, Top skills: ${skills}`;
    });

    return `Total applicants: ${applications.length}\n${summary.join("\n")}`;
  };

  const handleEdit = () => {
    router.push(`/recruiter/edit-job/${jobId}`);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(`/api/job/${jobId}`, {
        withCredentials: true,
      });
      setShowDeleteDialog(false);
      router.push("/recruiter/jobs");
    } catch (err) {
      console.log(err);
      setDeleting(false);
    }
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
      <Alert variant="destructive" className="max-w-6xl mx-auto mt-8">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!details) {
    return (
      <Alert className="max-w-6xl mx-auto mt-8">
        <AlertDescription>Job not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Card */}
        <Card className="mb-8">
          <CardHeader className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-6">
                {details.companyLogo ? (
                  <img
                    src={details.companyLogo}
                    alt={details.companyName}
                    className="w-20 h-20 rounded-xl object-cover border shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center border">
                    <Building2 className="h-10 w-10 text-primary" />
                  </div>
                )}

                <div className="flex-1 space-y-3">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                      {details.title}
                    </h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span className="text-lg">{details.companyName}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="font-normal">
                      <MapPin className="h-3 w-3 mr-1.5" />
                      {details.location}
                    </Badge>
                    <Badge variant="secondary" className="font-normal">
                      <Briefcase className="h-3 w-3 mr-1.5" />
                      {details.workMode}
                    </Badge>
                    <Badge variant="secondary" className="font-normal">
                      <Clock className="h-3 w-3 mr-1.5" />
                      {details.employmentType}
                    </Badge>
                    <Badge
                      variant={
                        details.status === "active" ? "default" : "outline"
                      }
                    >
                      {details.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Schedule, Edit, Delete, and AI Toggle Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setHireDialogOpen(true)}
                  className="cursor-pointer"
                  title="Hire a candidate now"
                >
                  <TicketCheck className="h-4 w-4 mr-2" />
                  Hire Now
                </Button>
                <Button
                  onClick={() => setScheduleDialogOpen(true)}
                  className="cursor-pointer"
                  title="Schedule interview for candidates"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Now
                </Button>
                <RecruiterAIToggle
                  onClick={() =>
                    openPanel({
                      job: details,
                      applications,
                      applicantsSummary: buildApplicantsSummary(),
                      stats: {
                        totalApplied: applications.length,
                        avgMatchScore:
                          applications.length > 0
                            ? Math.round(
                                applications.reduce(
                                  (sum, app) =>
                                    sum + (app.eligibility?.matchScore || 0),
                                  0,
                                ) / applications.length,
                              )
                            : 0,
                        shortlisted: applications.filter(
                          (app) => app.status === "shortlisted",
                        ).length,
                        interviewed: applications.filter(
                          (app) => app.status === "interview_scheduled",
                        ).length,
                        hired: applications.filter(
                          (app) => app.status === "hired",
                        ).length,
                        rejected: applications.filter(
                          (app) => app.status === "rejected",
                        ).length,
                      },
                    })
                  }
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleEdit}
                  className="h-10 w-10 cursor-pointer"
                  title="Edit job"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleDeleteClick}
                  className="h-10 w-10 cursor-pointer"
                  title="Delete job"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Salary Range</span>
                </div>
                <p className="text-base font-semibold">
                  {formatSalary(
                    details.salaryRange?.min,
                    details.salaryRange?.max,
                  )}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Openings</span>
                </div>
                <p className="text-base font-semibold">{details.openings}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>Views</span>
                </div>
                <p className="text-base font-semibold">
                  {details.viewsCount || 0}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Applications</span>
                </div>
                <p className="text-base font-semibold">
                  {details.applicationsCount || 0}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Success Alert */}
        {scheduleSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Interview session scheduled successfully. Candidates will be
              notified.
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Description</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <Timer className="h-4 w-4" />
              <span className="hidden sm:inline">Details</span>
            </TabsTrigger>
            <TabsTrigger value="candidates" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Candidates</span>
              {applications.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {applications.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Description Tab */}
          <TabsContent value="description" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>
                  What you'll be doing in this role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {details.description}
                </p>
              </CardContent>
            </Card>

            {details.skills?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                  <CardDescription>
                    Key competencies needed for this position
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {details.skills.map((skill, i) => (
                      <Badge key={i} variant="outline" className="font-normal">
                        <CheckCircle2 className="h-3 w-3 mr-1.5" />
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Timeline & Stats Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
                <CardDescription>
                  Complete details about this position
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Salary Range</p>
                        <p className="text-sm text-muted-foreground">
                          {formatSalary(
                            details.salaryRange?.min,
                            details.salaryRange?.max,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Number of Openings
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {details.openings}{" "}
                          {details.openings === 1 ? "position" : "positions"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Posted On</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(details.postedAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Eye className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Total Views</p>
                        <p className="text-sm text-muted-foreground">
                          {details.viewsCount || 0} views
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Total Applications
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {details.applicationsCount || 0} applications
                        </p>
                      </div>
                    </div>

                    {details.experienceLevel && (
                      <div className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            Experience Level
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {details.experienceLevel}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Candidates Tab */}
          <TabsContent value="candidates">
            {candidatesLoading ? (
              <Card>
                <CardContent className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
              </Card>
            ) : candidatesError ? (
              <Alert variant="destructive">
                <AlertDescription>{candidatesError}</AlertDescription>
              </Alert>
            ) : applications.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="rounded-full bg-muted p-6 mb-4">
                    <Users className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    No applications yet
                  </h3>
                  <p className="text-muted-foreground text-center max-w-sm">
                    When candidates apply for this position, they'll appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Applications ({applications.length})</CardTitle>
                  <CardDescription>
                    Review and manage candidate applications
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b bg-muted/50">
                        <tr className="text-sm">
                          <th className="text-left p-4 font-medium">
                            Candidate
                          </th>
                          <th className="text-left p-4 font-medium">Email</th>
                          <th className="text-left p-4 font-medium">
                            Match Score
                          </th>
                          <th className="text-left p-4 font-medium">
                            Experience
                          </th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">
                            Applied On
                          </th>
                          <th className="text-right p-4 font-medium">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {applications.map((app, idx) => (
                          <tr
                            key={app._id}
                            className={`border-b hover:bg-muted/50 transition-colors ${
                              idx === applications.length - 1
                                ? "border-b-0"
                                : ""
                            }`}
                          >
                            {/* Candidate */}
                            <td className="p-4">
                              <button
                                onClick={() =>
                                  router.push(
                                    `/recruiter/candidate/${app.candidateId}`,
                                  )
                                }
                                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                              >
                                <Avatar className="h-10 w-10 border">
                                  <AvatarImage src={app.user?.imageUrl} />
                                  <AvatarFallback className="text-sm">
                                    {getInitials(getCandidateName(app))}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="text-left">
                                  <p className="font-medium">
                                    {getCandidateName(app)}
                                  </p>
                                </div>
                              </button>
                            </td>

                            {/* Email */}
                            <td className="p-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate max-w-50">
                                  {app.user?.email}
                                </span>
                              </div>
                            </td>

                            {/* Match Score */}
                            <td className="p-4">
                              {app.eligibility?.matchScore ? (
                                <div className="flex items-center gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                        <div
                                          className="bg-primary h-full transition-all"
                                          style={{
                                            width: `${app.eligibility.matchScore}%`,
                                          }}
                                        />
                                      </div>
                                      <span className="text-sm font-medium min-w-[3ch]">
                                        {app.eligibility.matchScore}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  —
                                </span>
                              )}
                            </td>

                            {/* Experience */}
                            <td className="p-4">
                              {app.candidate?.totalExperienceDuration ? (
                                <div className="flex items-center gap-1.5 text-sm">
                                  <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                                  {app.candidate.totalExperienceDuration} years
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  —
                                </span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="p-4">
                              <Badge
                                variant={getStatusVariant(app.status)}
                                className="font-normal"
                              >
                                {formatStatusLabel(app.status)}
                              </Badge>
                            </td>

                            {/* Applied Date */}
                            <td className="p-4">
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(app.createdAt)}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="p-4">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    router.push(
                                      `/recruiter/applications/${app._id}`,
                                    )
                                  }
                                  className="cursor-pointer"
                                >
                                  View Details
                                </Button>

                                {app.resumeUrl && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      window.open(app.resumeUrl, "_blank")
                                    }
                                    className="cursor-pointer"
                                  >
                                    <Download className="h-4 w-4" />
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

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        deleting={deleting}
        title="Delete Job Post"
        description={`Deleting this job post will permanently remove it and all associated applications. This data cannot be recovered.`}
        itemName={details.title}
        itemDetails={{
          companyLogo: details.companyLogo,
          companyName: details.companyName,
          location: details.location,
          employmentType: details.employmentType,
          applicationsCount: details.applicationsCount || 0,
          status: details.status,
        }}
        itemType="job post"
        confirmButtonText="Delete Permanently"
        cancelButtonText="Cancel"
      />
      {/* Delete Confirmation Dialog */}
      {/* <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Delete Job Post
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  {details.companyLogo ? (
                    <img
                      src={details.companyLogo}
                      alt={details.companyName}
                      className="w-12 h-12 rounded-lg object-cover border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{details.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {details.companyName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Location:</span>
                    <p>{details.location}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Type:</span>
                    <p>{details.employmentType}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Applications:</span>
                    <p>{details.applicationsCount || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge
                      variant={
                        details.status === "active" ? "default" : "outline"
                      }
                      className="text-xs"
                    >
                      {details.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">
                    Warning: This action cannot be undone
                  </p>
                  <p className="text-sm mt-1">
                    Deleting this job post will permanently remove it and all
                    associated applications. This data cannot be recovered.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Permanently
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
      {/* AI Chatbot Panel */}
      <RecruiterAIPanel
        isOpen={isOpen}
        onClose={closePanel}
        contextData={{
          job: details,
          applications,
          applicantsSummary: buildApplicantsSummary(),
          stats: {
            totalApplied: applications.length,
            avgMatchScore:
              applications.length > 0
                ? Math.round(
                    applications.reduce(
                      (sum, app) => sum + (app.eligibility?.matchScore || 0),
                      0,
                    ) / applications.length,
                  )
                : 0,
            shortlisted: applications.filter(
              (app) => app.status === "shortlisted",
            ).length,
            interviewed: applications.filter(
              (app) => app.status === "interview_scheduled",
            ).length,
            hired: applications.filter((app) => app.status === "hired").length,
            rejected: applications.filter((app) => app.status === "rejected")
              .length,
          },
        }}
        pageType="job"
      />

      {/* Schedule Interview Dialog */}
      <ScheduleInterviewDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        jobId={jobId}
        applications={applications}
        onScheduleSuccess={() => {
          setScheduleSuccess(true);
          fetchCandidates();
        }}
      />

      <HireDialog
        open={hireDialogOpen}
        onOpenChange={setHireDialogOpen}
        jobId={jobId}
        applications={applications}
        onHireSuccess={() => {
          setHireSuccess(true);
          fetchCandidates();
        }}
      />
    </>
  );
}
