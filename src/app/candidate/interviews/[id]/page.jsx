"use client"
import React, { useState, useEffect, useRef, useCallback } from "react";
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
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
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

/* -------------------------------------------------------------------------- */
/*                          WebRTC Media Hook                                 */
/* -------------------------------------------------------------------------- */

function useLocalMediaStream() {
  const [stream, setStream] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [permissionError, setPermissionError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const streamRef = useRef(null);

  const initializeStream = useCallback(async () => {
    if (streamRef.current) {
      return;
    }

    setIsInitializing(true);
    setPermissionError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);

    } catch (error) {
      console.error("Failed to get user media:", error);
      
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setPermissionError("Camera and microphone access denied. Please allow permissions in your browser settings.");
      } else if (error.name === "NotFoundError") {
        setPermissionError("No camera or microphone found. Please connect a device and try again.");
      } else if (error.name === "NotReadableError") {
        setPermissionError("Camera or microphone is already in use by another application.");
      } else {
        setPermissionError("Failed to access camera and microphone. Please check your device settings.");
      }
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      const newState = !isAudioEnabled;
      audioTracks.forEach(track => {
        track.enabled = newState;
      });
      setIsAudioEnabled(newState);
    }
  }, [isAudioEnabled]);

  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      const newState = !isVideoEnabled;
      videoTracks.forEach(track => {
        track.enabled = newState;
      });
      setIsVideoEnabled(newState);
    }
  }, [isVideoEnabled]);

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    stream,
    isAudioEnabled,
    isVideoEnabled,
    permissionError,
    isInitializing,
    initializeStream,
    toggleAudio,
    toggleVideo,
    cleanup,
  };
}

/* -------------------------------------------------------------------------- */
/*                              Transcript Data                               */
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
      "Sure. I'm a frontend developer with strong experience in React and Next.js. I've worked on multiple enterprise applications and have 5 years of experience in the field.",
    isAI: false,
  },
  {
    id: 3,
    speaker: "AI Interviewer",
    timestamp: "10:02 AM",
    message: "Great. Can you explain when you would use useMemo versus useCallback?",
    isAI: true,
  },
  {
    id: 4,
    speaker: "You",
    timestamp: "10:03 AM",
    message:
      "useMemo is used to memoize expensive calculations, while useCallback is used to memoize functions to prevent unnecessary re-renders of child components.",
    isAI: false,
  },
  {
    id: 5,
    speaker: "AI Interviewer",
    timestamp: "10:05 AM",
    message: "Excellent. How would you optimize a React application for performance?",
    isAI: true,
  },
  {
    id: 6,
    speaker: "You",
    timestamp: "10:06 AM",
    message:
      "I would use React.memo for components, implement code splitting with dynamic imports, use virtualization for large lists, and optimize images and assets.",
    isAI: false,
  },
  {
    id: 7,
    speaker: "AI Interviewer",
    timestamp: "10:08 AM",
    message: "What's your experience with TypeScript in React applications?",
    isAI: true,
  },
  {
    id: 8,
    speaker: "You",
    timestamp: "10:09 AM",
    message:
      "I've been using TypeScript for 3 years. I'm comfortable with generics, type inference, and creating custom types and interfaces for complex applications.",
    isAI: false,
  },
];

/* -------------------------------------------------------------------------- */
/*                               Video Card                                   */
/* -------------------------------------------------------------------------- */

