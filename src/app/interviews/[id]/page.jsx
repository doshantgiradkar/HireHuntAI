"use client"
import React, { useState, useEffect, useRef, useCallback } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import {
  MicOff,
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
  ChevronDown,
  ChevronUp,
  Radio,
  Square,
  Play,
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
import StartInterviewScreen from "@/components/start-interview-screen";

/* -------------------------------------------------------------------------- */
/*                          Speech Recognition Data                           */
/* -------------------------------------------------------------------------- */

const initialTranscriptData = [
  {
    id: 1,
    speaker: "AI Interviewer",
    timestamp: "10:00 AM",
    message: "Welcome to your technical interview. Could you briefly introduce yourself?",
    isAI: true,
  },
  {
    id: 2,
    speaker: "You",
    timestamp: "10:01 AM",
    message: "Sure. I'm a frontend developer with strong experience in React and Next.js.",
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
    message: "useMemo is for expensive calculations, useCallback is for memoizing functions.",
    isAI: false,
  },
  {
    id: 5,
    speaker: "AI Interviewer",
    timestamp: "10:05 AM",
    message: "Excellent. How would you optimize a React application?",
    isAI: true,
  },
];

const aiQuestions = [
  "Welcome to your technical interview. Could you briefly introduce yourself?",
  "Great. Can you explain when you would use useMemo versus useCallback?",
  "Excellent. How would you optimize a React application for performance?",
  "What's your experience with TypeScript in React applications?",
  "Can you explain the virtual DOM and how it works in React?",
];

/*                          Speech Recognition Hook                           */
function useInterviewSpeechRecognition() {
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcriptMessages, setTranscriptMessages] = useState(initialTranscriptData);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    setCurrentTranscript(transcript);
  }, [transcript]);

  const startListening = () => {
    SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
    setIsListening(true);
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    setIsListening(false);

    // Save the current transcript as a message
    if (transcript.trim()) {
      addTranscriptMessage("You", transcript);
      resetTranscript();
      setCurrentTranscript("");

      // Automatically trigger next AI question after a delay
      setTimeout(() => {
        if (currentQuestionIndex < aiQuestions.length) {
          speakNextQuestion();
        }
      }, 2000);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startInterview = () => {
    setHasStarted(true);
    // Start listening immediately
    startListening();
    // Ask first question after a short delay
    setTimeout(() => {
      speakNextQuestion();
    }, 1000);
  };

  const speakNextQuestion = () => {
    if (currentQuestionIndex < aiQuestions.length) {
      const question = aiQuestions[currentQuestionIndex];

      // Add AI message to transcript
      addTranscriptMessage("AI Interviewer", question);

      // Speak the question
      const speech = new SpeechSynthesisUtterance(question);
      speech.lang = "en-IN";
      speech.rate = 1.0;
      speech.pitch = 1.0;

      speech.onstart = () => setIsSpeaking(true);
      speech.onend = () => {
        setIsSpeaking(false);
        setCurrentQuestionIndex(prev => prev + 1);
        // Automatically start listening for user's response
        if (hasStarted) {
          setTimeout(() => {
            startListening();
          }, 500);
        }
      };

      window.speechSynthesis.speak(speech);
    }
  };

  const addTranscriptMessage = (speaker, message) => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now(),
        speaker,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: message.trim(),
        isAI: speaker === "AI Interviewer",
      };
      setTranscriptMessages(prev => [...prev, newMessage]);
    }
  };

  return {
    currentTranscript,
    transcriptMessages,
    isListening,
    isSpeaking,
    hasStarted,
    browserSupportsSpeechRecognition,
    startListening,
    stopListening,
    toggleListening,
    startInterview,
    addTranscriptMessage,
    currentQuestionIndex,
    hasMoreQuestions: currentQuestionIndex < aiQuestions.length,
  };
}

/* -------------------------------------------------------------------------- */
/*                          WebRTC Media Hook                                 */
/* -------------------------------------------------------------------------- */

