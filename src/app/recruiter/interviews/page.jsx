"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Eye,
  Plus,
  Award,
  TrendingUp,
  Activity,
  Briefcase,
  Loader2,
  ExternalLink,
  FileText,
  User,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// -- Helpers --

function getSessionStatus(session) {
  const now = new Date();
  const endDate = session.endAt ? new Date(session.endAt) : null;
  const isDateActive = endDate ? now < endDate : false;
  
  if (isDateActive || session.inProgressCount > 0) return "active";
  if (endDate && now >= endDate) return "completed";
  if (session.completedCount === session.totalCandidates && session.totalCandidates > 0) return "completed";
  return "scheduled";
}

function getSessionStatusBadge(status) {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          <Activity className="h-3 w-3 mr-1 animate-pulse" />
          Active
        </Badge>
      );
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    case "scheduled":
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Calendar className="h-3 w-3 mr-1" />
          Scheduled
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function getCandidateStatusBadge(status) {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    case "in-progress":
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
          <Activity className="h-3 w-3 mr-1 animate-pulse" />
          In Progress
        </Badge>
      );
    case "scheduled":
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
          <Clock className="h-3 w-3 mr-1" />
          Scheduled
        </Badge>
      );
    default:
      return <Badge variant="secondary" className="text-xs">{status}</Badge>;
  }
}

// -- Main Component --

