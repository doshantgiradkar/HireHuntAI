"use client";

import { useHeader } from "@/store/user.store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  MapPin,
  Building2,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";
import { useMemo } from "react";
import { Users } from "lucide-react";
import { XCircle } from "lucide-react";

const Page = () => {
  const setTitle = useHeader((state) => state.setTitle);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [topJobs, setTopJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTitle("Candidate Dashboard");
  }, [setTitle]);

  useEffect(() => {
    axios.get("/api/job", { withCredentials: true }).then((res) => {
      setTopJobs(res.data.jobs);
      setIsLoading(false);
    });

    axios.get("/api/application", { withCredentials: true }).then((res) => {
      setApplications(res.data.applications || []);
      setIsLoading(false);
    });
  }, [setTopJobs, setApplications]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/candidate/jobs?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleWithdraw = async (applicationId) => {
    try {
      const response = await axios.delete(`/api/application/${applicationId}`);
      if (response.status !== 200) throw new Error("Failed to withdraw application");
      window.location.reload();
    } catch (err) {
      console.error("Error withdrawing application:", err);
      alert("Failed to withdraw application. Please try again.");
    }
  };

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      router.push(`/candidate/jobs?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const stats = useMemo(() => {
    const total = applications?.length;

    const statusCounts = applications?.reduce((acc, app) => {
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
        value: statusCounts?.shortlisted || 0,
        icon: Clock,
        color: "text-yellow-600 dark:text-yellow-400",
      },
      {
        title: "Interviews",
        value: statusCounts?.interview_scheduled || 0,
        icon: Users,
        color: "text-purple-600 dark:text-purple-400",
      },
      {
        title: "Offers",
        value: statusCounts?.hired || 0,
        icon: CheckCircle,
        color: "text-green-600 dark:text-green-400",
      },
      {
        title: "Rejections",
        value: statusCounts?.rejected || 0,
        icon: XCircle,
        color: "text-red-600 dark:text-red-400",
      },
    ];
  }, [applications]);

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8 max-w-7xl">
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

        {/* Search Section */}
        <div className="w-full space-y-2">
          <h2 className="text-lg sm:text-xl font-semibold">Find Your Next Opportunity</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                className="pl-10 h-10 sm:h-12 w-full"
              />
            </div>
            <Button onClick={handleSearchClick} className="h-10 sm:h-12 w-full sm:w-auto sm:px-8">
              Search
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Press Enter or click Search to find jobs</p>
        </div>

        {/* Top Matching Jobs */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Top Jobs For You</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Based on your profile and preferences</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/candidate/jobs")} className="w-full sm:w-auto">
              View All Jobs
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : topJobs && topJobs.length > 0 ? (
            <div className="grid gap-4">
              {topJobs.map((job) => (
                <Card key={job._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                      {/* Left Content */}
                      <div className="flex-1 space-y-4">
                        {/* Job Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-semibold mb-2 wrap-break-words">{job.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                                <span className="truncate">{job.company}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                                <span className="truncate">{job.location}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Job Details */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                            <span className="truncate">
                              {job.salaryRange.currency} {job.salaryRange.min} - {job.salaryRange.max}
                            </span>
                          </span>
                          <Badge variant="outline" className="w-fit inline">
                            {job.employmentType}
                          </Badge>
                          {job.matchScore.isEligible ? (
                            <Badge
                              variant="secondary"
                              className="bg-green-50 text-green-700 hover:bg-green-100 whitespace-nowrap"
                            >
                              {job.matchScore.matchScore}% Match
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-red-50 text-red-700 hover:bg-red-100 whitespace-nowrap"
                            >
                              {job.matchScore.matchScore}% Match
                            </Badge>
                          )}
                        </div>

                        {/* Dates */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 shrink-0" />
                            Posted: {formatDate(job.postedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 shrink-0" />
                            Deadline: {formatDate(job.applicationDeadline)}
                          </span>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2">
                          {job.skills.slice(0, 5).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {job.skills.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{job.skills.length - 5} more
                            </Badge>
                          )}
                        </div>

                        {/* Mobile Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 lg:hidden">
                          {job.hasApplied ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  className="grow text-red-400 bg-red-50"
                                  size="lg"
                                  disabled={job.status !== "Open"}
                                >
                                  Withdraw Application
                                </Button>
                              </AlertDialogTrigger>

                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Withdraw Application?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. Your application will be permanently withdrawn.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleWithdraw(job.applicationId)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Yes, Withdraw
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <Button
                              onClick={() => {
                                router.push(`/candidate/jobs/${job._id}/apply`);
                              }}
                              className="flex-1"
                            >
                              Apply Now
                            </Button>
                          )}
                          <Button
                            onClick={() => {
                              router.push(`/candidate/jobs/${job._id}`);
                            }}
                            variant="outline"
                            className="flex-1"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>

                      {/* Right Action Buttons - Desktop Only */}
                      <div className="hidden lg:flex lg:flex-col lg:items-end lg:justify-between lg:min-w-45">
                        <div className="flex flex-col gap-2 w-full justify-end">
                          {job.hasApplied ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  className="w-full text-red-400 bg-red-50"
                                  size="lg"
                                  disabled={job.status !== "Open"}
                                >
                                  Withdraw Application
                                </Button>
                              </AlertDialogTrigger>

                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Withdraw Application?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. Your application will be permanently withdrawn.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleWithdraw(job.applicationId)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Yes, Withdraw
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <Button
                              onClick={() => {
                                router.push(`/candidate/jobs/${job._id}/apply`);
                              }}
                              className="flex-1"
                            >
                              Apply Now
                            </Button>
                          )}
                          <Button
                            onClick={() => {
                              router.push(`/candidate/jobs/${job._id}`);
                            }}
                            variant="outline"
                            className="w-full"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                No matching jobs found. Try adjusting your profile or check back later for new opportunities.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
