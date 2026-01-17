"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  Video,
  Mic,
  Wifi,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Briefcase,
  FileText,
  Monitor,
} from "lucide-react";
import { useHeader } from "@/store/user.store";
import { redirect } from "next/navigation";
import { Target } from "lucide-react";

const InterviewLobbyPage = () => {
  const [timeUntilStart, setTimeUntilStart] = useState(300);
  const [systemChecks, setSystemChecks] = useState({
    internet: "checking",
    camera: "checking",
    microphone: "checking",
  });
  const [progress, setProgress] = useState(0);

  const candidate = {
    name: "Alex Morgan",
    role: "Full Stack Developer",
    avatar: "",
  };

  const interviewDetails = {
    type: "Technical Round - DSA",
    company: "TechCorp Solutions",
    interviewer: "Sarah Chen",
    interviewerRole: "Senior Engineering Manager",
    scheduledTime: "2:30 PM IST",
    duration: "60 minutes",
    date: "December 2, 2024",
  };

  const guidelines = [
    "Ensure you're in a quiet environment with stable internet",
    "Keep your camera on throughout the interview",
    "You'll have access to a code editor during the technical assessment",
    "Feel free to think aloud and explain your approach",
    "Ask clarifying questions if needed",
  ];

  const setTitle = useHeader((state) => state.setTitle);
  useEffect(() => {
    setTitle("Interviews");
    const timer = setInterval(() => {
      setTimeUntilStart((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkSequence = async () => {
      setTimeout(() => {
        setSystemChecks((prev) => ({ ...prev, internet: "success" }));
        setProgress(33);
      }, 1000);

      setTimeout(() => {
        setSystemChecks((prev) => ({ ...prev, camera: "success" }));
        setProgress(66);
      }, 2000);

      setTimeout(() => {
        setSystemChecks((prev) => ({ ...prev, microphone: "success" }));
        setProgress(100);
      }, 3000);
    };

    checkSequence();
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusIcon = (status) => {
    if (status === "success")
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (status === "error")
      return <AlertCircle className="w-5 h-5 text-destructive" />;
    return (
      <div className="w-5 h-5 border-2 border-muted border-t-primary rounded-full animate-spin" />
    );
  };

  const getStatusColor = (status) => {
    if (status === "success") return "text-green-600";
    if (status === "error") return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-background shadow-lg">
              <AvatarImage src={candidate.avatar} alt={candidate.name} />
              <AvatarFallback className="text-2xl sm:text-3xl">
                {candidate.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
            Welcome, {candidate.name}!
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-1">
            {candidate.role}
          </p>
          <Badge variant="outline" className="text-sm px-3 py-1">
            Your interview will start soon
          </Badge>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Interview Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Countdown Card */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl sm:text-2xl">
                    Interview Starting In
                  </CardTitle>
                  <Clock className="w-6 h-6 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 font-mono">
                    {formatTime(timeUntilStart)}
                  </div>
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Waiting for interviewer
                    </p>
                  </div>
                  <Progress
                    value={(300 - timeUntilStart) / 3}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Interview Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <Briefcase className="w-5 h-5 mr-2 text-muted-foreground" />
                  Interview Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Interview Type
                      </p>
                      <p className="font-semibold">{interviewDetails.type}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Scheduled Time
                      </p>
                      <p className="font-semibold">
                        {interviewDetails.scheduledTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Monitor className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="font-semibold">
                        {interviewDetails.company}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-semibold">
                        {interviewDetails.duration}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>
                        {interviewDetails.interviewer
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {interviewDetails.interviewer}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {interviewDetails.interviewerRole}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guidelines Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Interview Guidelines
                </CardTitle>
                <CardDescription>
                  Please review these important points before starting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {guidelines.map((guideline, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                      <span className="text-sm sm:text-base">{guideline}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - System Checks */}
          <div className="space-y-6">
            {/* System Checks Card */}
            <Card className="top-4">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  System Checks
                </CardTitle>
                <CardDescription>Verifying your setup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Wifi className="w-5 h-5 text-muted-foreground" />
                      <span
                        className={`font-medium ${getStatusColor(systemChecks.internet)}`}
                      >
                        Internet Connection
                      </span>
                    </div>
                    {getStatusIcon(systemChecks.internet)}
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Video className="w-5 h-5 text-muted-foreground" />
                      <span
                        className={`font-medium ${getStatusColor(systemChecks.camera)}`}
                      >
                        Camera
                      </span>
                    </div>
                    {getStatusIcon(systemChecks.camera)}
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mic className="w-5 h-5 text-muted-foreground" />
                      <span
                        className={`font-medium ${getStatusColor(systemChecks.microphone)}`}
                      >
                        Microphone
                      </span>
                    </div>
                    {getStatusIcon(systemChecks.microphone)}
                  </div>
                </div>

                <Separator />

                <Button
                  className="w-full"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    window.open("https://webcammictest.com/", "_blank");
                  }}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Test Camera & Microphone
                </Button>

                {progress === 100 && (
                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                        All systems ready!
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">💡 Keep water nearby</p>
                <p className="text-sm">💡 Have a pen and paper ready</p>
                <p className="text-sm">💡 Close unnecessary tabs</p>
                <p className="text-sm">💡 Ensure good lighting</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Message */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3 text-center">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
              <p className="text-sm sm:text-base text-muted-foreground font-medium">
                Please wait while the interviewer joins. You'll be notified when
                the interview begins.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Having technical issues?
            <Button variant="link" className="px-2">
              Contact Support
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterviewLobbyPage;
