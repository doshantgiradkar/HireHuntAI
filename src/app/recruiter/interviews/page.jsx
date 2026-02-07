"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  User,
  Users,
  FileText,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronRight,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Award,
  TrendingUp,
  Activity,
  PlayCircle,
  PauseCircle,
  MoreVertical,
  Send,
  ArrowUpRight,
  Briefcase,
  Mail,
  ExternalLink,
} from "lucide-react";

// Shadcn UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock Data
const upcomingInterviews = [
  {
    id: 1,
    candidateName: "Sarah Johnson",
    candidateEmail: "sarah.j@email.com",
    position: "Senior Frontend Developer",
    type: "Technical Round",
    date: "2026-02-08",
    time: "10:00 AM",
    duration: 60,
    mode: "video",
    interviewers: ["Mike Chen", "Lisa Wang"],
    status: "scheduled",
    resumeScore: 87,
    avatar: null,
  },
  {
    id: 2,
    candidateName: "David Martinez",
    candidateEmail: "david.m@email.com",
    position: "Product Manager",
    type: "Behavioral Round",
    date: "2026-02-08",
    time: "02:30 PM",
    duration: 45,
    mode: "video",
    interviewers: ["Emma Davis"],
    status: "scheduled",
    resumeScore: 92,
    avatar: null,
  },
  {
    id: 3,
    candidateName: "Priya Patel",
    candidateEmail: "priya.p@email.com",
    position: "Data Scientist",
    type: "AI Interview",
    date: "2026-02-09",
    time: "11:00 AM",
    duration: 30,
    mode: "ai",
    interviewers: ["AI Assistant"],
    status: "scheduled",
    resumeScore: 85,
    avatar: null,
  },
  {
    id: 4,
    candidateName: "James Wilson",
    candidateEmail: "james.w@email.com",
    position: "DevOps Engineer",
    type: "Final Round",
    date: "2026-02-09",
    time: "03:00 PM",
    duration: 90,
    mode: "in-person",
    interviewers: ["Alex Kumar", "Sarah Chen", "Mike Johnson"],
    status: "scheduled",
    resumeScore: 89,
    avatar: null,
  },
  {
    id: 5,
    candidateName: "Emily Brown",
    candidateEmail: "emily.b@email.com",
    position: "UX Designer",
    type: "Portfolio Review",
    date: "2026-02-10",
    time: "09:30 AM",
    duration: 60,
    mode: "video",
    interviewers: ["Lisa Wang"],
    status: "scheduled",
    resumeScore: 91,
    avatar: null,
  },
];

