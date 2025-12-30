"use client";

import React, { useEffect, useState } from 'react';
import { Search, MapPin, Briefcase, DollarSign, Clock, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useHeader } from '@/store/user.store';


// Mock job data
const mockJobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120k - $160k",
    description: "We're looking for an experienced frontend developer to join our dynamic team. You'll work on cutting-edge web applications using React and TypeScript.",
    remote: true
  },
  {
    id: 2,
    title: "UX/UI Designer",
    company: "Design Studios",
    location: "New York, NY",
    type: "Full-time",
    salary: "$90k - $120k",
    description: "Join our creative team to design beautiful and intuitive user experiences for our clients across various industries.",
    remote: false
  },
  {
    id: 3,
    title: "Backend Engineer",
    company: "CloudTech Solutions",
    location: "Remote",
    type: "Full-time",
    salary: "$130k - $170k",
    description: "Build scalable backend systems using Node.js and AWS. Work with a distributed team on exciting cloud infrastructure projects.",
    remote: true
  },
  {
    id: 4,
    title: "Marketing Coordinator",
    company: "Growth Marketing Co.",
    location: "Austin, TX",
    type: "Part-time",
    salary: "$45k - $60k",
    description: "Support our marketing team with campaign execution, content creation, and social media management.",
    remote: false
  },
  {
    id: 5,
    title: "Data Scientist",
    company: "Analytics Plus",
    location: "Boston, MA",
    type: "Full-time",
    salary: "$110k - $150k",
    description: "Apply machine learning and statistical analysis to solve complex business problems. Work with large datasets and cutting-edge tools.",
    remote: true
  },
  {
    id: 6,
    title: "Product Manager",
    company: "Innovate Labs",
    location: "Seattle, WA",
    type: "Full-time",
    salary: "$140k - $180k",
    description: "Lead product strategy and execution for our flagship SaaS platform. Collaborate with engineering, design, and stakeholders.",
    remote: false
  }
];

export default function JobSearchPage() {
  const [searchTitle, setSearchTitle] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("all");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [visibleJobs, setVisibleJobs] = useState(4);


  // Filter jobs based on search criteria
  const filteredJobs = mockJobs.filter(job => {
    const titleMatch = searchTitle === "" || job.title.toLowerCase().includes(searchTitle.toLowerCase());
    const locationMatch = searchLocation === "" || job.location.toLowerCase().includes(searchLocation.toLowerCase());
    const typeMatch = selectedJobType === "all" || job.type.toLowerCase() === selectedJobType.toLowerCase();
    const remoteMatch = !remoteOnly || job.remote;

    return titleMatch && locationMatch && typeMatch && remoteMatch;
  });

  const displayedJobs = filteredJobs.slice(0, visibleJobs);
  const hasMoreJobs = visibleJobs < filteredJobs.length;

  const handleSearch = () => {
    // Search is handled by filtered state
    setVisibleJobs(4); // Reset visible jobs when searching
  };

  const loadMoreJobs = () => {
    setVisibleJobs(prev => Math.min(prev + 4, filteredJobs.length));
  };

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const setTitle = useHeader(state => state.setTitle);
  useEffect(() => {
  setTitle('Job Search')
  async function fetchUsers() {
    try {
      const res = await fetch("/api/users");

      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      console.log(res)
      const data = await res.json();
      console.log("Fetched users:", data);

      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  fetchUsers();
}, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
     <header className="border-b bg-card rounded-lg mx-4 my-4">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-6">
            <Briefcase className="h-8 w-8" />
            <h1 className="text-2xl font-bold">HireHunt AI</h1>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col gap-3 md:flex-row md:gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Job title, keywords, or company"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
                aria-label="Search by job title, keywords, or company"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="City, state, or zip code"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
                aria-label="Search by location"
              />
            </div>
            <Button onClick={handleSearch} size="lg" className="md:w-auto">
              <Search className="mr-2 h-4 w-4" />
              Search Jobs
            </Button>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Job Type Filter */}
                <div className="space-y-2">
                  <Label htmlFor="job-type">Job Type</Label>
                  <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                    <SelectTrigger id="job-type" aria-label="Select job type">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Remote Only Filter */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remote"
                    checked={remoteOnly}
                    onCheckedChange={setRemoteOnly}
                    aria-label="Show remote jobs only"
                  />
                  <Label
                    htmlFor="remote"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Remote only
                  </Label>
                </div>

                <Separator />

                {/* Salary Range */}
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary Range</Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="salary" aria-label="Select salary range">
                      <SelectValue placeholder="Any salary" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any salary</SelectItem>
                      <SelectItem value="40-60">$40k - $60k</SelectItem>
                      <SelectItem value="60-90">$60k - $90k</SelectItem>
                      <SelectItem value="90-120">$90k - $120k</SelectItem>
                      <SelectItem value="120+">$120k+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Experience Level */}
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience Level</Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="experience" aria-label="Select experience level">
                      <SelectValue placeholder="Any level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any level</SelectItem>
                      <SelectItem value="entry">Entry level</SelectItem>
                      <SelectItem value="mid">Mid level</SelectItem>
                      <SelectItem value="senior">Senior level</SelectItem>
                      <SelectItem value="lead">Lead/Principal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Job Listings */}
          <main className="flex-1">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Found
              </h2>
              <p className="text-muted-foreground text-sm">
                Showing {displayedJobs.length} of {filteredJobs.length} results
              </p>
            </div>

            <div className="space-y-4">
              {displayedJobs.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters or search terms
                    </p>
                  </CardContent>
                </Card>
              ) : (
                displayedJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="space-y-1">
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {job.company}
                          </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{job.type}</Badge>
                          {job.remote && <Badge variant="outline">Remote</Badge>}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {job.salary}
                        </div>
                      </div>
                      <p className="text-sm">{job.description}</p>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button className="flex-1 sm:flex-none" aria-label={`Apply for ${job.title} at ${job.company}`}>
                        Apply Now
                      </Button>
                      <Button variant="outline" aria-label={`Save ${job.title} job`}>
                        Save
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>

            {/* Load More Button */}
            {hasMoreJobs && (
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={loadMoreJobs}
                  aria-label="Load more job listings"
                >
                  Load More Jobs
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
