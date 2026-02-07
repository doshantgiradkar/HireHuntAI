"use client";

import { useState } from "react";
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
  PieChart as PieChartIcon,
  Activity,
  CheckCircle,
  XCircle,
  MinusCircle,
} from "lucide-react";

// Shadcn UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

// Mock Data - Replace with actual API calls
const hiringFunnelData = [
  { stage: "Applied", count: 1247, conversion: 100 },
  { stage: "Screened", count: 892, conversion: 71.5 },
  { stage: "AI Interview", count: 634, conversion: 50.8 },
  { stage: "Technical", count: 423, conversion: 33.9 },
  { stage: "Final", count: 187, conversion: 15.0 },
  { stage: "Offered", count: 94, conversion: 7.5 },
  { stage: "Hired", count: 76, conversion: 6.1 },
];

const timeToHireData = [
  { month: "Aug", avgDays: 42, target: 30 },
  { month: "Sep", avgDays: 38, target: 30 },
  { month: "Oct", avgDays: 35, target: 30 },
  { month: "Nov", avgDays: 32, target: 30 },
  { month: "Dec", avgDays: 29, target: 30 },
  { month: "Jan", avgDays: 28, target: 30 },
];

const sourcePerformanceData = [
  { name: "LinkedIn", candidates: 487, hired: 32, cost: 12400 },
  { name: "Indeed", candidates: 356, hired: 24, cost: 8900 },
  { name: "Referrals", candidates: 234, hired: 28, cost: 3500 },
  { name: "Company Site", candidates: 170, hired: 19, cost: 0 },
  { name: "Agencies", candidates: 89, hired: 12, cost: 24000 },
];

const skillGapData = [
  { skill: "React/Next.js", required: 45, available: 28, gap: 17 },
  { skill: "Python/ML", required: 32, available: 19, gap: 13 },
  { skill: "DevOps", required: 28, available: 18, gap: 10 },
  { skill: "Product Management", required: 15, available: 8, gap: 7 },
  { skill: "Data Engineering", required: 22, available: 16, gap: 6 },
];

const recruiterPerformanceData = [
  { name: "Sarah Chen", jobsClosed: 24, candidates: 156, avgScore: 8.7, timeToHire: 26 },
  { name: "Mike Johnson", jobsClosed: 21, candidates: 142, avgScore: 8.4, timeToHire: 28 },
  { name: "Emma Davis", jobsClosed: 19, candidates: 134, avgScore: 8.8, timeToHire: 25 },
  { name: "Alex Kumar", jobsClosed: 17, candidates: 128, avgScore: 8.2, timeToHire: 31 },
  { name: "Lisa Wang", jobsClosed: 16, candidates: 119, avgScore: 8.5, timeToHire: 27 },
];

const aiScoreDistribution = [
  { range: "90-100", count: 87 },
  { range: "80-89", count: 234 },
  { range: "70-79", count: 412 },
  { range: "60-69", count: 298 },
  { range: "50-59", count: 156 },
  { range: "0-49", count: 60 },
];

const candidateFlowTrend = [
  { week: "Week 1", applied: 312, screened: 224, interviewed: 156, hired: 18 },
  { week: "Week 2", applied: 289, screened: 203, interviewed: 142, hired: 15 },
  { week: "Week 3", applied: 334, screened: 245, interviewed: 167, hired: 21 },
  { week: "Week 4", applied: 298, screened: 218, interviewed: 151, hired: 19 },
];

