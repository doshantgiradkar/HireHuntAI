"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  X,
  FileText,
  Link2,
  GraduationCap,
  Briefcase,
  Award,
  Building,
} from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EditCandidateProfileForm({ initialData, onSubmit }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profileImageUrl: "",
    totalExperienceDuration: 0,
    dateOfBirth: "",
    address: {
      line: "",
      city: "",
      state: "",
      pinCode: "",
    },
    resume: {
      resumeUrl: "",
      skills: [],
      socials: [],
      education: [],
      experience: [],
      certifications: [],
    },
  });

  const [newSkill, setNewSkill] = useState("");
  const [newSocial, setNewSocial] = useState({ name: "", url: "" });
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();

  /* ---------------- HANDLERS ---------------- */
  const updateAddress = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const updateResume = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      resume: { ...prev.resume, [field]: value },
    }));
  };

  const addSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    setFormData((prev) => ({
      ...prev,
      resume: {
        ...prev.resume,
        skills: [...prev.resume.skills, newSkill.trim()],
      },
    }));
    setNewSkill("");
  };

  const removeSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      resume: {
        ...prev.resume,
        skills: prev.resume.skills.filter((s) => s !== skill),
      },
    }));
  };

  const addSocial = () => {
    if (!newSocial.name || !newSocial.url) return;

    updateResume("socials", [...formData.resume.socials, newSocial]);

    setNewSocial({ name: "", url: "" });
  };

  const removeSocial = (index) => {
    updateResume(
      "socials",
      formData.resume.socials.filter((_, i) => i !== index)
    );
  };

  useEffect(() => {
    if (isSignedIn && user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses[0]?.emailAddress || "",
        profileImageUrl: user.imageUrl,
      }));
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.emailAddresses[0]?.emailAddress || "",
        profileImageUrl: user.imageUrl || "",
        totalExperienceDuration: initialData.totalExperienceDuration || 0,
        dateOfBirth: initialData.dateOfBirth || "",
        address: {
          line: initialData.address?.line || "",
          city: initialData.address?.city || "",
          state: initialData.address?.state || "",
          pinCode: initialData.address?.pinCode || "",
        },
        resume: {
          resumeUrl: initialData.resume?.resumeUrl || "",
          skills: initialData.resume?.skills || [],
          socials: initialData.resume?.socials || [],
          education: initialData.resume?.education || [],
          experience: initialData.resume?.experience || [],
          certifications: initialData.resume?.certifications || [],
        },
      });
    }
  }, [initialData]);

  /* ---------------- UI ---------------- */
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const res = await axios.put('/api/candidate', formData, {
          withCredentials: true
        });
        if (res.status == 200) {
          window.location.href = '/candidate/profile'
        }
      }}
      className="container mx-auto px-4 py-8 max-w-6xl"
    >
      {/* ================= BASIC INFO ================= */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            {/* Avatar + Info */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 w-full md:w-auto">
              <img
                src={formData.profileImageUrl}
                alt="Profile"
                className="h-24 w-24 rounded-full border object-cover shrink-0"
              />
              <div className="text-center md:text-left flex-1 space-y-1">
                <p className="text-3xl font-bold">
                  {`${formData.firstName || "First"} ${
                    formData.lastName || "Last"
                  }`}
                </p>
                <p className="text-muted-foreground mt-1">
                  {formData.email || ""}
                </p>
                {user?.publicMetadata?.role && (
                  <Badge variant="secondary" className="mt-2">
                    {user.publicMetadata.role}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Editable Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={formData.dateOfBirth?.slice(0, 10) || ""}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Total Experience (Years)</Label>
              <Input
                type="number"
                value={formData.totalExperienceDuration || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalExperienceDuration: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================= SOCIAL LINKS ================= */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Social Links
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* -------- ADD SOCIAL LINK -------- */}
          <div className="space-y-3">
            <Label>Add Social Link</Label>

            <div className="flex gap-2">
              <div className="flex gap-2">
                <Select
                  value={newSocial.name}
                  onValueChange={(value) =>
                    setNewSocial({ ...newSocial, name: value })
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="github">GitHub</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="leetcode">LeetCode</SelectItem>
                    <SelectItem value="others">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Input
                placeholder="Profile URL"
                value={newSocial.url}
                onChange={(e) =>
                  setNewSocial({ ...newSocial, url: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSocial();
                  }
                }}
                className="flex-2"
              />

              <Button type="button" size="icon" onClick={addSocial}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* -------- SOCIAL LIST -------- */}
          <div className="space-y-3">
            <Label>Saved Social Profiles</Label>

            <div className="space-y-2">
              {formData.resume.socials.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No social links added yet
                </p>
              )}

              {formData.resume.socials.map((social, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 border rounded-md px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium capitalize">
                      {social.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {social.url}
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeSocial(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================= ADDRESS ================= */}
      <Card className="mt-8">
        <CardHeader className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          <CardTitle>Address</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            placeholder="Address Line"
            value={formData.address.line}
            onChange={(e) => updateAddress("line", e.target.value)}
          />
          <Input
            placeholder="City"
            value={formData.address.city}
            onChange={(e) => updateAddress("city", e.target.value)}
          />
          <Input
            placeholder="State"
            value={formData.address.state}
            onChange={(e) => updateAddress("state", e.target.value)}
          />
          <Input
            placeholder="Pincode"
            value={formData.address.pinCode}
            onChange={(e) => updateAddress("pinCode", e.target.value)}
          />
        </CardContent>
      </Card>

      {/* ================= RESUME ================= */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resume
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Resume URL</Label>
            <Input
              value={formData.resume.resumeUrl}
              disabled={true}
            />
          </div>

          <Separator />

          {/* -------- SKILLS -------- */}
          <div className="space-y-3">
            <Label>Skills</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
              />
              <Button type="button" size="icon" onClick={addSkill}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.resume?.skills?.map((skill) => (
                <Badge key={skill} variant="secondary" className="pr-1">
                  {skill}
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="p-1"
                    onClick={() => removeSkill(skill)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* ================= EDUCATION ================= */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Education
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* -------- ADD EDUCATION -------- */}
          <div className="flex gap-2">
            <p className="text-sm text-muted-foreground flex-1">
              Add a new education entry
            </p>

            <Button
              type="button"
              size="icon"
              onClick={() =>
                updateResume("education", [
                  ...formData.resume.education,
                  {
                    instituteName: "",
                    course: "",
                    score: "",
                    yearOfComp: "",
                  },
                ])
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Separator />

          {/* -------- EDUCATION LIST -------- */}
          <div className="space-y-3">
            <Label>Saved Education</Label>

            <div className="space-y-4">
              {formData.resume.education.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No education added yet
                </p>
              )}

              {formData.resume.education.map((edu, index) => (
                <div
                  key={index}
                  className="relative space-y-4 border rounded-md p-4 pt-10"
                >
                  {/* ❌ REMOVE BUTTON */}
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-2"
                    onClick={() =>
                      updateResume(
                        "education",
                        formData.resume.education.filter((_, i) => i !== index)
                      )
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Institute Name"
                      value={edu.instituteName}
                      onChange={(e) => {
                        const updated = [...formData.resume.education];
                        updated[index].instituteName = e.target.value;
                        updateResume("education", updated);
                      }}
                    />

                    <Input
                      placeholder="Course"
                      value={edu.course}
                      onChange={(e) => {
                        const updated = [...formData.resume.education];
                        updated[index].course = e.target.value;
                        updateResume("education", updated);
                      }}
                    />

                    <Input
                      placeholder="Score"
                      type="number"
                      value={edu.score}
                      onChange={(e) => {
                        const updated = [...formData.resume.education];
                        updated[index].score = e.target.value;
                        updateResume("education", updated);
                      }}
                    />

                    <Input
                      placeholder="Year of Completion"
                      type="number"
                      value={edu.yearOfComp}
                      onChange={(e) => {
                        const updated = [...formData.resume.education];
                        updated[index].yearOfComp = e.target.value;
                        updateResume("education", updated);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================= EXPERIENCE ================= */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Experience
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* -------- ADD EXPERIENCE -------- */}
          <div className="flex gap-2">
            <p className="text-sm text-muted-foreground flex-1">
              Add a new work experience
            </p>

            <Button
              type="button"
              size="icon"
              onClick={() =>
                updateResume("experience", [
                  ...formData.resume.experience,
                  { jobTitle: "", jobDesc: "" },
                ])
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Separator />

          {/* -------- EXPERIENCE LIST -------- */}
          <div className="space-y-3">
            <Label>Saved Experience</Label>

            <div className="space-y-4">
              {formData.resume.experience.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No experience added yet
                </p>
              )}

              {formData.resume.experience.map((exp, index) => (
                <div
                  key={index}
                  className="relative space-y-4 border rounded-md p-4"
                >
                  {/* ❌ REMOVE BUTTON */}
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-2"
                    onClick={() =>
                      updateResume(
                        "experience",
                        formData.resume.experience.filter((_, i) => i !== index)
                      )
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <Input
                    placeholder="Job Title"
                    value={exp.jobTitle}
                    onChange={(e) => {
                      const updated = [...formData.resume.experience];
                      updated[index].jobTitle = e.target.value;
                      updateResume("experience", updated);
                    }}
                  />

                  <Textarea
                    placeholder="Job Description"
                    value={exp.jobDesc}
                    onChange={(e) => {
                      const updated = [...formData.resume.experience];
                      updated[index].jobDesc = e.target.value;
                      updateResume("experience", updated);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================= CERTIFICATIONS ================= */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certifications
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* -------- ADD CERTIFICATION -------- */}
          <div className="flex gap-2">
            <p className="text-sm text-muted-foreground flex-1">
              Add a new certification
            </p>

            <Button
              type="button"
              size="icon"
              onClick={() =>
                updateResume("certifications", [
                  ...formData.resume.certifications,
                  { name: "", provider: "", yearOfComp: "" },
                ])
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Separator />

          {/* -------- CERTIFICATIONS LIST -------- */}
          <div className="space-y-3">
            <Label>Saved Certifications</Label>

            <div className="space-y-4">
              {formData.resume.certifications.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No certifications added yet
                </p>
              )}

              {formData.resume.certifications.map((cert, index) => (
                <div key={index} className="relative border rounded-md p-4">
                  {/* REMOVE BUTTON */}
                  <div className="absolute top-2 right-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        updateResume(
                          "certifications",
                          formData.resume.certifications.filter(
                            (_, i) => i !== index
                          )
                        )
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <Input
                      placeholder="Certification Name"
                      value={cert.name}
                      onChange={(e) => {
                        const updated = [...formData.resume.certifications];
                        updated[index].name = e.target.value;
                        updateResume("certifications", updated);
                      }}
                    />

                    <Input
                      placeholder="Provider"
                      value={cert.provider}
                      onChange={(e) => {
                        const updated = [...formData.resume.certifications];
                        updated[index].provider = e.target.value;
                        updateResume("certifications", updated);
                      }}
                    />

                    <Input
                      placeholder="Year"
                      type="number"
                      value={cert.yearOfComp}
                      onChange={(e) => {
                        const updated = [...formData.resume.certifications];
                        updated[index].yearOfComp = e.target.value;
                        updateResume("certifications", updated);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================= ACTIONS ================= */}
      <div className="flex justify-end gap-3 mt-8 ">
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
}
