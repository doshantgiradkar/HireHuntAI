"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Briefcase,
  Building,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  ExternalLink,
  CalendarDays,
  Users,
  FileText,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"

// Mock data for upcoming interviews
const upcomingInterviews = [
  {
    id: 1,
    company: "TechCorp Solutions",
    position: "Senior Frontend Developer",
    type: "Technical Round",
    interviewer: "Sarah Chen",
    interviewerRole: "Senior Engineering Manager",
    scheduledTime: new Date(Date.now() + 86400000 * 2), // 2 days from now
    duration: "60 minutes",
    status: "scheduled",
    difficulty: "Medium",
    preparationStatus: "In Progress",
    preparationProgress: 65,
    meetingLink: "#",
    interviewMode: "video",
  },
  {
    id: 2,
    company: "InnovateAI",
    position: "React Native Developer",
    type: "Cultural Fit",
    interviewer: "Michael Rodriguez",
    interviewerRole: "CTO",
    scheduledTime: new Date(Date.now() + 86400000 * 5), // 5 days from now
    duration: "45 minutes",
    status: "scheduled",
    difficulty: "Easy",
    preparationStatus: "Not Started",
    preparationProgress: 20,
    meetingLink: "#",
    interviewMode: "video",
  },
  {
    id: 3,
    company: "QuantumSoft",
    position: "Full Stack Developer",
    type: "System Design",
    interviewer: "David Kim",
    interviewerRole: "Principal Engineer",
    scheduledTime: new Date(Date.now() + 86400000 * 7), // 7 days from now
    duration: "90 minutes",
    status: "scheduled",
    difficulty: "Hard",
    preparationStatus: "Completed",
    preparationProgress: 100,
    meetingLink: "#",
    interviewMode: "onsite",
  },
  {
    id: 4,
    company: "MetaTech",
    position: "Frontend Engineer II",
    type: "Coding Round",
    interviewer: "Lisa Wang",
    interviewerRole: "Engineering Lead",
    scheduledTime: new Date(Date.now() + 86400000 * 3), // 3 days from now
    duration: "75 minutes",
    status: "rescheduled",
    difficulty: "Medium",
    preparationStatus: "In Progress",
    preparationProgress: 45,
    meetingLink: "#",
    interviewMode: "video",
  },
  {
    id: 5,
    company: "CloudScale",
    position: "DevOps Engineer",
    type: "Technical Screening",
    interviewer: "Robert Johnson",
    interviewerRole: "DevOps Manager",
    scheduledTime: new Date(Date.now() + 86400000 * 10), // 10 days from now
    duration: "50 minutes",
    status: "scheduled",
    difficulty: "Medium",
    preparationStatus: "Not Started",
    preparationProgress: 0,
    meetingLink: "#",
    interviewMode: "video",
  },
  {
    id: 6,
    company: "DataFlow Inc",
    position: "Backend Engineer",
    type: "Technical + HR",
    interviewer: "Alexandra Smith",
    interviewerRole: "Head of Engineering",
    scheduledTime: new Date(Date.now() + 86400000 * 12), // 12 days from now
    duration: "120 minutes",
    status: "pending",
    difficulty: "Hard",
    preparationStatus: "In Progress",
    preparationProgress: 30,
    meetingLink: "#",
    interviewMode: "video",
  },
]

const completedInterviews = [
  {
    id: 7,
    company: "WebTech",
    position: "Frontend Developer",
    type: "Final Round",
    interviewer: "John Davis",
    interviewerRole: "Director of Engineering",
    scheduledTime: new Date(Date.now() - 86400000 * 3), // 3 days ago
    duration: "45 minutes",
    status: "completed",
    result: "Passed",
    rating: 4.5,
    feedback: "Excellent performance",
  },
]

const candidate = {
  name: "Alex Johnson",
  avatar: "",
  role: "Full Stack Developer",
  upcomingCount: 6,
  completedCount: 1,
  nextInterview: upcomingInterviews[0],
}