const interviewSuccessRate = [
  { type: "AI Interview", passed: 634, failed: 258, pending: 0 },
  { type: "Technical", passed: 423, failed: 211, pending: 34 },
  { type: "Behavioral", passed: 387, failed: 156, pending: 28 },
  { type: "Final Round", passed: 187, failed: 98, pending: 12 },
];

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function AnalyticsReportsPage() {
  const [dateRange, setDateRange] = useState("last-6-months");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const handleExport = (reportType) => {
    // Implement export logic
    console.log(`Exporting ${reportType} report...`);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-1">
            Deep insights into recruitment performance, trends, and metrics
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Reports
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Export Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport("full")}>
              <FileText className="mr-2 h-4 w-4" />
              Full Analytics Report (PDF)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("funnel")}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Hiring Funnel Data (CSV)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("recruiter")}>
              <Users className="mr-2 h-4 w-4" />
              Recruiter Performance (Excel)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("skills")}>
              <Award className="mr-2 h-4 w-4" />
              Skill Gap Analysis (CSV)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-45">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                  <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                  <SelectItem value="last-year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-45">
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

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="india">India</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">+12.3%</span>
              <span className="ml-1">vs last period</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
              <span className="text-red-600">-8.2%</span>
              <span className="ml-1">vs last period</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time to Hire</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28 days</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">6.7% faster</span>
              <span className="ml-1">vs target (30d)</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6.1%</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">+0.8%</span>
              <span className="ml-1">vs last period</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="funnel">Hiring Funnel</TabsTrigger>
          <TabsTrigger value="sources">Source Attribution</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="recruiters">Recruiter Performance</TabsTrigger>
          <TabsTrigger value="skills">Skill Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends & Forecasts</TabsTrigger>
        </TabsList>

        {/* Hiring Funnel Tab */}
        <TabsContent value="funnel" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Hiring Funnel Overview</CardTitle>
                <CardDescription>Candidate progression through hiring stages</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={hiringFunnelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stage Conversion Rates</CardTitle>
                <CardDescription>Percentage of candidates advancing per stage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {hiringFunnelData.map((stage, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{stage.stage}</span>
                      <span className="text-muted-foreground">
                        {stage.conversion}% ({stage.count})
                      </span>
                    </div>
                    <Progress value={stage.conversion} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Candidate Flow Over Time</CardTitle>
              <CardDescription>Weekly progression through hiring stages</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={candidateFlowTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="applied"
                    stackId="1"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                  />
                  <Area
                    type="monotone"
                    dataKey="screened"
                    stackId="1"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2))"
                  />
                  <Area
                    type="monotone"
                    dataKey="interviewed"
                    stackId="1"
                    stroke="hsl(var(--chart-3))"
                    fill="hsl(var(--chart-3))"
                  />
                  <Area
                    type="monotone"
                    dataKey="hired"
                    stackId="1"
                    stroke="hsl(var(--chart-4))"
                    fill="hsl(var(--chart-4))"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interview Success Rates</CardTitle>
              <CardDescription>Pass/fail breakdown by interview type</CardDescription>
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
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviewSuccessRate.map((interview, index) => {
                    const total = interview.passed + interview.failed;
                    const rate = ((interview.passed / total) * 100).toFixed(1);
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{interview.type}</TableCell>
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
                          <Progress value={parseFloat(rate)} className="w-24" />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Source Attribution Tab */}
        <TabsContent value="sources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Source Performance</CardTitle>
                <CardDescription>Candidates and hires by source channel</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sourcePerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="candidates" fill="hsl(var(--chart-1))" />
                    <Bar dataKey="hired" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Per Hire by Source</CardTitle>
                <CardDescription>Recruitment cost efficiency analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sourcePerformanceData.map((source, index) => {
                    const costPerHire = source.cost / source.hired;
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{source.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {source.hired} hires from {source.candidates} candidates
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">
                            ${costPerHire.toFixed(0)}
                          </p>
                          <p className="text-xs text-muted-foreground">per hire</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Source Analytics</CardTitle>
              <CardDescription>Complete breakdown of source performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Candidates</TableHead>
                    <TableHead>Hired</TableHead>
                    <TableHead>Conversion Rate</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Cost/Hire</TableHead>
                    <TableHead>ROI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sourcePerformanceData.map((source, index) => {
                    const conversionRate = ((source.hired / source.candidates) * 100).toFixed(1);
                    const costPerHire = source.cost / source.hired;
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{source.name}</TableCell>
                        <TableCell>{source.candidates}</TableCell>
                        <TableCell>{source.hired}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{conversionRate}%</Badge>
                        </TableCell>
                        <TableCell>${source.cost.toLocaleString()}</TableCell>
                        <TableCell>${costPerHire.toFixed(0)}</TableCell>
                        <TableCell>
                          {conversionRate > 10 ? (
                            <Badge>Excellent</Badge>
                          ) : conversionRate > 5 ? (
                            <Badge variant="outline">Good</Badge>
                          ) : (
                            <Badge variant="secondary">Average</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai-insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>AI Score Distribution</CardTitle>
                <CardDescription>Resume scoring breakdown across all candidates</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={aiScoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Score Distribution by Range</CardTitle>
                <CardDescription>Percentage breakdown of AI scores</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={aiScoreDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ range, percent }) =>
                        `${range}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="hsl(var(--primary))"
                      dataKey="count"
                    >
                      {aiScoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI Interview Performance</CardTitle>
              <CardDescription>Success metrics for AI-conducted interviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total AI Interviews</p>
                  <p className="text-3xl font-bold">892</p>
                  <Progress value={71} />
                  <p className="text-xs text-muted-foreground">71% of screened candidates</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="text-3xl font-bold">74.2</p>
                  <Progress value={74} />
                  <p className="text-xs text-muted-foreground">Out of 100</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Pass Rate</p>
                  <p className="text-3xl font-bold">71.1%</p>
                  <Progress value={71} />
                  <p className="text-xs text-muted-foreground">634 candidates advanced</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Accuracy & Insights</CardTitle>
              <CardDescription>How AI predictions correlate with final hiring outcomes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Prediction Accuracy</p>
                    <p className="text-xs text-muted-foreground">
                      AI scores vs final hire decisions
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">87.3%</p>
                    <Badge variant="outline" className="mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +2.1%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">False Positive Rate</p>
                    <p className="text-xs text-muted-foreground">
                      High scores that didn't convert to hires
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">8.7%</p>
                    <Badge variant="outline" className="mt-1">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      -1.3%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Time Saved</p>
                    <p className="text-xs text-muted-foreground">
                      Recruiter hours saved by AI screening
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">1,247h</p>
                    <Badge variant="outline" className="mt-1">
                      This period
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recruiter Performance Tab */}
        <TabsContent value="recruiters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recruiter Leaderboard</CardTitle>
              <CardDescription>Performance metrics for all recruiters this period</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Recruiter</TableHead>
                    <TableHead>Jobs Closed</TableHead>
                    <TableHead>Candidates Managed</TableHead>
                    <TableHead>Avg Score</TableHead>
                    <TableHead>Avg Time to Hire</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recruiterPerformanceData.map((recruiter, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant={index === 0 ? "default" : "outline"}>
                          #{index + 1}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{recruiter.name}</TableCell>
                      <TableCell>{recruiter.jobsClosed}</TableCell>
                      <TableCell>{recruiter.candidates}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          {recruiter.avgScore}/10
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {recruiter.timeToHire}d
                        </div>
                      </TableCell>
                      <TableCell>
                        {recruiter.avgScore >= 8.5 && recruiter.timeToHire <= 27 ? (
                          <Badge>Excellent</Badge>
                        ) : recruiter.avgScore >= 8.0 ? (
                          <Badge variant="outline">Good</Badge>
                        ) : (
                          <Badge variant="secondary">Average</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Performer</CardTitle>
                <CardDescription>Best overall metrics this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    <p className="font-semibold">{recruiterPerformanceData[0].name}</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      {recruiterPerformanceData[0].jobsClosed} jobs closed
                    </p>
                    <p className="text-muted-foreground">
                      Score: {recruiterPerformanceData[0].avgScore}/10
                    </p>
                    <p className="text-muted-foreground">
                      Avg: {recruiterPerformanceData[0].timeToHire} days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Fastest Hires</CardTitle>
                <CardDescription>Lowest average time to hire</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <p className="font-semibold">{recruiterPerformanceData[2].name}</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      {recruiterPerformanceData[2].timeToHire} days average
                    </p>
                    <p className="text-muted-foreground">
                      {recruiterPerformanceData[2].jobsClosed} jobs closed
                    </p>
                    <Badge variant="outline">16% faster than target</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Highest Quality</CardTitle>
                <CardDescription>Best candidate satisfaction score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    <p className="font-semibold">{recruiterPerformanceData[2].name}</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      {recruiterPerformanceData[2].avgScore}/10 rating
                    </p>
                    <p className="text-muted-foreground">
                      {recruiterPerformanceData[2].candidates} candidates
                    </p>
                    <Badge variant="outline">Top rated</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Skill Analysis Tab */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skill Gap Analysis</CardTitle>
              <CardDescription>
                Current demand vs available talent pool
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={skillGapData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="skill" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="required" fill="hsl(var(--chart-1))" name="Required" />
                  <Bar dataKey="available" fill="hsl(var(--chart-2))" name="Available" />
                  <Bar dataKey="gap" fill="hsl(var(--chart-3))" name="Gap" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Skill Breakdown</CardTitle>
              <CardDescription>Comprehensive analysis of skill availability</CardDescription>
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
                  {skillGapData.map((skill, index) => {
                    const fillRate = ((skill.available / skill.required) * 100).toFixed(0);
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{skill.skill}</TableCell>
                        <TableCell>{skill.required}</TableCell>
                        <TableCell>{skill.available}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{skill.gap}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={parseInt(fillRate)} className="w-24" />
                            <span className="text-sm text-muted-foreground">{fillRate}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {skill.gap > 12 ? (
                            <Badge variant="destructive">Critical</Badge>
                          ) : skill.gap > 8 ? (
                            <Badge>High</Badge>
                          ) : (
                            <Badge variant="outline">Medium</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <AlertCircle className="inline-block mr-2 h-5 w-5" />
                Recommended Actions
              </CardTitle>
              <CardDescription>Strategies to address skill gaps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Badge variant="destructive">Critical</Badge>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">
                      Expand React/Next.js sourcing channels
                    </p>
                    <p className="text-xs text-muted-foreground">
                      17 positions unfilled - Consider bootcamp partnerships and remote hiring
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Badge>High</Badge>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">
                      Launch ML/Python talent pipeline
                    </p>
                    <p className="text-xs text-muted-foreground">
                      13 positions unfilled - Reach out to university programs
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Badge>High</Badge>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">Increase DevOps recruiting budget</p>
                    <p className="text-xs text-muted-foreground">
                      10 positions unfilled - Competitive market requires higher compensation
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends & Forecasts Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time to Hire Trend</CardTitle>
              <CardDescription>Average days from application to hire over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeToHireData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avgDays"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Actual"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="5 5"
                    name="Target"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Hiring Velocity</CardTitle>
                <CardDescription>Positions filled per month trend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Month</span>
                    <span className="text-2xl font-bold">24</span>
                  </div>
                  <Progress value={80} />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Target: 30</span>
                    <span className="flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      On track
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality of Hire Index</CardTitle>
                <CardDescription>Composite score of hire quality metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Score</span>
                    <span className="text-2xl font-bold">8.4/10</span>
                  </div>
                  <Progress value={84} />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Last period: 8.2</span>
                    <span className="flex items-center text-green-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +2.4%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                <Activity className="inline-block mr-2 h-5 w-5" />
                Predictive Insights
              </CardTitle>
              <CardDescription>AI-powered forecasts based on current trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">
                      Time to hire trending down
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Based on current velocity, expect 25-day average by next month (17% improvement)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">Increased demand for Engineering roles</p>
                    <p className="text-xs text-muted-foreground">
                      Projected 35% increase in open positions next quarter - prepare sourcing strategy
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">LinkedIn source quality improving</p>
                    <p className="text-xs text-muted-foreground">
                      Conversion rate up 18% month-over-month - consider increasing investment
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}