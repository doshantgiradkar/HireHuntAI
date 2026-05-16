"use client";

import { useEffect } from "react";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { useHeader } from "@/store/user.store";
import { useRecruiterStore } from "@/store/recruiter.store";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RecruiterAIPanel from "@/components/recruiter-ai-panel";
import RecruiterAIToggle from "@/components/recruiter-ai-toggle";
import { useRecruiterAI } from "@/hooks/useRecruiterAI";

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 py-4 md:gap-6 md:py-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
      {/* Chart */}
      <div className="px-4 lg:px-6">
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
      {/* Table */}
      <div className="px-4 lg:px-6">
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    </div>
  );
}

function TopJobsPanel({ jobs = [] }) {
  if (!jobs.length) return null;
  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Jobs</CardTitle>
          <CardDescription>
            Jobs ranked by total applications received
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {jobs.map((job, idx) => (
              <div
                key={job._id ?? idx}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{job.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {job.location} · {job.workMode}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums">
                    {job.applicationsCount ?? 0} apps
                  </span>
                  <Badge
                    variant={job.status === "Open" ? "default" : "outline"}
                  >
                    {job.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RecruiterDashboardPage() {
  const setTitle = useHeader((state) => state.setTitle);
  const { isOpen, contextData, openPanel, closePanel } = useRecruiterAI("dashboard");

  const dashboardData = useRecruiterStore((s) => s.dashboardData);
  const dashboardLoading = useRecruiterStore((s) => s.dashboardLoading);
  const dashboardError = useRecruiterStore((s) => s.dashboardError);
  const fetchDashboardData = useRecruiterStore((s) => s.fetchDashboardData);

  useEffect(() => {
    setTitle("Recruiter Dashboard");
    fetchDashboardData();
  }, []);

  if (dashboardLoading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load dashboard</AlertTitle>
          <AlertDescription className="mt-1">{dashboardError}</AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" onClick={fetchDashboardData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const summaryCards = dashboardData?.summaryCards ?? {};
  const applicationTrend = dashboardData?.applicationTrend ?? [];
  const recentJobs = dashboardData?.recentJobs ?? [];
  const topJobs = dashboardData?.topJobs ?? [];

  const tableData = recentJobs.map((job, i) => ({
    id: i + 1,
    header: job.title ?? "—",
    type: job.employmentType ?? job.workMode ?? "—",
    status: job.status ?? "—",
    target: String(job.openings ?? 0),
    limit: String(job.applicationsCount ?? 0),
    reviewer: job.location ?? "—",
  }));

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header with AI Toggle */}
          <div className="flex items-center justify-between px-4 lg:px-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Your recruiting metrics at a glance
              </p>
            </div>
            <RecruiterAIToggle
              onClick={() =>
                openPanel({
                  summaryCards,
                  topJobs,
                  applicationTrend,
                  recentJobs,
                })
              }
            />
          </div>

          {/* KPI summary cards */}
          <SectionCards data={summaryCards} />

          {/* Application activity chart */}
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive data={applicationTrend} />
          </div>

          {/* Recent jobs table */}
          <DataTable data={tableData} />

          {/* Top performing jobs */}
          <TopJobsPanel jobs={topJobs} />
        </div>
      </div>

      {/* AI Chatbot Panel */}
      <RecruiterAIPanel
        isOpen={isOpen}
        onClose={closePanel}
        contextData={{
          summaryCards,
          topJobs,
          applicationTrend,
          recentJobs,
        }}
        pageType="dashboard"
      />
    </div>
  );
}