const completedInterviews = [
  {
    id: 101,
    candidateName: "Robert Chen",
    candidateEmail: "robert.c@email.com",
    position: "Backend Engineer",
    type: "Technical Round",
    date: "2026-02-05",
    time: "02:00 PM",
    duration: 60,
    mode: "video",
    interviewers: ["Mike Chen"],
    status: "completed",
    result: "passed",
    overallScore: 8.5,
    technicalScore: 9,
    communicationScore: 8,
    cultureFitScore: 8.5,
    feedback: "Strong technical skills, excellent problem-solving approach. Good communication.",
    resumeScore: 86,
    avatar: null,
  },
  {
    id: 102,
    candidateName: "Lisa Anderson",
    candidateEmail: "lisa.a@email.com",
    position: "Marketing Manager",
    type: "Behavioral Round",
    date: "2026-02-05",
    time: "10:00 AM",
    duration: 45,
    mode: "video",
    interviewers: ["Emma Davis"],
    status: "completed",
    result: "passed",
    overallScore: 9.0,
    technicalScore: 8.5,
    communicationScore: 9.5,
    cultureFitScore: 9,
    feedback: "Exceptional communication skills. Great cultural fit. Ready for final round.",
    resumeScore: 93,
    avatar: null,
  },
  {
    id: 103,
    candidateName: "Tom Harrison",
    candidateEmail: "tom.h@email.com",
    position: "Sales Executive",
    type: "AI Interview",
    date: "2026-02-04",
    time: "03:30 PM",
    duration: 30,
    mode: "ai",
    interviewers: ["AI Assistant"],
    status: "completed",
    result: "failed",
    overallScore: 5.5,
    technicalScore: 6,
    communicationScore: 5.5,
    cultureFitScore: 5,
    feedback: "Struggled with scenario-based questions. Communication needs improvement.",
    resumeScore: 72,
    avatar: null,
  },
  {
    id: 104,
    candidateName: "Maria Garcia",
    candidateEmail: "maria.g@email.com",
    position: "Full Stack Developer",
    type: "Technical Round",
    date: "2026-02-03",
    time: "11:00 AM",
    duration: 60,
    mode: "video",
    interviewers: ["Alex Kumar", "Sarah Chen"],
    status: "completed",
    result: "passed",
    overallScore: 8.0,
    technicalScore: 8.5,
    communicationScore: 7.5,
    cultureFitScore: 8,
    feedback: "Solid technical foundation. Good problem-solving skills. Recommend for next round.",
    resumeScore: 88,
    avatar: null,
  },
  {
    id: 105,
    candidateName: "Kevin Lee",
    candidateEmail: "kevin.l@email.com",
    position: "Product Designer",
    type: "Portfolio Review",
    date: "2026-02-02",
    time: "01:00 PM",
    duration: 60,
    mode: "in-person",
    interviewers: ["Lisa Wang"],
    status: "completed",
    result: "on-hold",
    overallScore: 7.0,
    technicalScore: 7.5,
    communicationScore: 7,
    cultureFitScore: 6.5,
    feedback: "Good portfolio but lacks enterprise experience. Put on hold for junior position.",
    resumeScore: 79,
    avatar: null,
  },
];

const interviewStats = {
  totalScheduled: 12,
  completedToday: 3,
  upcomingToday: 2,
  totalCompleted: 47,
  passRate: 68,
  avgScore: 7.8,
  cancelledRate: 5,
};

