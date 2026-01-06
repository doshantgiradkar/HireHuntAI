"use client";

import { useHeader } from "@/store/user.store";
import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import {
  Search,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  MapPin, Building2
} from "lucide-react";
import {
  Card,
  CardContent, CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Page = () => {
  const setTitle = useHeader((state) => state.setTitle);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [topJobs, setTopJobs] = useState(null);

  useEffect(() => {
    setTitle("Candidate Dashboard");
  }, [setTitle]);

  useEffect(() => {
    axios.get("/api/job/top", { withCredentials: true }).then((res) => {
      setTopJobs(res.data.jobs);
    });
  }, [setTopJobs]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      redirect(`/candidate/jobs?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(e.target.value);
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Mock data - replace with actual API calls
  const stats = [
    {
      title: "Applications",
      value: "24",
      change: "+3 this week",
      icon: Briefcase,
      color: "text-blue-600",
    },
    {
      title: "Interviews Scheduled",
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
      title: "Offers Received",
      value: "2",
      change: "Pending review",
      icon: CheckCircle,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      {/* Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search Section */}
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

      {/* Top Matching Jobs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Top Jobs For You
            </h2>
            <p className="text-sm text-muted-foreground">
              Based on your profile and preferences
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/candidate/jobs")}
          >
            View All Jobs
          </Button>
        </div>

        {topJobs != null ? (
          <div className="grid gap-4">
            {topJobs.map((job) => (
              <Card
                key={job._id}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold mb-1">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {job.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatDate(job.postedAt)}
                            </span>
                            -
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatDate(job.applicationDeadline)}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-green-50 text-green-700 hover:bg-green-100"
                        >
                          {job.match}% Match
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <span> {job.salaryRange.currency} </span>
                          {`${job.salaryRange.min} - ${job.salaryRange.max}`}
                        </span>
                        <Badge variant="outline">{job.employmentType}</Badge>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        redirect(`/candidate/jobs/${job._id}/apply`);
                      }}
                    >
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Alert variant="destructive">
              <AlertDescription>{"No Maching Jobs Found"}</AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
