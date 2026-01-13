"use client";

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
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  FileText,
} from "lucide-react";
import { useHeader } from "@/store/user.store";
import axios from "axios";

export default function CreateJobPost() {
  const setTitle = useHeader((s) => s.setTitle);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [date, setDate] = useState(null);
  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    jobType: "",
    workMode: "",
    location: "",
    experienceLevel: "",
    experienceYear: "",
    salaryMin: "",
    salaryMax: "",
    description: "",
    responsibilities: "",
    requirements: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !selectedSkills.includes(skillInput.trim())) {
      setSelectedSkills([...selectedSkills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setSelectedSkills(
      selectedSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const handlePublish = async () => {
    try {
      const payload = {
        title: formData.jobTitle,
        description: formData.description,
        location: formData.location,
        workMode: formData.workMode,
        employmentType: formData.jobType,
        experienceLevel: formData.experienceLevel,
        experienceYear: Number(formData.experienceYear), // ✅ ADD THIS
        salaryRange: {
          min: Number(formData.salaryMin),
          max: Number(formData.salaryMax),
        },
        skills: selectedSkills,
        applicationDeadline: date ? date.toISOString() : null,
        status: "Open",
      };
      console.log(payload)
      const res = await axios.post("/api/job", payload, {
        withCredentials: true,
      });

      window.location.href = '/recruiter/jobs'
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Publish error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      } else {
        console.error("Unknown error:", error);
      }
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
    setTitle("Edit Candidate Profile");
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

                <div className="space-y-2">
                  <Label htmlFor="experienceYear">
                    Experience (Years){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="experienceYear"
                    type="number"
                    min={0}
                    placeholder="e.g. 3"
                    value={formData.experienceYear}
                    onChange={(e) =>
                      handleInputChange("experienceYear", e.target.value)
                    }
                  />
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
                <div className="flex gap-2">
                  <Input
                    id="skills"
                    placeholder="Type a skill and press Enter"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                  />
                  <Button type="button" onClick={addSkill} variant="secondary">
                    Add
                  </Button>
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
              Publish Job Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
