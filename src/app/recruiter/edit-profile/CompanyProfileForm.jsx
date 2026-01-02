"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Building2, User, Building } from "lucide-react";
import axios from "axios";

/* ---------------- CONSTANTS ---------------- */

const COMPANY_TYPES = [
  "Startup",
  "Scale-up",
  "Enterprise",
  "Agency",
  "Consulting",
  "Non-profit",
  "Government",
];

/* ---------------- COMPONENT ---------------- */

export default function CompanyProfileForm({
  initialData = null,
  mode = "create",
  onSuccess,
  onCancel,
}) {
  const { user: clerkUser, isLoaded } = useUser();

  const [currentMode, setCurrentMode] = useState(mode);
  const [recruiterId, setRecruiterId] = useState(initialData?._id || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newRole, setNewRole] = useState("");

  /* ---------- LOGO UPLOAD STATE ---------- */
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(initialData?.logo || "");

  /* ---------- FORM STATE ---------- */
  const [formData, setFormData] = useState({
    clerkId: "",
    logo: "",
    name: "",
    industry: "",
    size: "",
    status: "Active",
    overview: "",
    website: "",
    headquarters: "",
    founded: "",
    address: {
      line: "",
      city: "",
      state: "",
      pinCode: "",
      country: "India",
    },
    companyType: "",
    primaryRoles: [],
    contactEmail: "",
    contactPhone: "",
    admin: {
      role: "Admin",
      phone: "",
    },
  });

  const adminFromClerk = clerkUser
    ? {
        clerkId: clerkUser.id,
        name: clerkUser.fullName || "",
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        avatar: clerkUser.imageUrl || "",
      }
    : null;

  const normalizeArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return [];
  };

  /* ---------------- EFFECTS ---------------- */

  // Sync edit/create mode
  useEffect(() => {
    setCurrentMode(mode);
    setRecruiterId(initialData?._id || null);

    if (!initialData) return;

    setFormData({
      clerkId: initialData.clerkId || "",
      logo: initialData.logo || "",
      name: initialData.name || "",
      industry: initialData.industry || "",
      size: initialData.size || "",
      status: initialData.status || "Active",
      overview: initialData.overview || "",
      website: initialData.website || "",
      headquarters: initialData.headquarters || "",
      founded: initialData.founded || "",
      address: {
        line: initialData.address?.line || "",
        city: initialData.address?.city || "",
        state: initialData.address?.state || "",
        pinCode: initialData.address?.pinCode || "",
        country: initialData.address?.country || "India",
      },
      companyType: initialData.companyType || "",
      primaryRoles: normalizeArray(initialData.primaryRoles) || [],
      contactEmail: initialData.contactEmail || "",
      contactPhone: initialData.contactPhone || "",
      admin: {
        role: initialData.admin?.role || "Admin",
        phone: initialData.admin?.phone || "",
      },
    });

    setLogoPreview(initialData.logo || "");
  }, [initialData, mode]);

  /* ---------------- HANDLERS ---------------- */

  const updateAddress = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdminChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      admin: { ...prev.admin, [field]: value },
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const addRole = () => {
    if (!newRole.trim()) return;
    if (formData.primaryRoles.includes(newRole.trim())) return;

    setFormData((prev) => ({
      ...prev,
      primaryRoles: [...prev.primaryRoles, newRole.trim()],
    }));
    setNewRole("");
  };

  const removeRole = (role) => {
    setFormData((prev) => ({
      ...prev,
      primaryRoles: prev.primaryRoles.filter((r) => r !== role),
    }));
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded || !clerkUser) return;

    setIsSubmitting(true);

    try {
      const endpoint =
        currentMode === "create"
          ? "/api/recruiter"
          : `/api/recruiter/${recruiterId || clerkUser.id}`;

      const fd = new FormData();

      /* -------- BASIC FIELDS -------- */
      fd.append("clerkId", clerkUser.id);
      fd.append("name", formData.name);
      fd.append("industry", formData.industry);
      fd.append("size", formData.size);
      fd.append("status", formData.status);
      fd.append("overview", formData.overview);
      fd.append("website", formData.website);
      fd.append("headquarters", formData.headquarters);
      fd.append("founded", formData.founded);
      fd.append("companyType", formData.companyType);
      fd.append("contactEmail", formData.contactEmail);
      fd.append("contactPhone", formData.contactPhone);

      fd.append("address", JSON.stringify(formData.address));
      fd.append("primaryRoles", JSON.stringify(formData.primaryRoles));

      /* -------- ADMIN (MERGED, SAFE) -------- */
      fd.append(
        "admin",
        JSON.stringify({
          ...adminFromClerk, // 🔒 Clerk-owned
          role: formData.admin.role,
          phone: formData.admin.phone,
        })
      );

      /* -------- LOGO -------- */
      if (logoFile) {
        fd.append("logo", logoFile);
      }

      const res = await axios({
        method: currentMode === "create" ? "post" : "put",
        url: endpoint,
        data: fd,
      });

      if (currentMode === "create" && res.data?.recruiter?._id) {
        setRecruiterId(res.data.recruiter._id);
        setCurrentMode("edit");
      }

      onSuccess?.(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save company profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <form
      onSubmit={handleSubmit}
      className="container mx-auto px-4 py-8 max-w-6xl space-y-8"
    >
      {/* ================= BASIC INFO ================= */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={logoPreview} />
              <AvatarFallback>
                <Building2 className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>

            <div className="w-full space-y-2">
              <Label>Company Logo</Label>
              <Input type="file" accept="image/*" onChange={handleLogoChange} />
              <p className="text-xs text-muted-foreground">
                JPG, PNG or WEBP recommended
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Company Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
            <Input
              placeholder="Industry"
              value={formData.industry}
              onChange={(e) => handleInputChange("industry", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      {/* ================= ADMIN (READ ONLY) ================= */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 md:gap-4">
            {/* Avatar + Admin Info */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 w-full md:w-auto">
              <Avatar className="h-20 w-20 flex-shrink-0">
                <AvatarImage src={adminFromClerk?.avatar} />
                <AvatarFallback className="text-lg">
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>

              <div className="text-center md:text-left space-y-1">
                <h2 className="text-2xl font-semibold">
                  {adminFromClerk?.name || "Administrator"}
                </h2>

                <p className="text-muted-foreground">{adminFromClerk?.email}</p>

                <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                  {formData.admin.role && (
                    <Badge variant="outline">{formData.admin.role}</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="w-full md:w-[280px] space-y-3">
              <Input
                placeholder="Admin Role"
                value={formData.admin.role}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    admin: { ...prev.admin, role: e.target.value },
                  }))
                }
              />

              <Input
                placeholder="Admin Phone"
                value={formData.admin.phone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    admin: { ...prev.admin, phone: e.target.value },
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================= COMPANY DETAILS ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Website"
            value={formData.website}
            onChange={(e) => handleInputChange("website", e.target.value)}
            required
          />
          <Input
            placeholder="Headquarters"
            value={formData.headquarters}
            onChange={(e) => handleInputChange("headquarters", e.target.value)}
          />
          <Input
            placeholder="Founded Year"
            value={formData.founded}
            onChange={(e) => handleInputChange("founded", e.target.value)}
          />

          <Select
            value={formData.companyType}
            onValueChange={(v) => handleInputChange("companyType", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Company Type" />
            </SelectTrigger>
            <SelectContent>
              {COMPANY_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            className="md:col-span-2"
            placeholder="Company Overview"
            value={formData.overview}
            onChange={(e) => handleInputChange("overview", e.target.value)}
          />
        </CardContent>
      </Card>

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
      {/* ================= ADDITIONAL COMPANY INFO ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Company Information</CardTitle>
          <CardDescription>
            Complete remaining company details used for recruiter visibility
          </CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Company Size */}
          <Input
            placeholder="Company Size (e.g. 11-50 employees)"
            value={formData.size}
            onChange={(e) => handleInputChange("size", e.target.value)}
          />

          {/* Status */}
          <Select
            value={formData.status}
            onValueChange={(v) => handleInputChange("status", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Company Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {/* Contact Email */}
          <Input
            type="email"
            placeholder="Contact Email"
            value={formData.contactEmail}
            onChange={(e) => handleInputChange("contactEmail", e.target.value)}
          />

          {/* Contact Phone */}
          <Input
            placeholder="Contact Phone"
            value={formData.contactPhone}
            onChange={(e) => handleInputChange("contactPhone", e.target.value)}
          />

          {/* Country */}
          <Input
            placeholder="Country"
            value={formData.address.country || "India"}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                address: { ...prev.address, country: e.target.value },
              }))
            }
          />
        </CardContent>
      </Card>

      {/* ================= PRIMARY ROLES ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Primary Hiring Roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addRole()}
            />
            <Button type="button" onClick={addRole} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.primaryRoles.map((role) => (
              <Badge key={role} variant="secondary">
                {role}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeRole(role)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ================= ACTIONS ================= */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : currentMode === "create"
            ? "Create Company"
            : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
