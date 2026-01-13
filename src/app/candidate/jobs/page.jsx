"use client";

import { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  DollarSign,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { redirect, useSearchParams } from "next/navigation";
import axios from "axios";
import { useHeader } from "@/store/user.store";

export default function JobSearchPage() {
  const [jobs, setJobs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const getParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(getParams.get("page_no") || 1);
  const pageSize = getParams.get("size") < 10 ? 10 : getParams.get("size");
  const search = getParams.get("search") || "";
  const setTitle = useHeader((state) => state.setTitle);

  // Fetch jobs when active search or page changes
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/job?page_no=${currentPage}&page_size=${pageSize}&search=${encodeURIComponent(search)}`,
        );

        if (response.status != 200) {
          throw new Error("Failed to fetch jobs");
        }

        const data = await response.data;
        setJobs(data.jobs || []);
        setTotalCount(data.count || 0);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
    setTitle("Job Search");
  }, [currentPage, search]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      redirect(`/candidate/jobs?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const getWorkModeColor = (mode) => {
    const colors = {
      Remote:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Onsite: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Hybrid:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    };
    return colors[mode] || "bg-gray-100 text-gray-800";
  };

  const getEmploymentTypeColor = (type) => {
    const colors = {
      "Full-time":
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
      "Part-time":
        "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      Contract:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      Internship:
        "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const formatSalary = (salaryRange) => {
    if (!salaryRange?.min || !salaryRange?.max) return "Not specified";
    return `${salaryRange.currency} ${(salaryRange.min / 100000).toFixed(
      1,
    )}L - ${(salaryRange.max / 100000).toFixed(1)}L`;
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Skeleton className="h-10 sm:h-12 w-48 sm:w-64 mb-6 sm:mb-8" />
        <Skeleton className="h-10 sm:h-12 w-full mb-6 sm:mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-center min-h-[50vh]">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
          Find Your Dream Job
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Discover {totalCount.toLocaleString()} opportunities waiting for you
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 sm:mb-8 w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
          <Input
            type="text"
            placeholder="Search by title, company, location, or skills..."
            value={searchQuery}
            onChange={handleSearch}
            onKeyPress={handleKeyPress}
            className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base lg:text-lg w-full"
          />
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2">
          Press Enter to search
        </p>
      </div>

      {/* Results Info */}
      {search && (
        <div className="mb-4 sm:mb-6">
          <p className="text-sm sm:text-base text-muted-foreground">
            Found {totalCount.toLocaleString()}{" "}
            {totalCount === 1 ? "job" : "jobs"} matching "{search}"
          </p>
        </div>
      )}

      {/* Job Grid */}
      {jobs.length === 0 ? (
        <Card className="text-center py-8 sm:py-12">
          <CardContent>
            <Briefcase className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              No jobs found
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Try adjusting your search criteria
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {jobs.map((job) => (
              <Card
                key={job._id}
                className="hover:shadow-lg transition-shadow duration-300 flex flex-col"
              >
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      {job.companyLogo ? (
                        <img
                          src={job.companyLogo}
                          alt={job.companyName}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base sm:text-lg line-clamp-1">
                          {job.title}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm line-clamp-1">
                          {job.companyName}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
                    <Badge
                      className={`${getWorkModeColor(job.workMode)} text-xs`}
                    >
                      {job.workMode}
                    </Badge>
                    <Badge
                      className={`${getEmploymentTypeColor(
                        job.employmentType,
                      )} text-xs`}
                    >
                      {job.employmentType}
                    </Badge>
                    {job.matchScore.isEligible ? (
                      <Badge
                        variant="secondary"
                        className="text-green-200 bg-green-700 whitespace-nowrap"
                      >
                        {job.matchScore.matchScore}% Match
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-red-200 bg-red-700 whitespace-nowrap"
                      >
                        {job.matchScore.matchScore}% Match
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="grow space-y-3 p-4 sm:p-6 pt-0">
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3">
                    {job.description}
                  </p>

                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>

                    {job.experienceLevel && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                        <span className="truncate">
                          {job.experienceLevel} Level
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                      <span className="truncate">
                        {formatSalary(job.salaryRange)}
                      </span>
                    </div>

                    {job.openings > 1 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                        <span>{job.openings} openings</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                      <span className="truncate">
                        Posted {formatDate(job.postedAt)}
                      </span>
                    </div>
                  </div>

                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {job.skills.slice(0, 3).map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                    {job.matchScore.isEligible ? ("") : (
                      <div className={"rounded-sm px-2 bg-black text-sm w-fit text-red-400 mx-auto mt-2"}>
                        {job.matchScore.reason}
                      </div>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col xl:flex-row gap-2 p-4 sm:p-6 pt-0">
                  <Button
                    className="flex-1 w-full xl:w-auto text-sm"
                    onClick={() =>
                      (window.location.href = `/candidate/jobs/${job._id}`)
                    }
                  >
                    View Details
                  </Button>

                  <Button
                    variant="outline"
                    className="flex-1 w-full xl:w-auto text-sm"
                    onClick={() =>
                      (window.location.href = `/candidate/jobs/${job._id}/apply`)
                    }
                    disabled={!job.matchScore.isEligible}
                  >
                    Apply Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 sm:h-10 sm:w-10"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, idx) => {
                    const page = idx + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="icon"
                          className="h-8 w-8 sm:h-10 sm:w-10 text-xs sm:text-sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span
                          key={page}
                          className="px-1 sm:px-2 text-xs sm:text-sm"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 sm:h-10 sm:w-10"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
