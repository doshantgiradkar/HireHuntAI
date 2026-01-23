"use client";
import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  Building,
  Calendar,
  Eye,
  Trash2,
  Search,
  FileText,
  Users,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useHeader } from "@/store/user.store";
import { useUser } from "@clerk/nextjs";

const statusConfig = {
  applied: {
    label: "Applied",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    icon: FileText,
  },
  shortlisted: {
    label: "Shortlisted",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    icon: Clock,
  },
  interview_scheduled: {
    label: "Interview Scheduled",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    icon: Users,
  },
  hired: {
    label: "Hired",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    icon: XCircle,
  },
};

const StatsCards = ({ applications }) => {
  const stats = useMemo(() => {
    const total = applications.length;
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    return [
      {
        title: "Total Applied",
        value: total,
        icon: Briefcase,
        color: "text-blue-600 dark:text-blue-400",
      },
      {
        title: "Shortlisted",
        value: statusCounts.shortlisted || 0,
        icon: Clock,
        color: "text-yellow-600 dark:text-yellow-400",
      },
      {
        title: "Interviews",
        value: statusCounts.interview_scheduled || 0,
        icon: Users,
        color: "text-purple-600 dark:text-purple-400",
      },
      {
        title: "Offers",
        value: statusCounts.hired || 0,
        icon: CheckCircle,
        color: "text-green-600 dark:text-green-400",
      },
      {
        title: "Rejections",
        value: statusCounts.rejected || 0,
        icon: XCircle,
        color: "text-red-600 dark:text-red-400",
      },
    ];
  }, [applications]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

const ApplicationFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Filter Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by role or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-col gap-4 md:[flex-row,gap-2] w-fit">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="interview_scheduled">
                  Interview Scheduled
                </SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="last_week">Last Week</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ApplicationCard = ({ application, onViewDetails, onWithdraw }) => {
  const config = statusConfig[application.status];
  const Icon = config.icon;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatInterviewDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg mb-1">
              {application.jobTitle}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building className="h-4 w-4" />
              <span>{application.company}</span>
            </div>
          </div>
          <Badge className={config.color}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Applied {formatDate(application.appliedAt)}</span>
          </div>

          {application.interview?.scheduled && application.interview?.date && (
            <div className="flex items-center gap-2 text-green-600">
              <Users className="h-4 w-4" />
              <span className="text-xs md:text-sm">
                Interview: {formatInterviewDate(application.interview.date)}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-3 border-t">
          <div className="text-sm text-muted-foreground">
            {application.location} • {application.salary}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(application)}
              className="flex-1 md:flex-none"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>

            {application.status === "applied" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onWithdraw(application)}
                className="flex-1 md:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Withdraw
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ApplicationsDashboard = () => {
  const { user, isLoaded } = useUser();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const setTitle = useHeader((state) => state.setTitle);

  useEffect(() => {
    setTitle("My Applications");
    const fetchApplications = async () => {
      try {
         
          const response = await axios.get(
          `/api/application/candidate/${user?.id}`,
        );
        const applicationsData = response.data?.applications || [];
        console.log(applicationsData)
        const formattedApplications = applicationsData.map((app) => {
          const job = app.jobId;

          return {
            jobId: typeof job === "object" ? job._id : job,
            jobTitle: job?.title || "Unknown Position",
            company: job?.companyName || "Unknown Company",
            status: app.status,
            appliedAt: app.createdAt,
            interview: {
              scheduled: app.status === "interview_scheduled",
              date: app.interviewDate || null,
            },
            location: job?.location || "Not specified",
            salary: job?.salaryRange
              ? `${job.salaryRange.currency} ${job.salaryRange.min?.toLocaleString()} - ${job.salaryRange.max?.toLocaleString()}`
              : "Not specified",
            applicationId: app._id,
            ...app,
          };
        });

        setApplications(formattedApplications);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load applications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [setTitle,isLoaded]);

  const filteredApplications = useMemo(() => {
    const now = Date.now();
    const dateMap = { last_week: 7, last_month: 30, last_3_months: 90 };
    const days = dateMap[dateFilter] || 0;
    const cutoff = now - days * 24 * 60 * 60 * 1000;

    return applications.filter((app) => {
      const matchesSearch =
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.company.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || app.status === statusFilter;

      const matchesDate =
        dateFilter === "all" ||
        (app.appliedAt && new Date(app.appliedAt).getTime() >= cutoff);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [applications, searchTerm, statusFilter, dateFilter]);

  const handleViewDetails = (jobId) => {
    window.location.href = `/candidate/jobs/${jobId}`;
  };

  const handleWithdraw = async (application) => {
    if (!confirm("Are you sure you want to withdraw this application?")) {
      return;
    }

    try {
      await axios.delete(`/api/application/${application.applicationId}`);
      setApplications((prev) =>
        prev.filter((app) => app.applicationId !== application.applicationId),
      );
    } catch (err) {
      console.error("Error withdrawing application:", err);
      alert("Failed to withdraw application. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full p-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="h-32 animate-pulse bg-gray-100" />
            ))}
          </div>
          <Card className="mb-6 h-32 animate-pulse bg-gray-100" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="h-48 animate-pulse bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full p-4">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-red-50 border-red-200 p-6 text-red-700">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-5 w-5" />
              <h3 className="font-semibold">Error Loading Applications</h3>
            </div>
            <p>{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Your Applications</h1>

        <StatsCards applications={applications} />

        <ApplicationFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
        />

        {filteredApplications.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <Briefcase className="h-16 w-16 text-gray-400" />
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {applications.length === 0
                    ? "No Applications Yet"
                    : "No Matching Applications"}
                </h3>
                <p className="text-muted-foreground">
                  {applications.length === 0
                    ? "Start applying to jobs to see them here."
                    : "Try adjusting your filters to see more results."}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <ApplicationCard
                key={application.applicationId}
                application={application}
                onViewDetails={() => {
                  window.location.href = `/candidate/jobs/${application.jobId._id}`;
                }}
                onWithdraw={handleWithdraw}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsDashboard;