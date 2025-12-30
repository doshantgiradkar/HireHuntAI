"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, X, FileText, Link2 } from "lucide-react";

export default function EditCandidateProfileForm({ initialData, onSubmit }) {
  const [formData, setFormData] = useState(initialData);
  const [newSkill, setNewSkill] = useState("");
  const [newSocial, setNewSocial] = useState({ name: "", url: "" });

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

  const addSkill = () => {
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

  /* ---------------- UI ---------------- */
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(formData);
      }}
      className="space-y-6"
    >
      {/* ================= BASIC INFO ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Candidate Profile</CardTitle>
          <CardDescription>Personal and resume information</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={formData.dateOfBirth?.slice(0, 10)}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Total Experience (Years)</Label>
              <Input
                type="number"
                value={formData.totalExperienceDuration}
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
      <Card>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex col-span-2 gap-2">
                <Input
                  placeholder="Platform (linkedin, github)"
                  value={newSocial.name}
                  onChange={(e) =>
                    setNewSocial({ ...newSocial, name: e.target.value })
                  }
                />

                <Input
                  placeholder="Profile URL"
                  value={newSocial.url}
                  onChange={(e) =>
                    setNewSocial({ ...newSocial, url: e.target.value })
                  }
                />
              </div>

              <Button className="col-span-1" type="button" onClick={addSocial}>
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
      <Card>
        <CardHeader>
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
      <Card>
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
              onChange={(e) => updateResume("resumeUrl", e.target.value)}
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
              {formData.resume.skills.map((skill) => (
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
      <Card>
        <CardHeader>
          <CardTitle>Education</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {formData.resume.education.map((edu, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg"
            >
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

              <Button
                type="button"
                variant="destructive"
                onClick={() =>
                  updateResume(
                    "education",
                    formData.resume.education.filter((_, i) => i !== index)
                  )
                }
              >
                Remove Education
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
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
            Add Education
          </Button>
        </CardContent>
      </Card>

      {/* ================= EXPERIENCE ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Experience</CardTitle>
          <CardDescription>Work history</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {formData.resume.experience.map((exp, index) => (
            <div key={index} className="space-y-3 border rounded-lg p-4">
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

              <Button
                type="button"
                variant="destructive"
                onClick={() =>
                  updateResume(
                    "experience",
                    formData.resume.experience.filter((_, i) => i !== index)
                  )
                }
              >
                Remove Experience
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              updateResume("experience", [
                ...formData.resume.experience,
                { jobTitle: "", jobDesc: "" },
              ])
            }
          >
            Add Experience
          </Button>
        </CardContent>
      </Card>
      {/* ================= CERTIFICATIONS ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Certifications</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {formData.resume.certifications.map((cert, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-lg"
            >
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

              <Button
                type="button"
                variant="destructive"
                onClick={() =>
                  updateResume(
                    "certifications",
                    formData.resume.certifications.filter((_, i) => i !== index)
                  )
                }
              >
                Remove Certification
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              updateResume("certifications", [
                ...formData.resume.certifications,
                { name: "", provider: "", yearOfComp: "" },
              ])
            }
          >
            Add Certification
          </Button>
        </CardContent>
      </Card>

      {/* ================= ACTIONS ================= */}
      <div className="flex justify-end gap-3">
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
}
