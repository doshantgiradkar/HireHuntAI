"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  Loader2,
  MapPin,
  Briefcase,
  DollarSign,
  Users,
  X,
} from "lucide-react";
import { Calendar as CalendarIcon } from "lucide-react";
import { useHeader } from "@/store/user.store";
import { format } from "date-fns";
import axios from "axios";

export default function JobApplicationForm({ params }) {
  const { user } = useUser();
  const router = useRouter();
  const jobId = React.use(params).id;
  const setTitle = useHeader(state => state.setTitle);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [candidate, setCandidate] = useState(null);
  const [job, setJob] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    coverLetter: "",
    skills: [],
    experienceSummary: "",
    whyInterested: "",
    availabilityDate: null,
  });
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    setTitle("Apply For Job")
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id || !jobId) return;

      try {
        setLoading(true);
        const candidateRes = await axios.get("/api/candidate", {
          withCredentials: true,
        });
        const jobRes = await axios(`/api/job/${jobId}`);

        setCandidate(candidateRes.data.candidate);
        setJob(jobRes.data.job);

        setFormData({
          fullName: user.fullName || "",
          email: user.primaryEmailAddress?.emailAddress || "",
          phone: user.primaryPhoneNumber?.phoneNumber || "",
          coverLetter: "",
          skills: candidateRes.data.candidate.resume?.skills || [],
          experienceSummary:
            candidateRes.data.candidate.resume?.experience
              ?.map((exp) => `${exp.jobTitle}: ${exp.jobDesc || ""}`)
              .join("\n\n") || "",
          whyInterested: "",
          availabilityDate: null,
        });
      } catch (error) {
        toast.error("Failed to load application data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, jobId]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          skills: [...prev.skills, skillInput.trim()],
        }));
      }
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const isFormValid = () => {
    return (
      formData.fullName.trim() &&
      formData.email.trim() &&
      formData.phone.trim() &&
      formData.coverLetter.trim() &&
      formData.skills.length > 0 &&
      formData.whyInterested.trim()
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(
        "/api/application",
        {
          jobId: job._id,
          candidateId: candidate._id,
          candidateClerkId: user.id,
          recruiterId: job.recruiterId,
          recruiterClerkId: job.recruiterClerkId,
          resumeUrl: candidate.resume.resumeUrl,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          coverLetter: formData.coverLetter,
          skills: formData.skills,
          experienceSummary: formData.experienceSummary,
          whyInterested: formData.whyInterested,
          availabilityDate: formData.availabilityDate,
        },
        { withCredentials: true }
      );

      toast.success("Application submitted successfully!");
      router.push("/candidate/applications");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to submit application"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!candidate || !job) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Unable to load application data</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start gap-4">
              {job.companyLogo && (
                <img
                  src={job.companyLogo}
                  alt={job.companyName}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-2xl mb-1">{job.title}</CardTitle>
                <CardDescription>{job.companyName}</CardDescription>
                <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {job.employmentType}
                  </div>
                  {job.salaryRange && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {job.salaryRange.min.toLocaleString()} -{" "}
                      {job.salaryRange.max.toLocaleString()}{" "}
                      {job.salaryRange.currency}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {job.openings} opening{job.openings !== 1 && "s"}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Form</CardTitle>
            <CardDescription>
              Fill in your details to apply. Fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+91 12345 67890"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Availability Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.availabilityDate
                          ? format(formData.availabilityDate, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.availabilityDate}
                        onSelect={(date) =>
                          handleInputChange("availabilityDate", date)
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Current Resume</Label>
              <div className="p-3 border rounded-md bg-muted/50">
                <a
                  href={candidate.resume.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline break-all"
                >
                  {candidate.resume.resumeUrl}
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills *</Label>
              <Input
                id="skills"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="Type a skill and press Enter"
              />
              {formData.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => handleRemoveSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Add at least one skill
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter *</Label>
              <Textarea
                id="coverLetter"
                value={formData.coverLetter}
                onChange={(e) =>
                  handleInputChange("coverLetter", e.target.value)
                }
                placeholder="Write a compelling cover letter..."
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceSummary">Experience Summary</Label>
              <Textarea
                id="experienceSummary"
                value={formData.experienceSummary}
                onChange={(e) =>
                  handleInputChange("experienceSummary", e.target.value)
                }
                placeholder="Summarize your relevant work experience..."
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whyInterested">
                Why are you interested in this role? *
              </Label>
              <Textarea
                id="whyInterested"
                value={formData.whyInterested}
                onChange={(e) =>
                  handleInputChange("whyInterested", e.target.value)
                }
                placeholder="Tell us what excites you about this opportunity..."
                rows={5}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={submitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid() || submitting}
                className="flex-1"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
