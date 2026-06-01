"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Briefcase,
  Building,
  CheckCircle,
  AlertCircle,
  CalendarDays,
  FileText,
  MessageCircle,
} from "lucide-react";
import ViewFeedbackDialog from "@/components/view-feedback-dialog";
import axios from "axios";
import { ErrorPopup } from "@/components/error_popup";

export default function InterviewsPage() {
  const router = useRouter();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackDialog, setFeedbackDialog] = useState({
    open: false,
    feedback: null,
    jobTitle: null,
  });

  const [error, setError] = useState({
    open: false,
    title: "",
    message: "",
  });

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/interview`);
      setInterviews(response.data);
    } catch (err) {
      console.error("Error fetching interviews:", err);
      setError({
        open: true,
        title: "Alert!",
        message: "Error fetching interviews",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  // Logic to separate interviews based on your enum: ['scheduled', 'in-progress', 'completed']
  const upcomingInterviews = interviews.filter(
    (i) => i.candidates[0].status !== "completed",
  );
  const completedInterviews = interviews.filter(
    (i) => i.candidates[0].status === "completed",
  );

  // Get the most recent upcoming interview for the sidebar
  const nextInterview =
    upcomingInterviews.length > 0 ? upcomingInterviews[0] : null;

  const getStatusBadge = (status) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge
            variant="default"
            className="bg-blue-100 text-blue-800 hover:bg-blue-100"
          >
            <Clock className="w-3 h-3 mr-1" /> Scheduled
          </Badge>
        );
      case "in-progress":
        return (
          <Badge
            variant="outline"
            className="text-amber-700 border-amber-200 bg-amber-50"
          >
            <AlertCircle className="w-3 h-3 mr-1" /> Live Now
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="text-green-700 border-green-200 bg-green-50"
          >
            <CheckCircle className="w-3 h-3 mr-1" /> Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getDaysUntil = (dateStr) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days < 0 ? 0 : days;
  };

  const handleViewFeedback = (interview) => {
    setFeedbackDialog({
      open: true,
      feedback: interview.candidates[0]?.feedback || null,
      jobTitle: interview.job.title,
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse h-40 bg-muted/20" />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <ErrorPopup
        open={error.open}
        message={error.message}
        title={error.title}
        onOpenChange={(open) => setError((prev) => ({ ...prev, open }))}
      />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Interview Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage and prepare for your upcoming interviews
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Upcoming Interviews
                </p>
                <p className="text-3xl font-bold">
                  {upcomingInterviews.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Next Interview In
                </p>
                <p className="text-3xl font-bold">
                  {nextInterview
                    ? `${getDaysUntil(nextInterview.startAt)} days`
                    : "Not Scheduled"}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold">
                  {completedInterviews.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming">
                  Upcoming ({upcomingInterviews.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({completedInterviews.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4 mt-4">
                {upcomingInterviews.map((interview) => (
                  <Card
                    key={interview._id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">
                              {interview.job.title}
                            </CardTitle>
                            {getStatusBadge(interview.status)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <CardDescription className="text-base font-medium">
                              {interview.job.companyName}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pb-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />{" "}
                            {formatDate(interview.startAt)}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />{" "}
                            {formatTime(interview.startAt)}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />{" "}
                            {interview.job.location} ({interview.job.workMode})
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="capitalize">
                              {interview.job.experienceLevel} Level
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-blue-700 border-blue-200"
                            >
                              Match Score: {interview.candidates[0]?.matchScore}
                              %
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="border-t pt-4 flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        {getDaysUntil(interview.startAt) === 0
                          ? "Today"
                          : `${getDaysUntil(interview.startAt)} days left`}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/candidate/jobs/${interview._id}`)
                          }
                        >
                          Details
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            router.push(`/interviews/${interview._id}`)
                          }
                        >
                          <Video className="mr-2 h-4 w-4" /> Join
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4 mt-4">
                {completedInterviews.map((interview) => (
                  <Card key={interview._id} className="opacity-80">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">
                              {interview.job.title}
                            </CardTitle>
                            {getStatusBadge(interview.status)}
                          </div>
                          <p className="font-medium">
                            {interview.job.companyName}
                          </p>
                          <div className="text-sm text-muted-foreground">
                            Completed on {formatDate(interview.startAt)}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewFeedback(interview)}
                          className="gap-2"
                        >
                          <MessageCircle className="h-4 w-4" />
                          View Feedback
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {nextInterview && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Clock className="h-5 w-5" /> Next Up
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={nextInterview.job.companyLogo} />
                      <AvatarFallback>
                        {nextInterview.job.companyName.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{nextInterview.job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {nextInterview.job.companyName}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span className="font-medium">
                        {formatTime(nextInterview.startAt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mode</span>
                      <span className="font-medium capitalize">
                        {nextInterview.job.workMode}
                      </span>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() =>
                      router.push(`/interviews/${nextInterview._id}`)
                    }
                  >
                    <Video className="mr-2 h-4 w-4" /> Join Interview
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" /> Preparation
                  Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold shrink-0">
                      1
                    </div>
                    <span>
                      Review the{" "}
                      <b>
                        {nextInterview?.job.skills.join(", ") ||
                          "required skills"}
                      </b>{" "}
                      in the job description.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-[10px] font-bold shrink-0">
                      2
                    </div>
                    <span>Prepare specific examples for your project.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* View Feedback Dialog */}
      <ViewFeedbackDialog
        open={feedbackDialog.open}
        onOpenChange={(open) => setFeedbackDialog({ ...feedbackDialog, open })}
        feedback={feedbackDialog.feedback}
        jobTitle={feedbackDialog.jobTitle}
      />
    </div>
  );
}
