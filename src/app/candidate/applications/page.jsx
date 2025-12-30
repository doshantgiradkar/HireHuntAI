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

// ----------------------
// Sample fallback data
// ----------------------
const sampleApplications = [
  {
    jobId: "1",
    jobTitle: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    status: "interview_scheduled",
    appliedAt: "2024-06-15",
    interview: { scheduled: true, date: "2024-06-28T10:00:00" },
    location: "San Francisco, CA",
    salary: "$120k - $150k",
  },
  {
    jobId: "2",
    jobTitle: "Full Stack Engineer",
    company: "StartupXYZ",
    status: "under_review",
    appliedAt: "2024-06-10",
    interview: { scheduled: false },
    location: "Remote",
    salary: "$100k - $130k",
  },
  {
    jobId: "3",
    jobTitle: "React Developer",
    company: "Digital Solutions Ltd.",
    status: "hired",
    appliedAt: "2024-06-08",
    interview: { scheduled: true, date: "2024-06-22T14:00:00" },
    location: "New York, NY",
    salary: "$110k - $140k",
  },
  {
    jobId: "4",
    jobTitle: "UI/UX Developer",
    company: "Creative Agency",
    status: "rejected",
    appliedAt: "2024-06-05",
    interview: { scheduled: false },
    location: "Los Angeles, CA",
    salary: "$90k - $120k",
  },
  {
    jobId: "5",
    jobTitle: "Software Engineer",
    company: "Enterprise Corp",
    status: "applied",
    appliedAt: "2024-06-12",
    interview: { scheduled: false },
    location: "Chicago, IL",
    salary: "$95k - $125k",
  },
  {
    jobId: "6",
    jobTitle: "Frontend Architect",
    company: "Innovation Labs",
    status: "under_review",
    appliedAt: "2024-06-18",
    interview: { scheduled: false },
    location: "Seattle, WA",
    salary: "$140k - $180k",
  },
];

// ----------------------
// Status configuration
// ----------------------
const statusConfig = {
  applied: {
    label: "Applied",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    icon: FileText,
  },
  under_review: {
    label: "Under Review",
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

// ----------------------
// StatsCards Component
// ----------------------
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
        title: "Under Review",
        value: statusCounts.under_review || 0,
        icon: Clock,
        color: "text-yellow-600 dark:text-yellow-400",
      },
      {
        title: "Interviews Scheduled",
        value: statusCounts.interview_scheduled || 0,
        icon: Users,
        color: "text-purple-600 dark:text-purple-400",
      },
      {
        title: "Offers Received",
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
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="hover:shadow-md transition-shadow duration-200"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// ----------------------
// Filters Component
// ----------------------
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
        <CardTitle className="text-lg">Filter Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by role or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="interview_scheduled">
                Interview Scheduled
              </SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full md:w-48">
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
      </CardContent>
    </Card>
  );
};

// ----------------------
// ApplicationCard Component
// ----------------------
const ApplicationCard = ({ application, onViewDetails, onWithdraw }) => {
  const config = statusConfig[application.status];
  const Icon = config.icon;

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatInterviewDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Card className="mb-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {application.jobTitle}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-400">
              <Building className="h-4 w-4" />
              <span className="text-sm font-medium">{application.company}</span>
            </div>
          </div>
          <Badge className={`${config.color} font-medium`}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>Applied {formatDate(application.appliedAt)}</span>
          </div>

          {application.interview.scheduled && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Users className="h-4 w-4" />
              <span>
                Interview: {formatInterviewDate(application.interview.date)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {application.location} • {application.salary}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(application)}
              className="h-8"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>

            {application.status === "applied" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onWithdraw(application)}
                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
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

// ----------------------
// Main Dashboard Component
// ----------------------
const ApplicationsDashboard = () => {
  const [applications, setApplications] = useState(sampleApplications);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const setTitle = useHeader((state) => state.setTitle);
  // Fetch applications on mount
  useEffect(() => {
    setTitle("My Applications");
    const fetchApplications = async () => {
      try {
        const response = await axios.get("/api/applications");
        if (Array.isArray(response.data)) {
          setApplications(response.data);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Optimized filtering
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
        dateFilter === "all" || new Date(app.appliedAt).getTime() >= cutoff;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [applications, searchTerm, statusFilter, dateFilter]);

  // ---------------------- Render ----------------------
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {[...Array(5)].map((_, i) => (
          <Card
            key={i}
            className="h-32 animate-pulse bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="m-4 bg-red-50 border border-red-200 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-300">
        {error}
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <h1 className="text-2xl font-bold mb-4">Your Applications</h1>

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
        <div className="text-gray-500 dark:text-gray-400">
          No applications found.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <ApplicationCard
              key={application.jobId}
              application={application}
              onViewDetails={(app) => console.log("View details for", app)}
              onWithdraw={(app) => console.log("Withdraw application", app)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationsDashboard;
