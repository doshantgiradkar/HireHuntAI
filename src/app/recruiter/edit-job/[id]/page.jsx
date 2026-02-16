"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  CalendarDays,
  X,
  Check,
  ChevronsUpDown,
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  FileText,
} from "lucide-react";
import { useHeader } from "@/store/user.store";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function CreateJobPost() {
  const router = useRouter();
  const { id: jobId } = useParams();
  const setTitle = useHeader((s) => s.setTitle);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [skillOptions, setSkillOptions] = useState([]);
  const [isSkillsLoading, setIsSkillsLoading] = useState(false);
  const [showSkillOptions, setShowSkillOptions] = useState(false);
  const [highlightedSkillIndex, setHighlightedSkillIndex] = useState(0);
  const [date, setDate] = useState(null);
  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    jobType: "",
    workMode: "",
    location: "",
    experienceLevel: "",
    salaryMin: "",
    salaryMax: "",
    description: "",
    responsibilities: "",
    requirements: "",
  });

  useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      try {
        const res = await axios.get(`/api/job/${jobId}`, {
          withCredentials: true,
        });

        console.log(res.data);
        const job = res.data.job;

        setFormData({
          jobTitle: job.title || "",
          companyName: job.companyName || "",
          jobType: job.employmentType || "",
          workMode: job.workMode || "",
          location: job.location || "",
          experienceLevel: job.experienceLevel || "",
          salaryMin: job.salaryRange?.min || "",
          salaryMax: job.salaryRange?.max || "",
          description: job.description || "",
          responsibilities: job.responsibilities || "",
          requirements: job.requirements || "",
        });

        setSelectedSkills(job.skills || []);
        setDate(
          job.applicationDeadline ? new Date(job.applicationDeadline) : null,
        );
      } catch (err) {
        console.error("Failed to load job", err);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = (skillLabel) => {
    const normalizedLabel = (skillLabel || "").trim();
    if (!normalizedLabel) return;

    setSelectedSkills((prev) => {
      const alreadySelected = prev.some(
        (skill) => skill.toLowerCase() === normalizedLabel.toLowerCase(),
      );
      if (alreadySelected) return prev;
      return [...prev, normalizedLabel];
    });

    setSkillInput("");
    setSkillOptions([]);
    setShowSkillOptions(false);
    setHighlightedSkillIndex(0);
  };

  const removeSkill = (skillToRemove) => {
    setSelectedSkills(
      selectedSkills.filter((skill) => skill !== skillToRemove),
    );
  };

  const isSkillAlreadySelected = (label) =>
    selectedSkills.some(
      (skill) => skill.toLowerCase() === String(label).toLowerCase(),
    );

  useEffect(() => {
    const q = skillInput.trim();
    if (!q) {
      setSkillOptions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setIsSkillsLoading(true);
        const res = await axios.get("/api/skills", {
          params: { q, limit: 5 },
          withCredentials: true,
          signal: controller.signal,
        });
        setSkillOptions(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        if (!controller.signal.aborted) {
          setSkillOptions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSkillsLoading(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [skillInput]);

  useEffect(() => {
    setHighlightedSkillIndex(0);
  }, [skillOptions, showSkillOptions]);

  const addFirstSkillFromList = () => {
    if (skillOptions.length === 0) return;
    addSkill(skillOptions[0]?.label);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setShowSkillOptions(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!showSkillOptions) {
        setShowSkillOptions(true);
        return;
      }
      setHighlightedSkillIndex((prev) =>
        Math.min(prev + 1, Math.max(skillOptions.length - 1, 0)),
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedSkillIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (!showSkillOptions || skillOptions.length === 0) return;
      addFirstSkillFromList();
    }
  };

  const handlePublish = async () => {
    try {
      const payload = {
        title: formData.jobTitle,
        description: formData.description,
        responsibilities: formData.responsibilities,
        requirements: formData.requirements,
        location: formData.location,
        workMode: formData.workMode,
        employmentType: formData.jobType,
        experienceLevel: formData.experienceLevel,
        salaryRange: {
          min: Number(formData.salaryMin),
          max: Number(formData.salaryMax),
        },
        skills: selectedSkills,
        applicationDeadline: date ? date.toISOString() : null,
      };

      const res = await axios.put(`/api/job/${jobId}`, payload, {
        withCredentials: true,
      });

      console.log("Job updated:", res.data);
      router.replace("/jobs");
    } catch (error) {
      console.error("Update error:", error);
    }
  };
  const handleSaveDraft = () => {
    console.log("Saving as draft:", {
      ...formData,
      skills: selectedSkills,
      deadline: date,
    });
  };

  const formatDate = (date) => {
    if (!date) return "Pick a date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  useEffect(() => {
    setTitle("Edit Job Post");
  }, []);
  return (
    <div className="p-6">
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Create Job Post</h1>
          <p className="text-muted-foreground">
            Post a new job opening to attract top talent
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                <CardTitle>Basic Information</CardTitle>
              </div>
              <CardDescription>
                Enter the core details about this position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">
                    Job Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g. Senior Frontend Developer"
                    value={formData.jobTitle}
                    onChange={(e) =>
                      handleInputChange("jobTitle", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    Company Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="e.g. Acme Corporation"
                    value={formData.companyName}
                    onChange={(e) =>
                      handleInputChange("companyName", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="jobType">
                    Job Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.jobType}
                    onValueChange={(v) => handleInputChange("jobType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workMode">
                    Work Mode <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.workMode}
                    onValueChange={(v) => handleInputChange("workMode", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="Onsite">On-site</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experienceLevel">
                    Experience Level <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.experienceLevel}
                    onValueChange={(v) =>
                      handleInputChange("experienceLevel", v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fresher">Fresher</SelectItem>
                      <SelectItem value="Mid">Mid-Level</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                      <SelectItem value="Lead">Lead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <CardTitle>Location & Compensation</CardTitle>
              </div>
              <CardDescription>
                Specify where the role is based and salary details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">
                    Location <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g. San Francisco, CA"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Application Deadline{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {formatDate(date)}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Salary Range (Annual){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    type="number"
                    placeholder="Minimum salary"
                    value={formData.salaryMin}
                    onChange={(e) =>
                      handleInputChange("salaryMin", e.target.value)
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Maximum salary"
                    value={formData.salaryMax}
                    onChange={(e) =>
                      handleInputChange("salaryMax", e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>Skills & Requirements</CardTitle>
              </div>
              <CardDescription>
                Define the skills and qualifications needed for this role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="skills">
                  Required Skills <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="skills"
                    placeholder="Search and select required skills"
                    value={skillInput}
                    onChange={(e) => {
                      setSkillInput(e.target.value);
                      setShowSkillOptions(true);
                    }}
                    onFocus={() => setShowSkillOptions(true)}
                    onBlur={() => {
                      setTimeout(() => setShowSkillOptions(false), 120);
                    }}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                  />
                  <ChevronsUpDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  {showSkillOptions && skillInput.trim() && (
                    <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-md">
                      {isSkillsLoading && (
                        <p className="px-3 py-2 text-sm text-muted-foreground">
                          Searching...
                        </p>
                      )}

                      {!isSkillsLoading && skillOptions.length === 0 && (
                        <p className="px-3 py-2 text-sm text-muted-foreground">
                          No matching skills found
                        </p>
                      )}

                      {!isSkillsLoading &&
                        skillOptions.map((skillOption, index) => {
                          const alreadySelected = isSkillAlreadySelected(
                            skillOption.label,
                          );
                          const isHighlighted = highlightedSkillIndex === index;

                          return (
                            <button
                              key={skillOption.key}
                              type="button"
                              className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                                isHighlighted
                                  ? "bg-accent text-accent-foreground"
                                  : ""
                              } ${
                                alreadySelected
                                  ? "opacity-60 cursor-not-allowed"
                                  : "hover:bg-accent hover:text-accent-foreground"
                              }`}
                              onMouseDown={(e) => e.preventDefault()}
                              onMouseEnter={() =>
                                setHighlightedSkillIndex(index)
                              }
                              onClick={() => {
                                if (alreadySelected) return;
                                addSkill(skillOption.label);
                              }}
                              aria-disabled={alreadySelected}
                            >
                              <span>{skillOption.label}</span>
                              {alreadySelected && (
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                  <Check className="h-3 w-3" />
                                  Added
                                </span>
                              )}
                            </button>
                          );
                        })}
                      {!isSkillsLoading && skillOptions.length > 0 && (
                        <p className="border-t px-3 py-2 text-xs text-muted-foreground">
                          Press Enter to select first suggestion
                        </p>
                      )}
                    </div>
                  )}
                </div>
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedSkills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-1"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="requirements">
                  Requirements & Qualifications{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="requirements"
                  placeholder="List the required qualifications, certifications, and experience..."
                  value={formData.requirements}
                  onChange={(e) =>
                    handleInputChange("requirements", e.target.value)
                  }
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <CardTitle>Job Details</CardTitle>
              </div>
              <CardDescription>
                Provide comprehensive information about the role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">
                  Job Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, team, and what makes this opportunity unique..."
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsibilities">
                  Key Responsibilities{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="responsibilities"
                  placeholder="Outline the main duties and responsibilities for this position..."
                  value={formData.responsibilities}
                  onChange={(e) =>
                    handleInputChange("responsibilities", e.target.value)
                  }
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              size="lg"
              onClick={handleSaveDraft}
              className="sm:w-auto"
            >
              Save as Draft
            </Button>
            <Button size="lg" onClick={handlePublish} className="sm:w-auto">
              Update Job Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