const getStatusBadge = (status) => {
  switch (status) {
    case "scheduled":
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Clock className="w-3 h-3 mr-1" />
          Scheduled
        </Badge>
      )
    case "rescheduled":
      return (
        <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
          <AlertCircle className="w-3 h-3 mr-1" />
          Rescheduled
        </Badge>
      )
    case "pending":
      return (
        <Badge variant="outline" className="text-gray-700 border-gray-200 bg-gray-50">
          <Calendar className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      )
    case "completed":
      return (
        <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getDifficultyBadge = (difficulty) => {
  switch (difficulty) {
    case "Easy":
      return <Badge variant="outline" className="text-green-700 border-green-200">Easy</Badge>
    case "Medium":
      return <Badge variant="outline" className="text-amber-700 border-amber-200">Medium</Badge>
    case "Hard":
      return <Badge variant="outline" className="text-red-700 border-red-200">Hard</Badge>
    default:
      return <Badge variant="outline">{difficulty}</Badge>
  }
}

const getInterviewModeIcon = (mode) => {
  switch (mode) {
    case "video":
      return <Video className="w-4 h-4" />
    case "onsite":
      return <MapPin className="w-4 h-4" />
    case "phone":
      return <Briefcase className="w-4 h-4" />
    default:
      return <Video className="w-4 h-4" />
  }
}

const formatDate = (date) => {
  const options = { month: 'short', day: 'numeric', year: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

const formatTime = (date) => {
  const options = { hour: 'numeric', minute: '2-digit', hour12: true }
  return date.toLocaleTimeString('en-US', options)
}

const getDaysUntil = (date) => {
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export default function InterviewsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("upcoming")

  const handleJoinInterview = (interviewId) => {
    // Navigate to the interview page
    router.push(`/interviews/${interviewId}`)
  }

  const handleViewDetails = (interviewId) => {
    // Navigate to interview details page or show modal
    router.push(`/interviews/${interviewId}/details`)
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Interview Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Manage and prepare for your upcoming interviews
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={candidate.avatar} alt={candidate.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  AJ
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{candidate.name}</p>
                <p className="text-sm text-muted-foreground">{candidate.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Interviews</p>
                  <p className="text-3xl font-bold">{candidate.upcomingCount}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <CalendarDays className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Next Interview In</p>
                  <p className="text-3xl font-bold">
                    {getDaysUntil(candidate.nextInterview.scheduledTime)} days
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-3xl font-bold">85%</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upcoming Interviews List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Your Interviews</h2>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Add to Calendar
              </Button>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming">Upcoming ({upcomingInterviews.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedInterviews.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4 mt-4">
                {upcomingInterviews.map((interview) => (
                  <Card key={interview.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{interview.position}</CardTitle>
                            {getStatusBadge(interview.status)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <CardDescription className="text-base font-medium">
                              {interview.company}
                            </CardDescription>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(interview.id)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>Reschedule</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Cancel Interview</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    <CardContent className="pb-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(interview.scheduledTime)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatTime(interview.scheduledTime)} • {interview.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{interview.interviewer} • {interview.interviewerRole}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            {getInterviewModeIcon(interview.interviewMode)}
                            <span className="text-sm capitalize">{interview.interviewMode} Interview</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{interview.type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getDifficultyBadge(interview.difficulty)}
                          </div>
                        </div>
                      </div>

                      {/* Preparation Progress */}
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Preparation Status</span>
                          <span>{interview.preparationStatus}</span>
                        </div>
                        <Progress value={interview.preparationProgress} className="h-2" />
                      </div>
                    </CardContent>

                    <CardFooter className="border-t pt-4 flex justify-between">
                      <div className="text-sm text-muted-foreground">
                        {getDaysUntil(interview.scheduledTime) === 0
                          ? "Today"
                          : `${getDaysUntil(interview.scheduledTime)} days left`}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(interview.id)}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Details
                        </Button>
                        <Button 
                          size="sm" 
                          disabled={interview.status === "pending"}
                          onClick={() => handleJoinInterview(interview.id)}
                        >
                          <Video className="mr-2 h-4 w-4" />
                          Join Interview
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4 mt-4">
                {completedInterviews.map((interview) => (
                  <Card key={interview.id} className="opacity-80 hover:opacity-100 transition-opacity">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{interview.position}</CardTitle>
                            {getStatusBadge(interview.status)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="text-base font-medium">{interview.company}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatDate(interview.scheduledTime)}
                            <Clock className="h-4 w-4 ml-2" />
                            {formatTime(interview.scheduledTime)}
                          </div>
                          {interview.result && (
                            <Badge variant={interview.result === "Passed" ? "default" : "destructive"}>
                              {interview.result}
                            </Badge>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          View Feedback
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Next Interview & Tips */}
          <div className="space-y-6">
            {/* Next Interview Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Next Interview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border">
                      <AvatarFallback className="bg-blue-100 text-blue-800">
                        {candidate.nextInterview.company.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{candidate.nextInterview.position}</p>
                      <p className="text-sm text-muted-foreground">{candidate.nextInterview.company}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Date & Time</span>
                      <span className="text-sm font-medium">
                        {formatDate(candidate.nextInterview.scheduledTime)} at{" "}
                        {formatTime(candidate.nextInterview.scheduledTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Duration</span>
                      <span className="text-sm font-medium">{candidate.nextInterview.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Interviewer</span>
                      <span className="text-sm font-medium">{candidate.nextInterview.interviewer}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => handleJoinInterview(candidate.nextInterview.id)}
                >
                  <Video className="mr-2 h-4 w-4" />
                  Join Interview
                </Button>

                <div className="text-xs text-muted-foreground text-center">
                  Join 10 minutes before scheduled time
                </div>
              </CardContent>
            </Card>

            {/* Preparation Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Preparation Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-blue-800">1</span>
                    </div>
                    <p className="text-sm">Review the company's tech stack and recent projects</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-green-800">2</span>
                    </div>
                    <p className="text-sm">Practice common algorithm and system design questions</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-amber-800">3</span>
                    </div>
                    <p className="text-sm">Test your camera, microphone, and internet connection</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-purple-800">4</span>
                    </div>
                    <p className="text-sm">Prepare 2-3 questions to ask the interviewer</p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}