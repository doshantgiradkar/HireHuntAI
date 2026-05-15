"use client";

import { useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  Target,
  Clock,
  Award,
  AlertCircle,
  FileText,
  BarChart3,
  Activity,
  CheckCircle,
  XCircle,
  MinusCircle,
  RefreshCw,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

import { useHeader } from "@/store/user.store";
import { useRecruiterStore } from "@/store/recruiter.store";

// Chart colour palette that respects shadcn CSS variables
const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

// Themed tooltip styles that override recharts defaults
const tooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "var(--radius)",
    color: "hsl(var(--popover-foreground))",
    fontSize: "12px",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    padding: "8px 12px",
  },
  itemStyle: {
    color: "hsl(var(--popover-foreground))",
  },
  labelStyle: {
    color: "hsl(var(--muted-foreground))",
    fontWeight: 500,
    marginBottom: 4,
  },
  cursor: { fill: "hsl(var(--muted))", opacity: 0.5 },
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-10 w-full max-w-lg rounded-xl" />
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AnalyticsReportsPage() {
  const setTitle = useHeader((state) => state.setTitle);

  const analyticsData = useRecruiterStore((s) => s.analyticsData);
  const analyticsLoading = useRecruiterStore((s) => s.analyticsLoading);
  const analyticsError = useRecruiterStore((s) => s.analyticsError);
  const analyticsFilters = useRecruiterStore((s) => s.analyticsFilters);
  const setAnalyticsFilters = useRecruiterStore((s) => s.setAnalyticsFilters);
  const fetchAnalyticsData = useRecruiterStore((s) => s.fetchAnalyticsData);
  const exportAnalyticsReport = useRecruiterStore(
    (s) => s.exportAnalyticsReport,
  );

  useEffect(() => {
    setTitle("Analytics & Reports");
    fetchAnalyticsData();
  }, [setTitle, fetchAnalyticsData]);

  // ── Destructure API data with safe defaults ────────────────────────────────
  const keyMetrics = analyticsData?.keyMetrics ?? {};
  const hiringFunnel = analyticsData?.hiringFunnel ?? [];
  const candidateFlowTrend = analyticsData?.candidateFlowTrend ?? [];
  const timeToHireData = analyticsData?.timeToHireData ?? [];
  const sourcePerformance = analyticsData?.sourcePerformance ?? [];
  const aiScoreDistribution = analyticsData?.aiScoreDistribution ?? [];
  const interviewSuccessRate = analyticsData?.interviewSuccessRate ?? [];
  const recruiterPerformance = analyticsData?.recruiterPerformance ?? [];
  const skillGap = analyticsData?.skillGap ?? [];
  const topJobs = analyticsData?.topJobs ?? [];
  const criticalSkillGaps = skillGap.filter((s) => s.gap > 5);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (analyticsLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <AnalyticsSkeleton />
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (analyticsError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load analytics</AlertTitle>
          <AlertDescription>{analyticsError}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => fetchAnalyticsData()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 bg-background p-4 md:p-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analytics &amp; Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Track hiring performance, spot bottlenecks, and act on trends.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export data
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Export data set</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => exportAnalyticsReport("full")}>
              <FileText className="mr-2 h-4 w-4" />
              Full analytics data (CSV)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportAnalyticsReport("funnel")}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Hiring funnel data (CSV)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => exportAnalyticsReport("recruiter")}
            >
              <Users className="mr-2 h-4 w-4" />
              Job performance data (CSV)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportAnalyticsReport("skills")}>
              <Award className="mr-2 h-4 w-4" />
              Skill gap analysis (CSV)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
             <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
             Filter data
           </CardTitle>
         </CardHeader>
         <CardContent>
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            {/* Date range */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select
                value={analyticsFilters.dateRange}
                onValueChange={(v) => setAnalyticsFilters({ dateRange: v })}
              >
                <SelectTrigger className="w-full min-w-44 sm:w-44" aria-label="Date range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                  <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                  <SelectItem value="last-year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department / title filter */}
            <Select
              value={analyticsFilters.department}
              onValueChange={(v) => setAnalyticsFilters({ department: v })}
            >
              <SelectTrigger className="w-full min-w-44 sm:w-44" aria-label="Department">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
              </SelectContent>
            </Select>

            {/* Location filter */}
            <Select
              value={analyticsFilters.location}
              onValueChange={(v) => setAnalyticsFilters({ location: v })}
            >
              <SelectTrigger className="w-full min-w-44 sm:w-44" aria-label="Location">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="onsite">Onsite</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => fetchAnalyticsData()}
              disabled={analyticsLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Update data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Key Metrics Overview ────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Candidates
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(keyMetrics.totalCandidates ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">
                {keyMetrics.hiredInPeriod ?? 0} hired
              </span>
              <span className="ml-1">this period</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {keyMetrics.activeJobs ?? 0}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <Activity className="h-3 w-3 mr-1" />
              <span>Currently open</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Time to Hire
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {keyMetrics.avgTimeToHire ?? "N/A"}{" "}
              {keyMetrics.avgTimeToHire ? "days" : ""}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {(keyMetrics.avgTimeToHire ?? 30) <= 30 ? (
                <>
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  <span className="text-green-600">Within target</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                  <span className="text-red-600">Above 30-day target</span>
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {keyMetrics.conversionRate ?? 0}%
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">Applied → Hired</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto p-1">
          <TabsTrigger className="min-h-10 whitespace-nowrap" value="funnel">Hiring Funnel</TabsTrigger>
          <TabsTrigger className="min-h-10 whitespace-nowrap" value="sources">Source Attribution</TabsTrigger>
          <TabsTrigger className="min-h-10 whitespace-nowrap" value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger className="min-h-10 whitespace-nowrap" value="jobs">Job Performance</TabsTrigger>
          <TabsTrigger className="min-h-10 whitespace-nowrap" value="skills">Skill Analysis</TabsTrigger>
          <TabsTrigger className="min-h-10 whitespace-nowrap" value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* ── Hiring Funnel ──────────────────────────────────────────────── */}
        <TabsContent value="funnel" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Hiring Funnel Overview</CardTitle>
                  <CardDescription>
                    Number of candidates at each hiring stage
                  </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={hiringFunnel}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip
                      contentStyle={tooltipStyle.contentStyle}
                      itemStyle={tooltipStyle.itemStyle}
                      labelStyle={tooltipStyle.labelStyle}
                      cursor={tooltipStyle.cursor}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stage Conversion Rates</CardTitle>
                <CardDescription>
                    Share of candidates who move to the next stage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {hiringFunnel.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No funnel data for this period.
                  </p>
                ) : (
                  hiringFunnel.map((stage, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{stage.stage}</span>
                        <span className="text-muted-foreground">
                          {stage.conversion}% ({stage.count})
                        </span>
                      </div>
                      <Progress value={stage.conversion} />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Candidate flow trend */}
          <Card>
            <CardHeader>
              <CardTitle>Candidate Flow Over Time</CardTitle>
              <CardDescription>
                  Weekly movement through hiring stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              {candidateFlowTrend.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-12">
                    No weekly trend data for this period.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={candidateFlowTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip
                      contentStyle={tooltipStyle.contentStyle}
                      itemStyle={tooltipStyle.itemStyle}
                      labelStyle={tooltipStyle.labelStyle}
                      cursor={tooltipStyle.cursor}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="applied"
                      stackId="1"
                      stroke={COLORS[0]}
                      fill={COLORS[0]}
                    />
                    <Area
                      type="monotone"
                      dataKey="shortlisted"
                      stackId="1"
                      stroke={COLORS[1]}
                      fill={COLORS[1]}
                    />
                    <Area
                      type="monotone"
                      dataKey="interviewed"
                      stackId="1"
                      stroke={COLORS[2]}
                      fill={COLORS[2]}
                    />
                    <Area
                      type="monotone"
                      dataKey="hired"
                      stackId="1"
                      stroke={COLORS[3]}
                      fill={COLORS[3]}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Interview success rates */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Success Rates</CardTitle>
              <CardDescription>
                  Outcomes by interview type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Interview Type</TableHead>
                    <TableHead>Passed</TableHead>
                    <TableHead>Failed</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviewSuccessRate.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        No interview outcomes for this period.
                      </TableCell>
                    </TableRow>
                  ) : (
                    interviewSuccessRate.map((interview, index) => {
                      const total = interview.passed + interview.failed;
                      const rate =
                        total > 0
                          ? ((interview.passed / total) * 100).toFixed(1)
                          : "0.0";
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {interview.type}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              {interview.passed}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <XCircle className="h-4 w-4 mr-2 text-red-600" />
                              {interview.failed}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MinusCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                              {interview.pending}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{rate}%</Badge>
                          </TableCell>
                          <TableCell>
                            <Progress
                              value={parseFloat(rate)}
                              className="w-24"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Source Attribution ─────────────────────────────────────────── */}
        <TabsContent value="sources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Source Performance</CardTitle>
                <CardDescription>
                   Candidates and hires by source channel
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sourcePerformance.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-12">
                    No source performance data for this period.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sourcePerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        contentStyle={tooltipStyle.contentStyle}
                        itemStyle={tooltipStyle.itemStyle}
                        labelStyle={tooltipStyle.labelStyle}
                        cursor={tooltipStyle.cursor}
                      />
                      <Legend />
                      <Bar dataKey="candidates" fill={COLORS[0]} />
                      <Bar dataKey="hired" fill={COLORS[1]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion by Source</CardTitle>
                <CardDescription>
                   Hire rate by source channel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sourcePerformance.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No source conversion data for this period.
                    </p>
                  ) : (
                    sourcePerformance.map((source, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{source.name}</span>
                          <span className="text-muted-foreground">
                            {source.hired} / {source.candidates} (
                            {source.conversionRate}%)
                          </span>
                        </div>
                        <Progress value={source.conversionRate} />
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Source Analytics</CardTitle>
              <CardDescription>
                 Detailed source metrics for this period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source / Work Mode</TableHead>
                    <TableHead>Candidates</TableHead>
                    <TableHead>Hired</TableHead>
                    <TableHead>Conversion Rate</TableHead>
                    <TableHead>Quality</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sourcePerformance.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-8"
                      >
                        No source metrics for this period.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sourcePerformance.map((source, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {source.name}
                        </TableCell>
                        <TableCell>{source.candidates}</TableCell>
                        <TableCell>{source.hired}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {source.conversionRate}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {source.conversionRate > 10 ? (
                            <Badge>Excellent</Badge>
                          ) : source.conversionRate > 5 ? (
                            <Badge variant="outline">Good</Badge>
                          ) : (
                            <Badge variant="secondary">Average</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── AI Insights ───────────────────────────────────────────────────── */}
        <TabsContent value="ai-insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>AI Score Distribution</CardTitle>
                <CardDescription>
                  Distribution of resume match scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                {aiScoreDistribution.every((b) => b.count === 0) ? (
                  <p className="text-sm text-muted-foreground text-center py-12">
                    No AI score data for this period.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={aiScoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip
                        contentStyle={tooltipStyle.contentStyle}
                        itemStyle={tooltipStyle.itemStyle}
                        labelStyle={tooltipStyle.labelStyle}
                        cursor={tooltipStyle.cursor}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Score Distribution by Range</CardTitle>
                <CardDescription>
                   Share of candidates in each AI score range
                </CardDescription>
              </CardHeader>
              <CardContent>
                {aiScoreDistribution.every((b) => b.count === 0) ? (
                  <p className="text-sm text-muted-foreground text-center py-12">
                    No score distribution to visualize.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={aiScoreDistribution.filter((b) => b.count > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ range, percent }) =>
                          `${range}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        dataKey="count"
                      >
                        {aiScoreDistribution
                          .filter((b) => b.count > 0)
                          .map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                      </Pie>
                      <Tooltip
                        contentStyle={tooltipStyle.contentStyle}
                        itemStyle={tooltipStyle.itemStyle}
                        labelStyle={tooltipStyle.labelStyle}
                        cursor={tooltipStyle.cursor}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI Interview Performance</CardTitle>
              <CardDescription>
                 Performance metrics for AI interviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Total AI Interviews
                  </p>
                  <p className="text-3xl font-bold">
                    {(
                      keyMetrics.totalInterviewCandidates ?? 0
                    ).toLocaleString()}
                  </p>
                  <Progress
                    value={Math.min(
                      ((keyMetrics.totalInterviewCandidates ?? 0) /
                        Math.max(keyMetrics.totalCandidates ?? 1, 1)) *
                        100,
                      100,
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                   Share of total candidates screened by AI
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Average AI Score
                  </p>
                  <p className="text-3xl font-bold">
                    {keyMetrics.avgAiScore ?? "N/A"}
                  </p>
                  <Progress value={keyMetrics.avgAiScore ?? 0} />
                  <p className="text-xs text-muted-foreground">Out of 100</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">AI Pass Rate</p>
                  <p className="text-3xl font-bold">
                    {keyMetrics.aiPassRate ?? 0}%
                  </p>
                  <Progress value={keyMetrics.aiPassRate ?? 0} />
                  <p className="text-xs text-muted-foreground">
                    Candidates advanced
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Job Performance ───────────────────────────────────────────────── */}
        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Performance Leaderboard</CardTitle>
              <CardDescription>
                  Metrics per job posting for this period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Hired</TableHead>
                    <TableHead>Avg AI Score</TableHead>
                    <TableHead>Conversion</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recruiterPerformance.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-8"
                      >
                        No job performance metrics for this period.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recruiterPerformance.map((job, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge variant={index === 0 ? "default" : "outline"}>
                            #{index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {job.jobTitle}
                        </TableCell>
                        <TableCell>{job.totalApps}</TableCell>
                        <TableCell>{job.hired}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            {job.avgScore}/100
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{job.conversionRate}%</Badge>
                        </TableCell>
                        <TableCell>
                          {job.conversionRate >= 10 ? (
                            <Badge>Excellent</Badge>
                          ) : job.conversionRate >= 5 ? (
                            <Badge variant="outline">Good</Badge>
                          ) : (
                            <Badge variant="secondary">Average</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Top Jobs summary cards */}
          {topJobs.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3">
              {topJobs.slice(0, 3).map((job, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {i === 0
                        ? "Most Applied"
                        : i === 1
                          ? "Runner-up"
                          : "Third Place"}
                    </CardTitle>
                    <CardDescription>{job.title}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">
                        {job.applicationsCount ?? 0} applications
                      </p>
                      <p className="text-muted-foreground">
                        {job.hiredCount ?? 0} hired
                      </p>
                      <p className="text-muted-foreground">{job.location}</p>
                      <Badge variant="outline" className="mt-1">
                        {job.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Skill Analysis ─────────────────────────────────────────────────── */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skill Gap Analysis</CardTitle>
              <CardDescription>
                 Required skills compared with available candidate skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              {skillGap.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-12">
                    No skill data for this period.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={skillGap}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="skill" />
                    <YAxis />
                    <Tooltip
                      contentStyle={tooltipStyle.contentStyle}
                      itemStyle={tooltipStyle.itemStyle}
                      labelStyle={tooltipStyle.labelStyle}
                      cursor={tooltipStyle.cursor}
                    />
                    <Legend />
                    <Bar dataKey="required" fill={COLORS[0]} name="Required" />
                    <Bar
                      dataKey="available"
                      fill={COLORS[1]}
                      name="Available"
                    />
                    <Bar dataKey="gap" fill={COLORS[2]} name="Gap" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Skill Breakdown</CardTitle>
              <CardDescription>
                 Skill availability and hiring gaps by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Skill</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Gap</TableHead>
                    <TableHead>Fill Rate</TableHead>
                    <TableHead>Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {skillGap.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        No skill gap metrics for this period.
                      </TableCell>
                    </TableRow>
                  ) : (
                    skillGap.map((skill, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {skill.skill}
                        </TableCell>
                        <TableCell>{skill.required}</TableCell>
                        <TableCell>{skill.available}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{skill.gap}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={skill.fillRate} className="w-24" />
                            <span className="text-sm text-muted-foreground">
                              {skill.fillRate}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {skill.gap > 12 ? (
                            <Badge variant="destructive">Critical</Badge>
                          ) : skill.gap > 5 ? (
                            <Badge>High</Badge>
                          ) : (
                            <Badge variant="outline">Medium</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {criticalSkillGaps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  <AlertCircle className="inline-block mr-2 h-5 w-5" />
                  Recommended Actions
                </CardTitle>
                <CardDescription>
                  Suggested steps to close the highest-priority gaps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {skillGap
                    .filter((s) => s.gap > 0)
                    .slice(0, 4)
                    .map((s, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        <Badge variant={s.gap > 12 ? "destructive" : "default"}>
                          {s.gap > 12 ? "Critical" : "High"}
                        </Badge>
                        <div className="space-y-1 flex-1">
                          <p className="text-sm font-medium">
                            Expand {s.skill} sourcing channels
                          </p>
                          <p className="text-xs text-muted-foreground">
                             {s.gap} open position{s.gap > 1 ? "s" : ""} unfilled,
                             consider widening the candidate pool or adjusting
                             requirements.
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Trends ────────────────────────────────────────────────────────── */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time to Hire Trend</CardTitle>
              <CardDescription>
                Average days from application to hire over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timeToHireData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-12">
                  No time-to-hire trend yet. This appears after hires are
                  recorded.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeToHireData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      contentStyle={tooltipStyle.contentStyle}
                      itemStyle={tooltipStyle.itemStyle}
                      labelStyle={tooltipStyle.labelStyle}
                      cursor={tooltipStyle.cursor}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avgDays"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Actual (days)"
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="5 5"
                      name="Target (30d)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Hiring Velocity</CardTitle>
                <CardDescription>Candidates hired this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Hired this period
                    </span>
                    <span className="text-2xl font-bold">
                      {keyMetrics.hiredInPeriod ?? 0}
                    </span>
                  </div>
                  <Progress
                    value={Math.min((keyMetrics.hiredInPeriod ?? 0) * 4, 100)}
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Total applications: {keyMetrics.totalApplications ?? 0}
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {keyMetrics.conversionRate ?? 0}% rate
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Screening Quality</CardTitle>
                <CardDescription>
                  Average AI match score across all candidates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Average Score
                    </span>
                    <span className="text-2xl font-bold">
                      {keyMetrics.avgAiScore ?? "N/A"}/100
                    </span>
                  </div>
                  <Progress value={keyMetrics.avgAiScore ?? 0} />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>AI pass rate: {keyMetrics.aiPassRate ?? 0}%</span>
                    <span className="flex items-center text-green-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                       AI-supported screening
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Predictive insights */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Activity className="inline-block mr-2 h-5 w-5" />
                Insights
              </CardTitle>
              <CardDescription>
                 Key observations based on current metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  {(keyMetrics.avgTimeToHire ?? 30) <= 30 ? (
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  )}
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">
                      {(keyMetrics.avgTimeToHire ?? 30) <= 30
                        ? "Time-to-hire within target"
                        : "Time-to-hire above target"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Current average: {keyMetrics.avgTimeToHire ?? "N/A"} days.
                      Target: 30 days.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">AI screening active</p>
                    <p className="text-xs text-muted-foreground">
                      {keyMetrics.totalInterviewCandidates ?? 0} candidates
                      processed with an average score of{" "}
                      {keyMetrics.avgAiScore ?? 0}/100.
                    </p>
                  </div>
                </div>

                {criticalSkillGaps.length > 0 && (
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium">Skill gaps detected</p>
                      <p className="text-xs text-muted-foreground">
                        {criticalSkillGaps.length} skill
                        {criticalSkillGaps.length > 1
                          ? "s"
                          : ""}{" "}
                        have a significant supply gap, consider expanding
                        sourcing channels.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
