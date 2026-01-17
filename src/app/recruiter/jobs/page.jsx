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
  Trash2,
  Edit,
  Eye,
  MoreHorizontal,
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
import { Separator } from "@/components/ui/separator";
import DeleteConfirmationDialog from "@/components/delete-confirmation-model";// Import the dialog
import { redirect, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { useHeader } from "@/store/user.store";

export default function JobSearchPage() {
  const router = useRouter();
  const setTitle = useHeader((state) => state.setTitle);
  const { userId, isLoaded } = useUser();
  const [jobs, setJobs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const getParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(
    Number(getParams.get("page_no")) || 1,
  );
  const pageSize = Math.max(Number(getParams.get("size")) || 10, 10);
  
  // State for delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    setTitle("Job Listings");
  });

  useEffect(() => {
    console.log(userId);
    if (!isLoaded) return;
    fetchJobs(userId, currentPage, pageSize, activeSearchQuery);
  }, [userId, currentPage, activeSearchQuery, isLoaded]);

  const fetchJobs = async (
    userId,
    page_no = 1,
    page_size = 10,
    search = "",
  ) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `/api/job/user/${userId}?page_no=${page_no}&page_size=${page_size}&search=${encodeURIComponent(
          search,
        )}`,
      );

      const data = response.data;

      setJobs(data.jobs || []);
      setTotalCount(data.pagination?.totalCount || 0);
      setError(null);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to fetch jobs",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      setActiveSearchQuery(searchQuery);
      setCurrentPage(1);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

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

  const handleDeleteClick = (job) => {
    setSelectedJob(job);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedJob) return;
    
    try {
      setDeleting(true);
      const res = await axios.delete(`/api/job/${selectedJob._id}`, {
        withCredentials: true,
      });
      setShowDeleteDialog(false);
      setSelectedJob(null);
      
      // Refresh the jobs list
      fetchJobs(userId, currentPage, pageSize, activeSearchQuery);
    } catch (err) {
      console.log(err);
      setDeleting(false);
    }
  };

  const refreshJobs = () => {
    fetchJobs(userId, currentPage, pageSize, activeSearchQuery);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-12 w-full max-w-2xl" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="space-y-3">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Your Job Listings
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your {totalCount.toLocaleString()} active job{" "}
              {totalCount === 1 ? "posting" : "postings"}
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by title, company, location, or skills..."
                value={searchQuery}
                onChange={handleSearch}
                onKeyPress={handleKeyPress}
                className="pl-10 h-12 text-base"
              />
            </div>
            <p className="text-sm text-muted-foreground">Press Enter to search</p>
          </div>

          {/* Results Info */}
          {activeSearchQuery && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                Found{" "}
                <span className="font-medium text-foreground">
                  {totalCount.toLocaleString()}
                </span>{" "}
                {totalCount === 1 ? "result" : "results"} for
              </span>
              <Badge variant="secondary" className="font-normal">
                {activeSearchQuery}
              </Badge>
            </div>
          )}

          {/* Job Grid */}
          {jobs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <Briefcase className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  {activeSearchQuery
                    ? "Try adjusting your search criteria to find what you're looking for"
                    : "You haven't posted any jobs yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                  <Card
                    key={job._id}
                    className="group hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden border-border/50 hover:border-border"
                  >
                    <CardHeader className="space-y-4 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {job.companyLogo ? (
                            <img
                              src={job.companyLogo}
                              alt={job.companyName}
                              className="w-12 h-12 rounded-lg object-cover border flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border flex-shrink-0">
                              <Building2 className="h-6 w-6 text-primary" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1 space-y-1">
                            <CardTitle className="text-lg line-clamp-2 leading-tight">
                              {job.title}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {job.companyName}
                            </CardDescription>
                          </div>
                        </div>

                        {/* Delete Button - Positioned at top right */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(job)}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                          title="Delete job"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="secondary"
                          className="font-normal text-xs"
                        >
                          {job.workMode}
                        </Badge>
                        <Badge variant="outline" className="font-normal text-xs">
                          {job.employmentType}
                        </Badge>
                        {job.status && (
                          <Badge
                            variant={
                              job.status === "active"
                                ? "default"
                                : job.status === "draft"
                                  ? "outline"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {job.status}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="flex-grow space-y-4 pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {job.description}
                      </p>

                      <Separator />

                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">
                            {job.location}
                          </span>
                        </div>

                        {job.experienceLevel && (
                          <div className="flex items-start gap-3">
                            <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {job.experienceLevel}
                            </span>
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">
                            {formatSalary(job.salaryRange)}
                          </span>
                        </div>

                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {formatDate(job.postedAt)}
                            </span>
                          </div>

                          {job.openings > 1 && (
                            <div className="flex items-center gap-1.5 text-xs bg-muted px-2 py-1 rounded">
                              <Users className="h-3 w-3 text-muted-foreground" />
                              <span>{job.openings} openings</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {job.skills && job.skills.length > 0 && (
                        <>
                          <Separator />
                          <div className="flex flex-wrap gap-1.5">
                            {job.skills.slice(0, 4).map((skill, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs font-normal px-2 py-1"
                              >
                                {skill}
                              </Badge>
                            ))}
                            {job.skills.length > 4 && (
                              <Badge
                                variant="outline"
                                className="text-xs font-normal px-2 py-1"
                              >
                                +{job.skills.length - 4}
                              </Badge>
                            )}
                          </div>
                        </>
                      )}
                    </CardContent>

                    <CardFooter className="gap-2 pt-4 border-t bg-muted/20">
                      <Button
                        className="flex-1"
                        onClick={() => router.push(`/recruiter/jobs/${job._id}`)}
                        size="sm"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          router.push(`/recruiter/edit-job/${job._id}`)
                        }
                        className="shrink-0"
                        title="Edit job"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center gap-4 pt-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
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
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              size="icon"
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
                            <span key={page} className="px-2 text-sm">
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
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Reusable Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        deleting={deleting}
        title="Delete Job Post"
        description={`Deleting this job post will permanently remove it and all associated applications. This data cannot be recovered.`}
        itemName={selectedJob?.title}
        itemDetails={{
          companyLogo: selectedJob?.companyLogo,
          companyName: selectedJob?.companyName,
          location: selectedJob?.location,
          employmentType: selectedJob?.employmentType,
          applicationsCount: selectedJob?.applicationsCount || 0,
          status: selectedJob?.status,
        }}
        itemType="job post"
        confirmButtonText="Delete Permanently"
        cancelButtonText="Cancel"
      />
    </>
  );
}