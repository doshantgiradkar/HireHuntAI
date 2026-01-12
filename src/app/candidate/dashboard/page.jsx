"use client";

import { useHeader } from "@/store/user.store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  MapPin,
  Building2,
  DollarSign
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";

const Page = () => {
  const setTitle = useHeader((state) => state.setTitle);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [topJobs, setTopJobs] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTitle("Candidate Dashboard");
  }, [setTitle]);

  useEffect(() => {
    axios.get("/api/job/top", { withCredentials: true }).then((res) => {
      setTopJobs(res.data.jobsWithScore);
      setIsLoading(false);
    });
  }, [setTopJobs]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/candidate/jobs?search=${encodeURIComponent(searchQuery)}`);
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

  const stats = [
    {
      title: "Applications",
      value: "24",
      change: "+3 this week",
      icon: Briefcase,
      color: "text-blue-600",
    },
    {
      title: "Interviews",
      value: "5",
      change: "2 upcoming",
      icon: Calendar,
      color: "text-green-600",
    },
    {
      title: "Profile Views",
      value: "127",
      change: "+12 this week",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: "Offers",
      value: "2",
      change: "Pending review",
      icon: CheckCircle,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8 max-w-7xl">
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                  <CardTitle className="text-xl font-medium truncate pr-2">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 shrink-0 ${stat.color}`} />
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="text-5xl  font-bold">{stat.value}</div>
                  <p className="text-md sm:text-xs text-muted-foreground mt-1 truncate">
                    {stat.change}
                  </p>
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
            <Button
              onClick={handleSearchClick}
              className="h-10 sm:h-12 w-full sm:w-auto sm:px-8"
            >
              Search
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Press Enter or click Search to find jobs
          </p>
        </div>

        {/* Top Matching Jobs */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                Top Jobs For You
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Based on your profile and preferences
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/candidate/jobs")}
              className="w-full sm:w-auto"
            >
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
                <Card
                  key={job._id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                      {/* Left Content */}
                      <div className="flex-1 space-y-4">
                        {/* Job Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-semibold mb-2 wrap-break-words">
                              {job.title}
                            </h3>
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
                          {job.matchScore.isEligible ?
                            (<Badge
                              variant="secondary"
                              className="bg-green-50 text-green-700 hover:bg-green-100 whitespace-nowrap self-start lg:hidden w-full"
                            >
                              {job.matchScore.matchScore}% Match
                            </Badge>) : (

                              <Badge
                                variant="secondary"
                                className="bg-red-50 text-red-700 hover:bg-red-100 whitespace-nowrap self-start lg:hidden w-full"
                              >
                                {job.matchScore.matchScore}% Match
                              </Badge>
                            )}
                        </div>

                        {/* Job Details */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                            <span className="truncate">
                              {job.salaryRange.currency} {job.salaryRange.min} - {job.salaryRange.max}
                            </span>
                          </span>
                          <Badge variant="outline" className="w-fit">{job.employmentType}</Badge>
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
                          <Button
                            onClick={() => {
                              router.push(`/candidate/jobs/${job._id}/apply`);
                            }}
                            className="flex-1"
                          >
                            Apply Now
                          </Button>
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
                          {job.matchScore.isEligible ? (
                            <Badge
                              variant="secondary"
                              className="bg-green-50 text-green-700 hover:bg-green-100 whitespace-nowrap w-full"
                            >
                              {job.matchScore.matchScore}% Match
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-red-50 text-red-700 hover:bg-red-100 whitespace-nowrap w-full"
                            >
                              {job.matchScore.matchScore}% Match
                            </Badge>
                          )}
                          <Button
                            onClick={() => {
                              router.push(`/candidate/jobs/${job._id}/apply`);
                            }}
                            className="w-full"
                          >
                            Apply Now
                          </Button>
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
