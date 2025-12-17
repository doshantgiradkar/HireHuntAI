"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Building2, X, Plus, User } from "lucide-react";
import { useUser } from "@clerk/nextjs";

const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees",
];

const STATUS_OPTIONS = ["Active", "Inactive"];
const COMPANY_TYPES = [
  "Startup",
  "Scale-up",
  "Enterprise",
  "Agency",
  "Consulting",
  "Non-profit",
  "Government",
];

export default function CompanyProfileForm({
  initialData = null,
  mode = "create",
  apiUrl = "https://140ea11aca52.ngrok-free.app",
  onSuccess,
  onCancel,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [currentMode, setCurrentMode] = useState(mode);
  const [recruiterId, setRecruiterId] = useState(initialData?._id || null);

  const { user: clerkUser, isLoaded } = useUser();

  const [formData, setFormData] = useState({
    clerkId: initialData?.clerkId || "",
    logo: initialData?.logo || "",
    name: initialData?.name || "",
    industry: initialData?.industry || "",
    size: initialData?.size || "",
    status: initialData?.status || "Active",
    overview: initialData?.overview || "",
    website: initialData?.website || "",
    headquarters: initialData?.headquarters || "",
    founded: initialData?.founded || "",
    hiringModel: initialData?.hiringModel || "",
    companyType: initialData?.companyType || "",
    primaryRoles: initialData?.primaryRoles || [],
    interviewProcess: initialData?.interviewProcess || "",
    contactEmail: initialData?.contactEmail || "",
    contactPhone: initialData?.contactPhone || "",
    admin: {
      avatar: initialData?.admin?.avatar || "",
      name: initialData?.admin?.name || "",
      role: initialData?.admin?.role || "",
      email: initialData?.admin?.email || "",
      phone: initialData?.admin?.phone || "",
      clerkId: initialData?.admin?.clerkId || null,
    },
  });

  useEffect(() => {
    // If parent toggles mode/initialData, sync up
    setCurrentMode(mode);
    setRecruiterId(initialData?._id || null);
    setFormData((prev) => ({
      ...prev,
      clerkId: initialData?.clerkId || prev.clerkId || "",
      logo: initialData?.logo || prev.logo || "",
      name: initialData?.name || prev.name || "",
      industry: initialData?.industry || prev.industry || "",
      size: initialData?.size || prev.size || "",
      status: initialData?.status || prev.status || "Active",
      overview: initialData?.overview || prev.overview || "",
      website: initialData?.website || prev.website || "",
      headquarters: initialData?.headquarters || prev.headquarters || "",
      founded: initialData?.founded || prev.founded || "",
      companyType: initialData?.companyType || prev.companyType || "",
      primaryRoles: initialData?.primaryRoles || prev.primaryRoles || [],
      contactEmail: initialData?.contactEmail || prev.contactEmail || "",
      contactPhone: initialData?.contactPhone || prev.contactPhone || "",
      admin: {
        avatar: initialData?.admin?.avatar || prev.admin.avatar || "",
        name: initialData?.admin?.name || prev.admin.name || "",
        role: initialData?.admin?.role || prev.admin.role || "",
        email: initialData?.admin?.email || prev.admin.email || "",
        phone: initialData?.admin?.phone || prev.admin.phone || "",
        clerkId: initialData?.admin?.clerkId || prev.admin.clerkId || null,
      },
    }));
  }, [initialData, mode]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAdminChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      admin: {
        ...prev.admin,
        [field]: value,
      },
    }));
  };

  const handleAddRole = () => {
    if (newRole.trim() && !formData.primaryRoles.includes(newRole.trim())) {
      setFormData((prev) => ({
        ...prev,
        primaryRoles: [...prev.primaryRoles, newRole.trim()],
      }));
      setNewRole("");
    }
  };

  const handleRemoveRole = (roleToRemove) => {
    setFormData((prev) => ({
      ...prev,
      primaryRoles: prev.primaryRoles.filter((role) => role !== roleToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Ensure Clerk is ready and we have user id
    if (!isLoaded || !clerkUser?.id) {
      alert("Authentication not ready. Please wait.");
      setIsSubmitting(false);
      return;
    }

    try {
      const endpoint =
        currentMode === "create"
          ? `${apiUrl}/api/recruiter`
          : `${apiUrl}/api/recruiter/${recruiterId || formData.clerkId}`;
      const method = currentMode === "create" ? "POST" : "PUT";

      // always override clerkId from Clerk server user (never trust client state)
      const payload = {
        ...formData,
        clerkId: clerkUser.id,
        admin: {
          ...formData.admin,
          clerkId: clerkUser.id,
        },
      };

      console.debug("Submitting recruiter payload:", payload);

      const res = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("API ERROR:", data);
        alert(data.message || "Failed to save company profile");
        return;
      }

      // if created, switch to edit mode and store id
      if (currentMode === "create" && data?.recruiter?._id) {
        setRecruiterId(data.recruiter._id);
        setCurrentMode("edit");
      }

      onSuccess?.(data);
    } catch (error) {
      console.error("SUBMIT_ERROR:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (initialData) {
      setFormData({
        clerkId: initialData.clerkId,
        logo: initialData.logo,
        name: initialData.name,
        industry: initialData.industry,
        size: initialData.size,
        status: initialData.status,
        overview: initialData.overview,
        website: initialData.website,
        headquarters: initialData.headquarters,
        founded: initialData.founded,
        hiringModel: initialData.hiringModel,
        companyType: initialData.companyType,
        primaryRoles: initialData.primaryRoles,
        interviewProcess: initialData.interviewProcess,
        contactEmail: initialData.contactEmail,
        contactPhone: initialData.contactPhone,
        admin: { ...initialData.admin },
      });
    } else {
      setFormData({
        clerkId: clerkUser?.id || "",
        logo: "",
        name: "",
        industry: "",
        size: "",
        status: "Active",
        overview: "",
        website: "",
        headquarters: "",
        founded: "",
        hiringModel: "",
        companyType: "",
        primaryRoles: [],
        interviewProcess: "",
        contactEmail: "",
        contactPhone: "",
        admin: {
          avatar: "",
          name: clerkUser?.fullName || "",
          role: "Admin",
          email: clerkUser?.primaryEmailAddress?.emailAddress || "",
          phone: "",
          clerkId: clerkUser?.id || null,
        },
      });
    }
    setNewRole("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-4 py-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {currentMode === "create" ? "Create Company Profile" : "Edit Company Profile"}
          </CardTitle>
          <CardDescription>
            {mode === "create"
              ? "Enter company information to create a new profile"
              : "Update company information and settings"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={formData.logo} alt="Company logo" />
              <AvatarFallback>
                <Building2 className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Label htmlFor="logo">Company Logo URL</Label>
              <Input
                id="logo"
                type="url"
                placeholder="https://example.com/logo.png"
                value={formData.logo}
                onChange={(e) => handleInputChange("logo", e.target.value)}
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>
                Additional company information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="website">
                    Website URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="headquarters">
                    Headquarters Location{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="headquarters"
                    placeholder="City, State, Country"
                    value={formData.headquarters}
                    onChange={(e) =>
                      handleInputChange("headquarters", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="founded">
                    Founded Year <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="founded"
                    placeholder="e.g., 2015"
                    value={formData.founded}
                    onChange={(e) => handleInputChange("founded", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyType">
                    Company Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.companyType}
                    onValueChange={(value) =>
                      handleInputChange("companyType", value)
                    }
                    required
                  >
                    <SelectTrigger id="companyType">
                      <SelectValue placeholder="Select company type" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Primary Hiring Roles</CardTitle>
              <CardDescription>
                Add the main roles your company typically hires for
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Software Engineer"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddRole();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddRole} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {formData.primaryRoles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.primaryRoles.map((role, index) => (
                    <Badge key={index} variant="secondary" className="pl-3 pr-1">
                      {role}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 ml-1 hover:bg-transparent"
                        onClick={() => handleRemoveRole(role)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Company contact details for candidates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">
                    Contact Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="careers@example.com"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      handleInputChange("contactEmail", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">
                    Contact Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.contactPhone}
                    onChange={(e) =>
                      handleInputChange("contactPhone", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Administrator Information</CardTitle>
              <CardDescription>
                Primary administrator responsible for managing this company profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={formData.admin.avatar} alt="Admin avatar" />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="adminAvatar">Admin Avatar URL</Label>
                  <Input
                    id="adminAvatar"
                    type="url"
                    placeholder="https://example.com/avatar.png"
                    value={formData.admin.avatar}
                    onChange={(e) => handleAdminChange("avatar", e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="adminName">
                    Admin Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="adminName"
                    placeholder="Enter admin name"
                    value={formData.admin.name}
                    onChange={(e) => handleAdminChange("name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminRole">
                    Admin Role <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="adminRole"
                    placeholder="e.g., Talent Acquisition Manager"
                    value={formData.admin.role}
                    onChange={(e) => handleAdminChange("role", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">
                    Admin Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="admin@example.com"
                    value={formData.admin.email}
                    onChange={(e) => handleAdminChange("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPhone">
                    Admin Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="adminPhone"
                    type="tel"
                    placeholder="+1 (555) 987-6543"
                    value={formData.admin.phone}
                    onChange={(e) => handleAdminChange("phone", e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : currentMode === "create" ? "Create Company" : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