function useLocalMediaStream() {
  const [stream, setStream] = useState(null);
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
    permissionError,
    isInitializing,
    initializeStream,
    cleanup,
  };
}

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
      videoRef.current.play().catch(e => {
        console.log("Video play failed:", e);
      });
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  const showVideo = stream && isVideoEnabled && !permissionError;

  return (
    <Card className={`h-full flex flex-col border-2 ${isFullscreen ? 'border-primary/50' : 'border-transparent'} hover:border-primary/30 transition-colors`}>
      <CardContent className="relative flex-1 p-2 sm:p-3 md:p-4">
        <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden">

          {showVideo ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={true}
              className="absolute inset-0 w-full h-full object-cover bg-black"
              aria-label={`${name}'s video feed`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
              <div className="relative">
                {isAI && (
                  <div className="absolute inset-0 animate-pulse">
                    <div className="h-full w-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl"></div>
                  </div>
                )}

                <div className="relative z-10">
                  <Avatar className="h-16 w-16 sm:h-20 md:h-24 lg:h-32 sm:w-20 md:w-24 lg:w-32 border-2 sm:border-3 md:border-4 border-background">
                    <AvatarFallback className={`text-lg sm:text-xl md:text-2xl ${isAI ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-gray-700 to-gray-900'}`}>
                      {isAI ? (
                        <Bot className="h-8 w-8 sm:h-10 md:h-12 sm:w-10 md:w-12 text-white" />
                      ) : (
                        <User className="h-8 w-8 sm:h-10 md:h-12 sm:w-10 md:w-12 text-white" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          )}

          {permissionError && !isAI && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 z-20">
              <div className="text-center max-w-sm">
                <AlertTriangle className="h-8 w-8 sm:h-10 md:h-12 sm:w-10 md:w-12 text-yellow-500 mx-auto mb-2 sm:mb-3" />
                <p className="text-xs sm:text-sm text-white mb-1 sm:mb-2 font-medium">Camera Access Required</p>
                <p className="text-xs text-gray-300">{permissionError}</p>
              </div>
            </div>
          )}

          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex items-center gap-1 sm:gap-2 z-10">
            <Badge
              variant={isAI ? "default" : "secondary"}
              className="bg-background/80 backdrop-blur-sm text-xs sm:text-sm"
            >
              {role}
            </Badge>
            {isSpeaking && (
              <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs hidden xs:inline">Speaking</span>
              </div>
            )}
          </div>

          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1 sm:gap-2 z-10">
            {isMuted && (
              <div className="bg-destructive/80 backdrop-blur-sm p-1.5 sm:p-2 rounded-md" aria-label="Microphone muted">
                <MicOff className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            )}
            {!isVideoEnabled && (
              <div className="bg-secondary/80 backdrop-blur-sm p-1.5 sm:p-2 rounded-md" aria-label="Camera off">
                <VideoOff className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
            )}
          </div>

          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between z-10">
            <div className="bg-background/80 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-2 rounded-md">
              <p className="font-medium text-xs sm:text-sm md:text-base">{name}</p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="bg-background/80 backdrop-blur-sm hover:bg-background h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
              onClick={onToggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
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

function TranscriptPanel({ transcriptMessages, isSpeaking, isListening, currentTranscript }) {
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [transcriptMessages, currentTranscript, autoScroll]);

  const allMessages = [...transcriptMessages];

  // Add current speech recognition if available
  if (currentTranscript && currentTranscript.trim()) {
    allMessages.push({
      id: Date.now(),
      speaker: "You",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message: currentTranscript,
      isAI: false,
      isLive: true,
    });
  }

  return (
    <Card className="h-full flex flex-col border-2 border-transparent hover:border-primary/30 transition-colors">
      <div className="p-3 sm:p-4 border-b flex items-center justify-between bg-card/50 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <h3 className="font-semibold text-sm sm:text-base">Live Transcript</h3>
          {isListening && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
              <span className="hidden sm:inline">Listening</span>
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAutoScroll(!autoScroll)}
          className="h-7 sm:h-8 px-2"
        >
          {autoScroll ? (
            <>
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="text-xs hidden sm:inline">Auto-scroll</span>
            </>
          ) : (
            <>
              <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="text-xs hidden sm:inline">Scroll paused</span>
            </>
          )}
        </Button>
      </div>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            {allMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isAI ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 break-words ${
                    msg.isAI
                      ? "bg-muted border"
                      : msg.isLive
                      ? "bg-primary/80 border-2 border-primary/50"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 sm:mb-2 gap-2 flex-wrap">
                    <Badge
                      variant={msg.isAI ? "outline" : "secondary"}
                      className="text-xs shrink-0"
                    >
                      {msg.speaker}
                      {msg.isLive && " (live)"}
                    </Badge>
                    <span className="text-xs opacity-70 shrink-0">{msg.timestamp}</span>
                  </div>
                  <p className="text-xs sm:text-sm break-words">{msg.message}</p>
                </div>
              </div>
            ))}

            {/* AI Speaking Indicator */}
            {isSpeaking && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 bg-muted border border-dashed">
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
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
                    <p className="text-xs sm:text-sm text-muted-foreground">Speaking...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/*                                Control Bar                                 */
function ControlBar({
  onEndInterview,
  hasStream,
  isListening,
  onToggleListening,
  isSpeaking,
  hasStarted,
  onStartInterview,
}) {
  const [volume, setVolume] = useState(80);

  return (
    <div className="border-t bg-card/80 backdrop-blur-sm shrink-0">
      <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>22:15</span>
            </div>
            <Separator orientation="vertical" className="h-4 sm:h-5 md:h-6" />
            {hasStream ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
                <span className="hidden sm:inline">Connected</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                <div className="h-2 w-2 rounded-full bg-yellow-500 mr-1"></div>
                <span className="hidden sm:inline">Disconnected</span>
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-2">
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

            {/* Start Interview Button - Only show if interview hasn't started */}
            {!hasStarted && (
              <Button
                variant="default"
                size="sm"
                className="h-8 sm:h-9 md:h-10 px-3 sm:px-4 md:px-6 rounded-full bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                onClick={onStartInterview}
                aria-label="Start Interview"
              >
                <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Start Interview</span>
              </Button>
            )}

            {/* Speech Transcription Button - Different icon to distinguish */}
            {hasStarted && (
              <Button
                variant={isListening ? "destructive" : "secondary"}
                size="icon"
                onClick={onToggleListening}
                className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full"
                aria-label={isListening ? "Stop transcription" : "Start transcription"}
                disabled={!hasStream}
              >
                {isListening ? (
                  <Square className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <Radio className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </Button>
            )}

            {/* End Interview Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="h-8 sm:h-9 md:h-10 px-3 sm:px-4 md:px-6 rounded-full text-xs sm:text-sm"
                >
                  <PhoneOff className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
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
  // WebRTC Media Hook
  const {
    stream: candidateStream,
    permissionError,
    isInitializing,
    initializeStream,
    cleanup,
  } = useLocalMediaStream();

  // Speech Recognition Hook
  const {
    currentTranscript,
    transcriptMessages,
    isListening,
    isSpeaking,
    hasStarted,
    browserSupportsSpeechRecognition,
    toggleListening,
    startInterview,
  } = useInterviewSpeechRecognition();

  // Check browser support
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Browser Not Supported</h2>
            <p className="text-muted-foreground mb-4">
              Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [fullscreenMode, setFullscreenMode] = useState(null);
  const [interviewStarted, setInterviewStarted] = useState(false);

  const handleStartInterview = async () => {
    await initializeStream();
    setInterviewStarted(true);
    startInterview();
  };

  const handleEndInterview = () => {
    cleanup();
    SpeechRecognition.stopListening();
    window.speechSynthesis.cancel();
    setInterviewStarted(false);
    setFullscreenMode(null);
  };

  const handleToggleFullscreen = (mode) => {
    setFullscreenMode(fullscreenMode === mode ? null : mode);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header className="border-b bg-card/80 backdrop-blur-sm shrink-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-base sm:text-lg md:text-xl font-bold">
                AI Technical Interview — Frontend Developer
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                Real-time AI-powered interview session with speech recognition
              </p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              {interviewStarted && (
                <>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                    <div className="h-2 w-2 rounded-full bg-red-500 mr-1 animate-pulse"></div>
                    Live
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <div className="h-2 w-2 rounded-full bg-primary mr-1"></div>
                    <span className="hidden sm:inline">Recording</span>
                  </Badge>
                  {isListening && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
                      <span className="hidden sm:inline">Transcribing</span>
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-2 sm:p-3 md:p-4 ">
        {!interviewStarted ? (
          <StartInterviewScreen
            onStartInterview={handleStartInterview}
            isInitializing={isInitializing}
            permissionError={permissionError}
          />
        ):(
          <div className="h-full flex flex-col md:flex-row gap-2 md:gap-4 items-center justify-center">
            {/* Mobile Layout: Videos side by side, transcript below */}
            <div className="md:hidden flex flex-col h-full">
              {/* Videos side by side on mobile */}
              <div className="grid grid-cols-2 gap-2 h-48">
                <VideoCard
                  name="AI Interviewer"
                  role="AI Assistant"
                  isAI={true}
                  isMuted={false}
                  isSpeaking={isSpeaking}
                  isVideoEnabled={true}
                  isFullscreen={fullscreenMode === 'ai'}
                  onToggleFullscreen={() => handleToggleFullscreen('ai')}
                  stream={null}
                />
                <VideoCard
                  name="Alex Johnson"
                  role="Candidate"
                  isAI={false}
                  isMuted={false}
                  isSpeaking={isListening}
                  isVideoEnabled={true}
                  isFullscreen={fullscreenMode === 'candidate'}
                  onToggleFullscreen={() => handleToggleFullscreen('candidate')}
                  stream={candidateStream}
                  permissionError={permissionError}
                />
              </div>
              
              {/* Transcript below on mobile */}
              <div className="flex-1 min-h-0 mt-2">
                <TranscriptPanel
                  transcriptMessages={transcriptMessages}
                  isSpeaking={isSpeaking}
                  isListening={isListening}
                  currentTranscript={currentTranscript}
                />
              </div>
            </div>

            {/* Tablet Layout: Videos stacked on left, transcript on right */}
            <div className="hidden md:flex lg:hidden flex-row h-full gap-4 w-full">
              {/* Videos stacked vertically on left (2/3 width) */}
              <div className="flex flex-col gap-4 w-2/3">
                <div className="h-1/2">
                  <VideoCard
                    name="AI Interviewer"
                    role="AI Assistant"
                    isAI={true}
                    isMuted={false}
                    isSpeaking={isSpeaking}
                    isVideoEnabled={true}
                    isFullscreen={fullscreenMode === 'ai'}
                    onToggleFullscreen={() => handleToggleFullscreen('ai')}
                    stream={null}
                  />
                </div>
                <div className="h-1/2">
                  <VideoCard
                    name="Alex Johnson"
                    role="Candidate"
                    isAI={false}
                    isMuted={false}
                    isSpeaking={isListening}
                    isVideoEnabled={true}
                    isFullscreen={fullscreenMode === 'candidate'}
                    onToggleFullscreen={() => handleToggleFullscreen('candidate')}
                    stream={candidateStream}
                    permissionError={permissionError}
                  />
                </div>
              </div>
              
              {/* Transcript on right (1/3 width) */}
              <div className="w-1/3 h-full">
                <TranscriptPanel
                  transcriptMessages={transcriptMessages}
                  isSpeaking={isSpeaking}
                  isListening={isListening}
                  currentTranscript={currentTranscript}
                />
              </div>
            </div>

            {/* Desktop/Laptop Layout: Original layout */}
            <div className="hidden lg:flex flex-row h-full gap-4 w-full ">
              {/* Videos side by side (2/3 width) */}
              <div className="grid grid-cols-2 gap-4 w-2/3">
                <VideoCard
                  name="AI Interviewer"
                  role="AI Assistant"
                  isAI={true}
                  isMuted={false}
                  isSpeaking={isSpeaking}
                  isVideoEnabled={true}
                  isFullscreen={fullscreenMode === 'ai'}
                  onToggleFullscreen={() => handleToggleFullscreen('ai')}
                  stream={null}
                />
                <VideoCard
                  name="Alex Johnson"
                  role="Candidate"
                  isAI={false}
                  isMuted={false}
                  isSpeaking={isListening}
                  isVideoEnabled={true}
                  isFullscreen={fullscreenMode === 'candidate'}
                  onToggleFullscreen={() => handleToggleFullscreen('candidate')}
                  stream={candidateStream}
                  permissionError={permissionError}
                />
              </div>
              
              {/* Transcript on right (fixed width) */}
              <div className=" flex-1 w-96 h-full">
                <TranscriptPanel
                  transcriptMessages={transcriptMessages}
                  isSpeaking={isSpeaking}
                  isListening={isListening}
                  currentTranscript={currentTranscript}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {interviewStarted && (
        <ControlBar
          onEndInterview={handleEndInterview}
          hasStream={!!candidateStream}
          isListening={isListening}
          onToggleListening={toggleListening}
          isSpeaking={isSpeaking}
          hasStarted={hasStarted}
          onStartInterview={startInterview}
        />
      )}
    </div>
  );
}