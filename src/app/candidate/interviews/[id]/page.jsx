"use client";

import React, { useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Volume2,
  User,
  Bot,
  MessageSquare,
  Clock,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

/* -------------------------------------------------------------------------- */
/*                                  Mock Data                                 */
/* -------------------------------------------------------------------------- */

const transcriptData = [
  {
    id: 1,
    speaker: "AI Interviewer",
    timestamp: "10:00 AM",
    message:
      "Welcome to your technical interview. Could you briefly introduce yourself?",
    isAI: true,
  },
  {
    id: 2,
    speaker: "You",
    timestamp: "10:01 AM",
    message:
      "Sure. I'm a frontend developer with strong experience in React and Next.js.",
    isAI: false,
  },
  {
    id: 3,
    speaker: "AI Interviewer",
    timestamp: "10:02 AM",
    message:
      "Great. Can you explain when you would use useMemo versus useCallback?",
    isAI: true,
  },
];

const questionsList = [
  { id: 1, text: "Tell me about your background.", status: "answered" },
  {
    id: 2,
    text: "Explain useMemo vs useCallback.",
    status: "current",
  },
  {
    id: 3,
    text: "How does the Next.js App Router work?",
    status: "upcoming",
  },
];

/* -------------------------------------------------------------------------- */
/*                               Profile Card                                 */
/* -------------------------------------------------------------------------- */

function ProfileCard({
  name,
  role,
  isAI,
  isMuted,
  isSpeaking,
  isVideoEnabled,
}) {
  return (
    <Card className="h-full overflow-hidden">
      <CardContent className="relative h-full p-0">
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-xl">
              {isAI ? <Bot /> : <User />}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/90 px-3 py-1.5 rounded-md">
          <span className="font-medium">{name}</span>
          <Badge variant={isAI ? "default" : "outline"}>{role}</Badge>
        </div>

        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          {isMuted && (
            <Badge variant="destructive" className="gap-1">
              <MicOff className="h-3 w-3" />
              Muted
            </Badge>
          )}
          {!isVideoEnabled && (
            <Badge variant="secondary" className="gap-1">
              <VideoOff className="h-3 w-3" />
              Video Off
            </Badge>
          )}
        </div>

        {isSpeaking && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-primary">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Speaking
          </div>
        )}

        <div className="absolute bottom-4 right-4 text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          00:21:32
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Transcript Panel                               */
/* -------------------------------------------------------------------------- */

function InterviewPanel() {
  return (
    <Card className="h-full flex flex-col">
      <Tabs defaultValue="transcript" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 rounded-none">
          <TabsTrigger value="transcript">
            <MessageSquare className="h-4 w-4 mr-2" />
            Transcript
          </TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="transcript" className="flex-1 m-0">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {transcriptData.map((msg, index) => (
                <div key={msg.id}>
                  <div
                    className={`flex ${
                      msg.isAI ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-4 py-3 text-sm ${
                        msg.isAI
                          ? "bg-muted border"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-2 text-xs opacity-70">
                        <Badge
                          variant={msg.isAI ? "outline" : "secondary"}
                          className="text-xs"
                        >
                          {msg.speaker}
                        </Badge>
                        {msg.timestamp}
                      </div>
                      {msg.message}
                    </div>
                  </div>

                  {index !== transcriptData.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="questions" className="flex-1 m-0">
          <ScrollArea className="h-full p-4 space-y-3">
            {questionsList.map((q, i) => (
              <div
                key={q.id}
                className={`p-3 rounded-lg border ${
                  q.status === "current"
                    ? "border-primary bg-primary/5"
                    : "bg-muted/40"
                }`}
              >
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm">{q.text}</p>
                    <Badge
                      variant={q.status === "answered" ? "default" : "outline"}
                      className="mt-2 text-xs"
                    >
                      {q.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Control Bar                                 */
/* -------------------------------------------------------------------------- */

function ControlBar({
  isAudioMuted,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo,
}) {
  return (
    <div className="border-t bg-background sticky bottom-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-3">
        <Button
          variant={isAudioMuted ? "destructive" : "secondary"}
          size="icon"
          onClick={onToggleAudio}
        >
          {isAudioMuted ? <MicOff /> : <Mic />}
        </Button>

        <Button
          variant={!isVideoEnabled ? "destructive" : "secondary"}
          size="icon"
          onClick={onToggleVideo}
        >
          {isVideoEnabled ? <Video /> : <VideoOff />}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon">
              <Phone className="-rotate-45" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>End Interview?</AlertDialogTitle>
              <AlertDialogDescription>
                This will end the session and save the transcript.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>End Interview</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Main Layout                                   */
/* -------------------------------------------------------------------------- */

export default function InterviewLayout() {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <h1 className="text-xl font-bold">
            Technical Interview — Frontend
          </h1>
          <p className="text-sm text-muted-foreground">
            AI-powered live interview session
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <section className="lg:col-span-2 flex flex-col gap-4 min-h-0">
            <div className="flex-1 min-h-0">
              <ProfileCard
                name="AI Interviewer"
                role="Interviewer"
                isAI
                isMuted={false}
                isSpeaking
                isVideoEnabled
              />
            </div>

            <div className="flex-1 min-h-0">
              <ProfileCard
                name="Alex Johnson"
                role="Candidate"
                isAI={false}
                isMuted={isAudioMuted}
                isSpeaking={false}
                isVideoEnabled={isVideoEnabled}
              />
            </div>
          </section>

          <aside className="min-h-0">
            <InterviewPanel />
          </aside>
        </div>
      </main>

      <ControlBar
        isAudioMuted={isAudioMuted}
        isVideoEnabled={isVideoEnabled}
        onToggleAudio={() => setIsAudioMuted((v) => !v)}
        onToggleVideo={() => setIsVideoEnabled((v) => !v)}
      />
    </div>
  );
}