export default function InterviewsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSession, setSelectedSession] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/recruiter/interviews");
      if (!response.ok) throw new Error("Failed to fetch interviews");
      const data = await response.json();
      setSessions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleManageCandidates = (session) => {
    setSelectedSession(session);
    setDialogOpen(true);
  };

  // -- Filtering --
  const filteredSessions = sessions.filter((s) => {
    const jobTitle = s.jobDetails?.title || "";
    const companyName = s.jobDetails?.companyName || "";
    const matchesSearch =
      jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      companyName.toLowerCase().includes(searchQuery.toLowerCase());

    const sessionStatus = getSessionStatus(s);
    const matchesFilter = filterStatus === "all" || sessionStatus === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const activeSessions = filteredSessions.filter((s) => getSessionStatus(s) !== "completed");
  const completedSessions = filteredSessions.filter((s) => getSessionStatus(s) === "completed");

  // -- Stats --
  const totalCandidatesAll = sessions.reduce((a, s) => a + (s.totalCandidates || 0), 0);
  const completedCandidatesAll = sessions.reduce((a, s) => a + (s.completedCount || 0), 0);
  const inProgressAll = sessions.reduce((a, s) => a + (s.inProgressCount || 0), 0);

  const stats = {
    totalSessions: sessions.length,
    activeSessions: sessions.filter((s) => getSessionStatus(s) === "active").length,
    totalCandidates: totalCandidatesAll,
    completedCandidates: completedCandidatesAll,
    completionRate: totalCandidatesAll > 0
      ? Math.round((completedCandidatesAll / totalCandidatesAll) * 100)
      : 0,
    inProgress: inProgressAll,
  };

  // -- Loading / Error --
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold">Error</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchSessions}>Retry</Button>
      </div>
    );
  }

  // -- Render --
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interview Sessions</h1>
          <p className="text-muted-foreground mt-1">
            Manage interview rounds by job and track shortlisted candidates
          </p>
        </div>
        <Button onClick={() => router.push("/recruiter/jobs")}>
          <Briefcase className="mr-2 h-4 w-4" />
          View Jobs
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeSessions} currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCandidates}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Shortlisted across all jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <Progress value={stats.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Candidates currently interviewing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-75">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by job title or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchSessions}>
              <Activity className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active & Upcoming ({activeSessions.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedSessions.length})
          </TabsTrigger>
        </TabsList>

        {/* Active & Upcoming Sessions */}
        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeSessions.length === 0 ? (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                No active or upcoming interview sessions.
              </div>
            ) : (
              activeSessions.map((session) => (
                <SessionCard
                  key={session._id}
                  session={session}
                  onManage={handleManageCandidates}
                  onViewJob={() => router.push(`/recruiter/jobs/${session.jobId}`)}
                />
              ))
            )}
          </div>
        </TabsContent>

        {/* Completed Sessions */}
        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {completedSessions.length === 0 ? (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                No completed interview sessions yet.
              </div>
            ) : (
              completedSessions.map((session) => (
                <SessionCard
                  key={session._id}
                  session={session}
                  onManage={handleManageCandidates}
                  onViewJob={() => router.push(`/recruiter/jobs/${session.jobId}`)}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Candidate Management Dialog */}
      <CandidateDialog
        session={selectedSession}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        router={router}
      />
    </div>
  );
}

// -- Session Card Component --

function SessionCard({ session, onManage, onViewJob }) {
  const jobTitle = session.jobDetails?.title || "Unknown Job";
  const companyName = session.jobDetails?.companyName || "Unknown Company";
  const status = getSessionStatus(session);
  const progressPercent =
    session.totalCandidates > 0
      ? Math.round((session.completedCount / session.totalCandidates) * 100)
      : 0;

  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col">
      <CardContent className="pt-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-lg truncate">{jobTitle}</h3>
            <p className="text-sm text-muted-foreground truncate">{companyName}</p>
          </div>
          {getSessionStatusBadge(status)}
        </div>

        {/* Progress */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Candidate Progress</span>
            <span className="font-medium">
              {session.completedCount}/{session.totalCandidates}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold">{session.totalCandidates}</p>
            <p className="text-[10px] text-muted-foreground">Shortlisted</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-blue-700">{session.inProgressCount}</p>
            <p className="text-[10px] text-muted-foreground">In Progress</p>
          </div>
          <div className="bg-green-50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-green-700">{session.completedCount}</p>
            <p className="text-[10px] text-muted-foreground">Completed</p>
          </div>
        </div>

        {/* Schedule Info */}
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">
              {new Date(session.startAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">
              {new Date(session.startAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onManage(session)}
          >
            <Users className="mr-2 h-4 w-4" />
            Manage Candidates
          </Button>
          <Button size="sm" variant="outline" onClick={onViewJob}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// -- Candidate Management Dialog --

function CandidateDialog({ session, open, onOpenChange, router }) {
  if (!session) return null;

  const jobTitle = session.jobDetails?.title || "Unknown Job";
  const companyName = session.jobDetails?.companyName || "Unknown Company";
  const location = session.jobDetails?.location || "";
  const candidates = session.candidates || [];
  const scheduledCount = session.totalCandidates - session.completedCount - session.inProgressCount;
  const progressPercent =
    session.totalCandidates > 0
      ? Math.round((session.completedCount / session.totalCandidates) * 100)
      : 0;
  const status = getSessionStatus(session);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[95vw] h-[95vh] max-h-[95vh] flex flex-col p-0">
        {/* Sticky Header */}
        <div className="px-6 pt-6 pb-4 border-b">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Briefcase className="h-5 w-5 shrink-0" />
                  <span className="truncate">{jobTitle}</span>
                </DialogTitle>
                <DialogDescription className="mt-1">
                  {companyName}
                  {location ? ` — ${location}` : ""}
                </DialogDescription>
              </div>
              {getSessionStatusBadge(status)}
            </div>
          </DialogHeader>

          {/* Session Info Bar */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(session.startAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {new Date(session.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {" — "}
                {new Date(session.endAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{session.totalCandidates} candidates</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span>{progressPercent}% complete</span>
            </div>
          </div>

          {/* Progress + Metric Pills */}
          <div className="mt-4 space-y-2">
            <Progress value={progressPercent} className="h-2" />
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200 text-xs font-normal">
                <Clock className="h-3 w-3 mr-1" />
                {scheduledCount} Scheduled
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-xs font-normal">
                <Activity className="h-3 w-3 mr-1" />
                {session.inProgressCount} In Progress
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200 text-xs font-normal">
                <CheckCircle className="h-3 w-3 mr-1" />
                {session.completedCount} Completed
              </Badge>
            </div>
          </div>
        </div>

        {/* Scrollable Candidate List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">
            Shortlisted Candidates
          </h4>

          {candidates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No candidates found for this session.
            </div>
          ) : (
            <div className="space-y-3">
              {candidates.map((candidate, idx) => {
                const matchScore = candidate.eligibility?.matchScore ?? candidate.matchScore;
                const initials = candidate.fullName
                  ? candidate.fullName.split(" ").map((n) => n[0]).join("").toUpperCase()
                  : null;

                return (
                  <div
                    key={candidate.candidateId || idx}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/30 transition-colors"
                  >
                    {/* Avatar */}
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="text-xs font-medium">
                        {initials || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>

                    {/* Name + Email */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {candidate.fullName || "Unknown Candidate"}
                      </p>
                      {candidate.email && (
                        <p className="text-xs text-muted-foreground truncate">
                          {candidate.email}
                        </p>
                      )}
                    </div>

                    {/* Match Score */}
                    <div className="hidden sm:flex flex-col items-center shrink-0 w-16">
                      <span className={`text-sm font-bold ${
                        matchScore >= 80 ? "text-green-600" : matchScore >= 50 ? "text-yellow-600" : "text-muted-foreground"
                      }`}>
                        {matchScore != null ? `${matchScore}%` : "—"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">Match</span>
                    </div>

                    {/* Interview Score (only for completed) */}
                    <div className="hidden sm:flex flex-col items-center shrink-0 w-16">
                      {candidate.status === "completed" ? (
                        <>
                          <span className={`text-sm font-bold ${
                            candidate.interviewScore >= 70
                              ? "text-green-600"
                              : candidate.interviewScore >= 40
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}>
                            {candidate.interviewScore}
                          </span>
                          <span className="text-[10px] text-muted-foreground">Score</span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-muted-foreground">—</span>
                          <span className="text-[10px] text-muted-foreground">Score</span>
                        </>
                      )}
                    </div>

                    {/* Status */}
                    <div className="shrink-0">
                      {getCandidateStatusBadge(candidate.status)}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {candidate.resumeUrl && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          title="View Resume"
                          onClick={() => window.open(candidate.resumeUrl, "_blank")}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                      {candidate.status === "completed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs"
                          onClick={() => router.push(`/recruiter/candidate/${candidate.candidateId}`)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Results
                        </Button>
                      )}
                      {candidate.status === "in-progress" && (
                        <Badge className="bg-blue-600 text-white text-xs cursor-default h-8 px-3">
                          <Activity className="h-3 w-3 mr-1 animate-pulse" />
                          Live
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t bg-muted/20">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/recruiter/jobs/${session.jobId}`)}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View Job Posting
          </Button>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
