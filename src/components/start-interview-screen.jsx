"use client"
import React, { useState, useEffect } from "react";
import {
  Video,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Mic,
  Bot,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

/* -------------------------------------------------------------------------- */
/*                              Start Interview Component                     */
/* -------------------------------------------------------------------------- */

function StartInterviewScreen({
  onStartInterview,
  isInitializing,
  isReadyToStart,
  permissionError,
}) {
  const [systemChecks, setSystemChecks] = useState({
    camera: "checking",
    microphone: "checking",
  });

  useEffect(() => {
    if (permissionError) {
      setSystemChecks({
        camera: "error",
        microphone: "error",
      });
      return;
    }

    if (isReadyToStart) {
      setSystemChecks({
        camera: "success",
        microphone: "success",
      });
      return;
    }

    setSystemChecks({
      camera: "checking",
      microphone: "checking",
    });
  }, [isReadyToStart, permissionError]);

  const getStatusIcon = (status) => {
    if (status === "error") {
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    }
    if (status === "success")
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    return (
      <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin" />
    );
  };

  const getStatusColor = (status) => {
    if (status === "error") return "text-destructive";
    if (status === "success") return "text-green-600";
    return "text-muted-foreground";
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md mx-auto border-2 shadow-2xl">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <div className="relative mx-auto w-16 h-16">
                <Video className="h-16 w-16 text-primary" />
                <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full"></div>
              </div>
              <div className="h-16 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold">Start Interview</h2>
                <p className="text-sm text-muted-foreground">
                  AI-powered technical interview with real-time transcription
                </p>
              </div>
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
                disabled={isInitializing || !isReadyToStart || Boolean(permissionError)}
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
                    {!isReadyToStart ? (
                      <span>Preparing Interview...</span>
                    ) : (
                      <span>Start Interview Now</span>
                    )}
                  </>
                )}
              </Button>

              {!isReadyToStart && !isInitializing && (
                <p className="text-xs text-muted-foreground mt-2">
                  Please wait while interview details are loading.
                </p>
              )}
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StartInterviewScreen;
