"use client"
import React, { useState, useEffect, useRef, useCallback } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Volume2,
  User,
  Bot,
  MessageSquare,
  Clock,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Camera,
  ChevronDown,
  ChevronUp,
  Radio,
  Square,
  Play,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Briefcase,
  FileText,
  Monitor,
  Wifi,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress"; // If you're using Progress component
/* -------------------------------------------------------------------------- */
/*                              Start Interview Component                     */
/* -------------------------------------------------------------------------- */

function StartInterviewScreen({
  onStartInterview,
  isInitializing,
  permissionError,
}) {
  const [systemChecks, setSystemChecks] = useState({
    camera: "checking",
    microphone: "checking",
  });

  useEffect(() => {
    const checkSequence = async () => {
      setTimeout(() => {
        setSystemChecks((prev) => ({ ...prev, camera: "success" }));
      }, 1000);

      setTimeout(() => {
        setSystemChecks((prev) => ({ ...prev, microphone: "success" }));
      }, 2000);
    };

    checkSequence();
  }, []);

  const getStatusIcon = (status) => {
    if (status === "success")
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    return (
      <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin" />
    );
  };

  const getStatusColor = (status) => {
    if (status === "success") return "text-green-600";
    return "text-muted-foreground";
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md mx-auto border-2 shadow-2xl">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            {/* Header */}
            <div className="space-y-2">
              <div className="relative mx-auto w-16 h-16">
                <Video className="h-16 w-16 text-primary" />
                <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full"></div>
              </div>
              <h2 className="text-2xl font-bold">Start Interview</h2>
              <p className="text-sm text-muted-foreground">
                AI-powered technical interview with real-time transcription
              </p>
            </div>

            {/* System Checks */}
            <div className="space-y-3 py-4 border-y">
              <h3 className="text-sm font-medium">System Check</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-muted-foreground" />
                    <span className={`text-sm ${getStatusColor(systemChecks.camera)}`}>
                      Camera
                    </span>
                  </div>
                  {getStatusIcon(systemChecks.camera)}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-muted-foreground" />
                    <span className={`text-sm ${getStatusColor(systemChecks.microphone)}`}>
                      Microphone
                    </span>
                  </div>
                  {getStatusIcon(systemChecks.microphone)}
                </div>
              </div>
            </div>

            {/* Permission Error Alert */}
            {permissionError && (
              <Alert variant="destructive" className="text-sm">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Camera/mic access required. Please allow permissions.
                </AlertDescription>
              </Alert>
            )}

            {/* Quick Info */}
            <div className="text-left space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>45 minutes • Frontend Technical</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Bot className="w-4 h-4 text-muted-foreground" />
                <span>AI Interviewer • TechCorp Solutions</span>
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-4">
              <Button
                onClick={onStartInterview}
                disabled={isInitializing}
                size="lg"
                className="w-full"
              >
                {isInitializing ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Initializing...
                  </>
                ) : (
                  <>
                    <Video className="h-5 w-5 mr-2" />
                    Start Interview Now
                  </>
                )}
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StartInterviewScreen;