"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Briefcase,
  GraduationCap,
  FileText,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Edit,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useHeader } from "@/store/user.store";
export const dummyCandidate = {
  _id: "65b9f1a2c9d1a12f9c001234",
  clerkId: "user_2abcdEFGH12345",

  totalExperienceDuration: 3,

  dateOfBirth: "1999-06-15T00:00:00.000Z",

  address: {
    line: "Flat 203, Shree Residency",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    pinCode: "411038",
  },

  resume: {
    resumeUrl:
      "https://res.cloudinary.com/demo/raw/upload/sample_resume.pdf",

    skills: [
      "JavaScript",
      "React",
      "Next.js",
      "Node.js",
      "MongoDB",
      "Tailwind CSS",
    ],

    experience: [
      {
        jobTitle: "Frontend Developer",
        jobDesc:
          "Built scalable UI components using React and Tailwind. Worked closely with backend team to integrate REST APIs.",
      },
      {
        jobTitle: "Junior Full Stack Developer",
        jobDesc:
          "Developed full-stack features using Next.js, Express, and MongoDB. Implemented authentication using Clerk.",
      },
    ],

    education: [
      {
        course: "B.Tech Computer Engineering",
        eduType: "Full Time",
        instituteName: "Savitribai Phule Pune University",
        yearOfComp: 2022,
      },
      {
        course: "Higher Secondary (12th)",
        eduType: "Science",
        instituteName: "Fergusson College",
        yearOfComp: 2018,
      },
    ],

    certifications: [
      {
        name: "Full Stack Web Development",
        provider: "Udemy",
        yearOfComp: 2023,
      },
      {
        name: "React Advanced",
        provider: "Coursera",
        yearOfComp: 2022,
      },
    ],

    socials: [
      {
        name: "GitHub",
        url: "https://github.com/devmulkalwar",
      },
      {
        name: "LinkedIn",
        url: "https://linkedin.com/in/devmulkalwar",
      },
      {
        name: "Portfolio",
        url: "https://devmulkalwar.vercel.app",
      },
    ],
  },

  createdAt: "2024-10-12T10:20:30.000Z",
  updatedAt: "2024-12-01T15:45:10.000Z",
};


export default function CandidateProfilePage() {
  const { user, isLoaded } = useUser();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const setTitle = useHeader(state => state.setTitle);

useEffect(() => {
  setTitle("Candidate Profile");

  // ⛔ Skip API for now
  setCandidate(dummyCandidate);
  setLoading(false);
}, []);

  if (!isLoaded || loading) {
    return <div className="p-8 text-center">Loading profile…</div>;
  }

  if (!candidate) {
    return <div className="p-8 text-center">No profile found.</div>;
  }

  const { resume, address } = candidate;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">

        {/* ================= HEADER ================= */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.imageUrl} />
                <AvatarFallback>
                  {user.firstName?.[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <CardTitle className="text-3xl">
                  {user.fullName}
                </CardTitle>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {candidate.totalExperienceDuration && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {candidate.totalExperienceDuration} yrs experience
                    </div>
                  )}
                  {candidate.dateOfBirth && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(candidate.dateOfBirth).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              <Button asChild>
                <Link href="/candidate/edit-profile">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* ================= TABS ================= */}
        <Tabs defaultValue="resume" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="extras">Extras</TabsTrigger>
          </TabsList>

          {/* ========== RESUME TAB ========== */}
          <TabsContent value="resume" className="space-y-6">
            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {resume.skills?.map((skill, i) => (
                  <Badge key={i} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {resume.experience?.map((exp, i) => (
                  <Card key={i} className="p-4">
                    <h3 className="font-medium">{exp.jobTitle}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {exp.jobDesc}
                    </p>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Resume Download */}
            <div className="flex justify-end">
              <Button asChild variant="outline">
                <a href={resume.resumeUrl} target="_blank">
                  <FileText className="h-4 w-4 mr-2" />
                  View Resume
                </a>
              </Button>
            </div>
          </TabsContent>

          {/* ========== EDUCATION TAB ========== */}
          <TabsContent value="education">
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {resume.education?.map((edu, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      <span className="font-medium">
                        {edu.course} ({edu.eduType})
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      {edu.instituteName} • {edu.yearOfComp}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== EXTRAS TAB ========== */}
          <TabsContent value="extras" className="space-y-6">
            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {resume.certifications?.map((cert, i) => (
                  <div key={i}>
                    <p className="font-medium">{cert.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {cert.provider} • {cert.yearOfComp}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Profiles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {resume.socials?.map((social, i) => (
                  <a
                    key={i}
                    href={social.url}
                    target="_blank"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <LinkIcon className="h-4 w-4" />
                    {social.name}
                  </a>
                ))}
              </CardContent>
            </Card>

            {/* Address */}
            {address && (
              <Card>
                <CardHeader>
                  <CardTitle>Address</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <MapPin className="inline h-4 w-4 mr-2" />
                  {address.line}, {address.city}, {address.state},{" "}
                  {address.pinCode}, {address.country}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