function VideoCard({
  name,
  role,
  isAI,
  isMuted,
  isSpeaking,
  isVideoEnabled,
  isFullscreen,
  onToggleFullscreen,
  stream = null,
  permissionError = null,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
    
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  const showVideo = stream && isVideoEnabled;

  return (
    <Card className={`h-full flex flex-col border-2 ${isFullscreen ? 'border-primary/50' : 'border-transparent'} hover:border-primary/30 transition-colors`}>
      <CardContent className="relative flex-1 p-4">
        <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden">
          
          {showVideo && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={true}
              className="absolute inset-0 w-full h-full object-cover"
              aria-label={`${name}'s video feed`}
            />
          )}

          {!showVideo && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {isAI && (
                  <div className="absolute inset-0 animate-pulse">
                    <div className="h-full w-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl"></div>
                  </div>
                )}
                
                <div className="relative z-10">
                  <Avatar className="h-32 w-32 border-4 border-background">
                    <AvatarFallback className={`text-2xl ${isAI ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-gray-700 to-gray-900'}`}>
                      {isAI ? (
                        <Bot className="h-12 w-12" />
                      ) : (
                        <User className="h-12 w-12" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          )}

          {permissionError && !isAI && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 z-20">
              <div className="text-center max-w-sm">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                <p className="text-sm text-white mb-2 font-medium">Camera Access Required</p>
                <p className="text-xs text-gray-300">{permissionError}</p>
              </div>
            </div>
          )}

          <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
            <Badge
              variant={isAI ? "default" : "secondary"}
              className="bg-background/80 backdrop-blur-sm"
            >
              {role}
            </Badge>
            {isSpeaking && (
              <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs">Speaking</span>
              </div>
            )}
          </div>

          <div className="absolute top-3 right-3 flex gap-2 z-10">
            {isMuted && (
              <div className="bg-destructive/80 backdrop-blur-sm p-2 rounded-md" aria-label="Microphone muted">
                <MicOff className="h-4 w-4 text-white" />
              </div>
            )}
            {!isVideoEnabled && (
              <div className="bg-secondary/80 backdrop-blur-sm p-2 rounded-md" aria-label="Camera off">
                <VideoOff className="h-4 w-4" />
              </div>
            )}
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
            <div className="bg-background/80 backdrop-blur-sm px-3 py-2 rounded-md">
              <p className="font-medium">{name}</p>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={onToggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Transcript Panel                              */
/* -------------------------------------------------------------------------- */

function TranscriptPanel() {
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [transcriptData, autoScroll]);

  return (
    <Card className="h-full flex flex-col border-2 border-transparent hover:border-primary/30 transition-colors">
      <div className="p-4 border-b flex items-center justify-between bg-card/50 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Live Transcript</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAutoScroll(!autoScroll)}
          className="h-8 px-2"
        >
          {autoScroll ? (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              <span className="text-xs">Auto-scroll</span>
            </>
          ) : (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              <span className="text-xs">Scroll paused</span>
            </>
          )}
        </Button>
      </div>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
            {transcriptData.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isAI ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 break-words ${
                    msg.isAI
                      ? "bg-muted border"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                    <Badge
                      variant={msg.isAI ? "outline" : "secondary"}
                      className="text-xs shrink-0"
                    >
                      {msg.speaker}
                    </Badge>
                    <span className="text-xs opacity-70 shrink-0">{msg.timestamp}</span>
                  </div>
                  <p className="text-sm break-words">{msg.message}</p>
                </div>
              </div>
            ))}
            
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-muted border border-dashed">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs bg-blue-500/10">
                    AI Interviewer
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse delay-75"></div>
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse delay-150"></div>
                  </div>
                  <p className="text-sm text-muted-foreground">Speaking...</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
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
  onEndInterview,
  hasStream,
}) {
  const [volume, setVolume] = useState(80);

  return (
    <div className="border-t bg-card/80 backdrop-blur-sm shrink-0">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>22:15</span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            {hasStream ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                <div className="h-2 w-2 rounded-full bg-yellow-500 mr-1"></div>
                Disconnected
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-24 accent-primary"
                aria-label="Volume control"
              />
              <span className="text-xs w-8">{volume}%</span>
            </div>

            <Button
              variant={isAudioMuted ? "destructive" : "secondary"}
              size="icon"
              onClick={onToggleAudio}
              className="h-10 w-10 rounded-full"
              aria-label={isAudioMuted ? "Unmute microphone" : "Mute microphone"}
              disabled={!hasStream}
            >
              {isAudioMuted ? <MicOff /> : <Mic />}
            </Button>

            <Button
              variant={!isVideoEnabled ? "destructive" : "secondary"}
              size="icon"
              onClick={onToggleVideo}
              className="h-10 w-10 rounded-full"
              aria-label={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
              disabled={!hasStream}
            >
              {isVideoEnabled ? <Video /> : <VideoOff />}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="h-10 px-4 sm:px-6 rounded-full">
                  <PhoneOff className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">End Interview</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>End Interview Session?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will end the current interview. Your progress and transcript will be saved.
                    Are you sure you want to end the interview?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onEndInterview} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    End Interview
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Main Layout                                   */
/* -------------------------------------------------------------------------- */

export default function InterviewLayout() {
  const {
    stream: candidateStream,
    isAudioEnabled,
    isVideoEnabled,
    permissionError,
    isInitializing,
    initializeStream,
    toggleAudio,
    toggleVideo,
    cleanup,
  } = useLocalMediaStream();

  const [fullscreenMode, setFullscreenMode] = useState(null);
  const [interviewStarted, setInterviewStarted] = useState(false);

  const handleStartInterview = async () => {
    await initializeStream();
    setInterviewStarted(true);
  };

  const handleEndInterview = () => {
    cleanup();
    setInterviewStarted(false);
    setFullscreenMode(null);
  };

  const handleToggleFullscreen = (mode) => {
    if (fullscreenMode === mode) {
      setFullscreenMode(null);
    } else {
      setFullscreenMode(mode);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header className="border-b bg-card/80 backdrop-blur-sm shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">
                AI Technical Interview — Frontend Developer
              </h1>
              <p className="text-sm text-muted-foreground">
                Real-time AI-powered interview session
              </p>
            </div>
            <div className="flex items-center gap-2">
              {interviewStarted && (
                <>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <div className="h-2 w-2 rounded-full bg-red-500 mr-1 animate-pulse"></div>
                    Live
                  </Badge>
                  <Badge variant="secondary">
                    <div className="h-2 w-2 rounded-full bg-primary mr-1"></div>
                    Recording
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-4">
        {!interviewStarted && (
          <div className="h-full flex items-center justify-center">
            <Card className="max-w-md w-full border-2 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 text-center space-y-4">
                <div className="relative">
                  <Camera className="h-16 w-16 mx-auto text-primary" />
                  <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full"></div>
                </div>
                <h2 className="text-2xl font-bold">Ready to Start?</h2>
                <p className="text-muted-foreground">
                  Click the button below to start your AI interview. We'll need access to your camera and microphone.
                </p>
                
                {permissionError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{permissionError}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleStartInterview}
                  disabled={isInitializing}
                  className="w-full"
                  size="lg"
                >
                  {isInitializing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Initializing...
                    </>
                  ) : (
                    <>
                      <Video className="h-5 w-5 mr-2" />
                      Start Interview
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground">
                  By starting, you agree to video and audio recording for interview purposes.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {interviewStarted && (
          <div className="h-full flex gap-4">
            <div className={`flex-1 ${fullscreenMode ? 'h-full' : 'grid grid-rows-2 gap-4 md:grid-rows-1 md:grid-cols-2'}`}>
              {fullscreenMode === 'ai' && (
                <div className="h-full">
                  <VideoCard
                    name="AI Interviewer"
                    role="AI Assistant"
                    isAI={true}
                    isMuted={false}
                    isSpeaking={true}
                    isVideoEnabled={true}
                    isFullscreen={true}
                    onToggleFullscreen={() => handleToggleFullscreen('ai')}
                    stream={null}
                  />
                </div>
              )}
              
              {fullscreenMode === 'candidate' && (
                <div className="h-full">
                  <VideoCard
                    name="Alex Johnson"
                    role="Candidate"
                    isAI={false}
                    isMuted={!isAudioEnabled}
                    isSpeaking={false}
                    isVideoEnabled={isVideoEnabled}
                    isFullscreen={true}
                    onToggleFullscreen={() => handleToggleFullscreen('candidate')}
                    stream={candidateStream}
                    permissionError={permissionError}
                  />
                </div>
              )}
              
              {!fullscreenMode && (
                <>
                  <VideoCard
                    name="AI Interviewer"
                    role="AI Assistant"
                    isAI={true}
                    isMuted={false}
                    isSpeaking={true}
                    isVideoEnabled={true}
                    isFullscreen={false}
                    onToggleFullscreen={() => handleToggleFullscreen('ai')}
                    stream={null}
                  />
                  <VideoCard
                    name="Alex Johnson"
                    role="Candidate"
                    isAI={false}
                    isMuted={!isAudioEnabled}
                    isSpeaking={false}
                    isVideoEnabled={isVideoEnabled}
                    isFullscreen={false}
                    onToggleFullscreen={() => handleToggleFullscreen('candidate')}
                    stream={candidateStream}
                    permissionError={permissionError}
                  />
                </>
              )}
            </div>

            {!fullscreenMode && (
              <div className="hidden lg:flex w-[400px] h-full">
                <TranscriptPanel />
              </div>
            )}
          </div>
        )}
      </main>

      {interviewStarted && (
        <ControlBar
          isAudioMuted={!isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onEndInterview={handleEndInterview}
          hasStream={!!candidateStream}
        />
      )}
    </div>
  );
}