"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const ResumeViewerPage = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeData, setResumeData] = useState(null);

  // Placeholder resume parsing logic
  const handleUpload = () => {
    if (!resumeFile) return;

    // Simulated resume data (replace with real parser later)
    const mockData = {
      name: "John Doe",
      role: "Full Stack Developer",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      skills: ["React", "Node.js", "TypeScript", "TailwindCSS", "Python"],
      experience: [
        {
          company: "Tech Solutions Inc.",
          role: "Software Engineer",
          duration: "2021 - Present",
          details:
            "Developed scalable web apps using React, Node.js, and PostgreSQL.",
        },
        {
          company: "Innovate Labs",
          role: "Frontend Developer",
          duration: "2019 - 2021",
          details:
            "Built and optimized UI components using React and TailwindCSS.",
        },
      ],
      education: [
        {
          institution: "University of Technology",
          degree: "B.Sc. in Computer Science",
          year: "2015 - 2019",
        },
      ],
    };

    setResumeData(mockData);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Resume</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          <Input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />
          <Button onClick={handleUpload}>Upload</Button>
        </CardContent>
      </Card>

      {/* Resume Summary */}
      {resumeData && (
        <div className="space-y-6">
          <Card>
            <CardContent className="flex flex-col sm:flex-row items-center sm:items-start gap-4 py-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src="/avatar-placeholder.png" />
                <AvatarFallback>{resumeData.name[0]}</AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-semibold">{resumeData.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {resumeData.role}
                </p>
                <div className="mt-2 text-sm">
                  <p>{resumeData.email}</p>
                  <p>{resumeData.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Skills Section */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </CardContent>
          </Card>

          {/* Experience Section */}
          <Card>
            <CardHeader>
              <CardTitle>Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resumeData.experience.map((exp, index) => (
                <Card key={index} className="p-4">
                  <h3 className="font-semibold">{exp.role}</h3>
                  <p className="text-sm text-muted-foreground">
                    {exp.company} • {exp.duration}
                  </p>
                  <p className="mt-2 text-sm">{exp.details}</p>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Education Section */}
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {resumeData.education.map((edu, index) => (
                <div key={index}>
                  <h3 className="font-semibold">{edu.degree}</h3>
                  <p className="text-sm text-muted-foreground">
                    {edu.institution} • {edu.year}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* View/Download Button */}
          <div className="flex justify-end">
            <Button variant="outline">View / Download Original Resume</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeViewerPage;
