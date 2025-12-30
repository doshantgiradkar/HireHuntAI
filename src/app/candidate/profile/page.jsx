"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  MapPin,
  Calendar,
  Globe,
  Users,
  Briefcase,
  Mail,
  Phone,
  Clock,
  Edit,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useHeader } from "@/store/user.store";



/* ---------------- PAGE ---------------- */
export default  function CompanyProfilePage() {
const { user, isLoaded } = useUser();
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const setTitle = useHeader(state => state.setTitle);

  useEffect(() => {
    setTitle("My Profile")
    if (!isLoaded || !user) return;


    const fetchCompany = async () => {
      try {
        const res = await fetch(`/api/recruiter/${user.id}`);
        const data = await res.json();
        setCompanyData(data.recruiter);

      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [isLoaded, user]);


  if (!isLoaded || loading) {
    return <div className="p-8 text-center">Loading company profile...</div>;
  }

  if (!companyData) {
    return <div className="p-8 text-center">No company profile found.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          {/* ================= HEADER ================= */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={companyData.logo} alt={companyData.name} />
                  <AvatarFallback>
                    <Building2 className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <CardTitle className="text-3xl">
                      {companyData.name}
                    </CardTitle>
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

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span>{companyData.industry}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{companyData.size}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{companyData.headquarters}</span>
                    </div>
                  </div>
                </div>

                <Button asChild>
                  <Link href="/recruiter/edit-recruiter-profile">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Company Profile
                  </Link>
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* ================= TABS ================= */}
          <Tabs defaultValue="about" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">About Company</TabsTrigger>
              <TabsTrigger value="contact">Contact Info</TabsTrigger>
              <TabsTrigger value="admin">Admin Info</TabsTrigger>
            </TabsList>

            {/* ========== ABOUT TAB ========== */}
            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    Overview and key details about the company
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      Company Overview
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {companyData.overview}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>Website</span>
                      </div>
                      <a
                        href={companyData.website}
                        className="text-sm text-primary hover:underline ml-6"
                      >
                        {companyData.website}
                      </a>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Headquarters</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {companyData.headquarters}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Founded</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {companyData.founded}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>Hiring Model</span>
                      </div>
                      <Badge variant="outline" className="ml-6">
                        {companyData.hiringModel}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Company Details</CardTitle>
                  <CardDescription>
                    Additional information and hiring preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium">Company Type</h3>
                      <p className="text-sm text-muted-foreground">
                        {companyData.companyType}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-medium">Interview Process</h3>
                      <Badge variant="secondary">
                        {companyData.interviewProcess}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">
                      Primary Hiring Roles
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {companyData.primaryRoles?.map((role, index) => (
                        <Badge key={index} variant="outline">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ========== CONTACT TAB ========== */}
            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Mail className="inline h-4 w-4 mr-2" />
                    {companyData.contactEmail}
                  </div>
                  <div>
                    <Phone className="inline h-4 w-4 mr-2" />
                    {companyData.contactPhone}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ========== ADMIN TAB ========== */}
            <TabsContent value="admin">
              <Card>
                <CardHeader>
                  <CardTitle>Administrator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
