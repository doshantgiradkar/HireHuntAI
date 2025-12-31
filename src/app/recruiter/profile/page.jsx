"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Calendar,
  Globe,
  Users,
  Briefcase,
  Mail,
  Phone,
  Edit,
  Loader2,
  ExternalLink,
  Award,
  Clock,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth, useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function RecruiterProfile() {
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { getToken } = useAuth();
  const { user, isLoaded,isSignedIn } = useUser();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) return;

    fetchRecruiterData();
  }, [isLoaded, isSignedIn, user?.id]);

  const fetchRecruiterData = async () => {
    try {
      const clerkToken = await getToken();

      if (!clerkToken) {
        throw new Error("Authentication token missing");
      }

      console.log("Clerk Token:", clerkToken);

      const response = await fetch(`/api/recruiter/${user.id}`, {
        headers: {
          Authorization: `Bearer ${clerkToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch recruiter data");
      }

      setCompanyData(data.recruiter);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (!companyData?.name) return "C";
    return companyData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading || !isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Alert>
          <AlertDescription>No company profile found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section with Company Info */}
        <div className="mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 md:gap-4">
                {/* Avatar + Info */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-4 w-full md:w-auto">
                  <Avatar className="h-20 w-20 flex-shrink-0">
                    <AvatarImage
                      src={companyData.logo}
                      alt={companyData.name}
                    />
                    <AvatarFallback className="text-lg">
                      <Building2 className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold">{companyData.name}</h1>
                    <p className="text-muted-foreground mt-1">
                      {companyData.industry}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                      <Badge
                        variant={
                          companyData.status === "Active"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {companyData.status}
                      </Badge>
                      {companyData.companyType && (
                        <Badge variant="outline">
                          {companyData.companyType}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <div className="w-full md:w-auto flex justify-center md:justify-end">
                  <Button
                    onClick={() =>
                      router.push("/recruiter/edit-profile")
                    }
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Company Info & Contact */}
          <div className="lg:col-span-1 space-y-6">
            {/* Company Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5" />
                  Company Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Company Size</p>
                    <p className="text-sm text-muted-foreground">
                      {companyData.size}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Headquarters</p>
                    <p className="text-sm text-muted-foreground">
                      {companyData.headquarters}
                    </p>
                  </div>
                </div>

                {companyData.founded && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Founded</p>
                      <p className="text-sm text-muted-foreground">
                        {companyData.founded}
                      </p>
                    </div>
                  </div>
                )}

                {companyData.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Website</p>
                      <a
                        href={companyData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline break-all inline-flex items-center gap-1"
                      >
                        {companyData.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {companyData.contactEmail && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground break-all">
                        {companyData.contactEmail}
                      </p>
                    </div>
                  </div>
                )}

                {companyData.contactPhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">
                        {companyData.contactPhone}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hiring Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="h-5 w-5" />
                  Hiring Model
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {companyData.hiringModel && (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Model Type</p>
                      <Badge variant="outline" className="mt-1">
                        {companyData.hiringModel}
                      </Badge>
                    </div>
                  </div>
                )}

                {companyData.interviewProcess && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Interview Process</p>
                      <Badge variant="secondary" className="mt-1">
                        {companyData.interviewProcess}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Administrator */}
            {companyData.admin && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5" />
                    Administrator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={companyData.admin.avatar} />
                      <AvatarFallback>
                        {companyData.admin.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{companyData.admin.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {companyData.admin.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Overview & Roles */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Company Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {companyData.overview || "No company overview available."}
                </p>
              </CardContent>
            </Card>

            {/* Primary Hiring Roles */}
            {companyData.primaryRoles?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="h-5 w-5" />
                    Primary Hiring Roles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {companyData.primaryRoles.map((role, index) => (
                      <Badge key={index} variant="secondary">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Company Culture & Benefits (if available) */}
            {companyData.benefits?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="h-5 w-5" />
                    Benefits & Perks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {companyData.benefits.map((benefit, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 text-sm"
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium mb-2">Industry</p>
                    <Badge variant="outline">{companyData.industry}</Badge>
                  </div>

                  {companyData.companyType && (
                    <div>
                      <p className="text-sm font-medium mb-2">Company Type</p>
                      <p className="text-sm text-muted-foreground">
                        {companyData.companyType}
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium mb-2">Status</p>
                    <Badge
                      variant={
                        companyData.status === "Active"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {companyData.status}
                    </Badge>
                  </div>

                  {companyData.hiringModel && (
                    <div>
                      <p className="text-sm font-medium mb-2">Hiring Model</p>
                      <p className="text-sm text-muted-foreground">
                        {companyData.hiringModel}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