export default function InterviewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  const getInterviewModeIcon = (mode) => {
    switch (mode) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      case "in-person":
        return <MapPin className="h-4 w-4" />;
      case "ai":
        return <Activity className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  const getResultBadge = (result) => {
    switch (result) {
      case "passed":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Passed
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case "on-hold":
        return (
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" />
            On Hold
          </Badge>
        );
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const handleViewDetails = (interview) => {
    setSelectedInterview(interview);
    setShowDetailsDialog(true);
  };

  const handleAddFeedback = (interview) => {
    setSelectedInterview(interview);
    setShowFeedbackDialog(true);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interviews</h1>
          <p className="text-muted-foreground mt-1">
            Manage interviews, view candidate performance, and track feedback
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Interview
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviewStats.upcomingToday}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {interviewStats.completedToday} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviewStats.totalScheduled}</div>
            <p className="text-xs text-muted-foreground mt-1">Next 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviewStats.passRate}%</div>
            <Progress value={interviewStats.passRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviewStats.avgScore}/10</div>
            <p className="text-xs text-muted-foreground mt-1">All completed interviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by candidate name, position, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Interview Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ai">AI Interview</SelectItem>
                <SelectItem value="technical">Technical Round</SelectItem>
                <SelectItem value="behavioral">Behavioral Round</SelectItem>
                <SelectItem value="final">Final Round</SelectItem>
                <SelectItem value="portfolio">Portfolio Review</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingInterviews.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedInterviews.length})
          </TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        {/* Upcoming Interviews Tab */}
        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4">
            {upcomingInterviews.map((interview) => (
              <Card key={interview.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={interview.avatar} />
                        <AvatarFallback>
                          {interview.candidateName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {interview.candidateName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {interview.position}
                            </p>
                          </div>
                          <Badge variant="outline">{interview.type}</Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{interview.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {interview.time} ({interview.duration}m)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getInterviewModeIcon(interview.mode)}
                            <span className="capitalize">{interview.mode}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            <span>AI Score: {interview.resumeScore}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div className="flex flex-wrap gap-1">
                            {interview.interviewers.map((interviewer, idx) => (
                              <Badge key={idx} variant="secondary">
                                {interviewer}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            View Resume
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </Button>
                          {interview.mode === "video" && (
                            <Button size="sm">
                              <Video className="mr-2 h-4 w-4" />
                              Join Meeting
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Interview
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="mr-2 h-4 w-4" />
                                Reschedule
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Send className="mr-2 h-4 w-4" />
                                Send Reminder
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Cancel Interview
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Completed Interviews Tab */}
        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {completedInterviews.map((interview) => (
              <Card key={interview.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={interview.avatar} />
                        <AvatarFallback>
                          {interview.candidateName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              {interview.candidateName}
                              {getResultBadge(interview.result)}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {interview.position}
                            </p>
                          </div>
                          <Badge variant="outline">{interview.type}</Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{interview.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{interview.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getInterviewModeIcon(interview.mode)}
                            <span className="capitalize">{interview.mode}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{interview.interviewers.join(", ")}</span>
                          </div>
                        </div>

                        {/* Performance Scores */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Overall Score</p>
                            <p className={`text-lg font-bold ${getScoreColor(interview.overallScore)}`}>
                              {interview.overallScore}/10
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Technical</p>
                            <p className={`text-lg font-bold ${getScoreColor(interview.technicalScore)}`}>
                              {interview.technicalScore}/10
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Communication</p>
                            <p className={`text-lg font-bold ${getScoreColor(interview.communicationScore)}`}>
                              {interview.communicationScore}/10
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Culture Fit</p>
                            <p className={`text-lg font-bold ${getScoreColor(interview.cultureFitScore)}`}>
                              {interview.cultureFitScore}/10
                            </p>
                          </div>
                        </div>

                        {/* Feedback Preview */}
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <p className="text-sm text-muted-foreground">
                              {interview.feedback}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(interview)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Full Details
                          </Button>
                          <Button size="sm" variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            View Resume
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Export Report
                          </Button>
                          {interview.result === "passed" && (
                            <Button size="sm">
                              <ArrowUpRight className="mr-2 h-4 w-4" />
                              Move to Next Round
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Calendar View Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interview Calendar</CardTitle>
              <CardDescription>All scheduled interviews by date</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Group by date */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-lg">
                      <span className="text-xs font-medium">FEB</span>
                      <span className="text-2xl font-bold">08</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Saturday, February 08</h3>
                      <p className="text-sm text-muted-foreground">2 interviews scheduled</p>
                    </div>
                  </div>

                  <div className="ml-20 space-y-3">
                    {upcomingInterviews
                      .filter((i) => i.date === "2026-02-08")
                      .map((interview) => (
                        <div
                          key={interview.id}
                          className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{interview.time}</span>
                          </div>
                          <Separator orientation="vertical" className="h-12" />
                          <div className="flex-1">
                            <p className="font-medium">{interview.candidateName}</p>
                            <p className="text-sm text-muted-foreground">
                              {interview.type} - {interview.position}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getInterviewModeIcon(interview.mode)}
                            <Badge variant="outline">{interview.duration}m</Badge>
                          </div>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-muted text-foreground rounded-lg border">
                      <span className="text-xs font-medium">FEB</span>
                      <span className="text-2xl font-bold">09</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Sunday, February 09</h3>
                      <p className="text-sm text-muted-foreground">2 interviews scheduled</p>
                    </div>
                  </div>

                  <div className="ml-20 space-y-3">
                    {upcomingInterviews
                      .filter((i) => i.date === "2026-02-09")
                      .map((interview) => (
                        <div
                          key={interview.id}
                          className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{interview.time}</span>
                          </div>
                          <Separator orientation="vertical" className="h-12" />
                          <div className="flex-1">
                            <p className="font-medium">{interview.candidateName}</p>
                            <p className="text-sm text-muted-foreground">
                              {interview.type} - {interview.position}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getInterviewModeIcon(interview.mode)}
                            <Badge variant="outline">{interview.duration}m</Badge>
                          </div>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-muted text-foreground rounded-lg border">
                      <span className="text-xs font-medium">FEB</span>
                      <span className="text-2xl font-bold">10</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Monday, February 10</h3>
                      <p className="text-sm text-muted-foreground">1 interview scheduled</p>
                    </div>
                  </div>

                  <div className="ml-20 space-y-3">
                    {upcomingInterviews
                      .filter((i) => i.date === "2026-02-10")
                      .map((interview) => (
                        <div
                          key={interview.id}
                          className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{interview.time}</span>
                          </div>
                          <Separator orientation="vertical" className="h-12" />
                          <div className="flex-1">
                            <p className="font-medium">{interview.candidateName}</p>
                            <p className="text-sm text-muted-foreground">
                              {interview.type} - {interview.position}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getInterviewModeIcon(interview.mode)}
                            <Badge variant="outline">{interview.duration}m</Badge>
                          </div>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Interview Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Interview Details</DialogTitle>
            <DialogDescription>
              Complete performance evaluation and feedback
            </DialogDescription>
          </DialogHeader>

          {selectedInterview && (
            <div className="space-y-6">
              {/* Candidate Info */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedInterview.avatar} />
                  <AvatarFallback className="text-lg">
                    {selectedInterview.candidateName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {selectedInterview.candidateName}
                  </h3>
                  <p className="text-muted-foreground">{selectedInterview.position}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedInterview.candidateEmail}
                  </p>
                </div>
                {selectedInterview.result && getResultBadge(selectedInterview.result)}
              </div>

              <Separator />

              {/* Interview Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Interview Type</Label>
                  <p className="font-medium">{selectedInterview.type}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Date & Time</Label>
                  <p className="font-medium">
                    {selectedInterview.date} at {selectedInterview.time}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Duration</Label>
                  <p className="font-medium">{selectedInterview.duration} minutes</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Mode</Label>
                  <p className="font-medium capitalize">{selectedInterview.mode}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">AI Resume Score</Label>
                  <p className="font-medium">{selectedInterview.resumeScore}/100</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Interviewers</Label>
                  <p className="font-medium">{selectedInterview.interviewers.join(", ")}</p>
                </div>
              </div>

              {selectedInterview.overallScore && (
                <>
                  <Separator />

                  {/* Performance Scores */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Performance Evaluation</h4>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Overall Score</Label>
                          <span className={`font-bold ${getScoreColor(selectedInterview.overallScore)}`}>
                            {selectedInterview.overallScore}/10
                          </span>
                        </div>
                        <Progress value={selectedInterview.overallScore * 10} />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Technical Skills</Label>
                          <span className={`font-bold ${getScoreColor(selectedInterview.technicalScore)}`}>
                            {selectedInterview.technicalScore}/10
                          </span>
                        </div>
                        <Progress value={selectedInterview.technicalScore * 10} />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Communication</Label>
                          <span className={`font-bold ${getScoreColor(selectedInterview.communicationScore)}`}>
                            {selectedInterview.communicationScore}/10
                          </span>
                        </div>
                        <Progress value={selectedInterview.communicationScore * 10} />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Culture Fit</Label>
                          <span className={`font-bold ${getScoreColor(selectedInterview.cultureFitScore)}`}>
                            {selectedInterview.cultureFitScore}/10
                          </span>
                        </div>
                        <Progress value={selectedInterview.cultureFitScore * 10} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Feedback */}
                  <div className="space-y-2">
                    <Label>Interview Feedback</Label>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm">{selectedInterview.feedback}</p>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  Close
                </Button>
                {selectedInterview.result === "passed" && (
                  <Button>
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Move to Next Round
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}