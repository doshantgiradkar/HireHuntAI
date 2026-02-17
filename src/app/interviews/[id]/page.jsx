"use client"
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSpeech } from "@/hooks/useSpeech";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Mic,
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
  SkipForward,
  Send,
  RotateCcw,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import StartInterviewScreen from "@/components/start-interview-screen";
import { Circle } from "lucide-react";
import { CircleCheck } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                          Speech Recognition Data                           */
/* -------------------------------------------------------------------------- */

const initialTranscriptData = [];

/* -------------------------------------------------------------------------- */
/*                    Interview Speech Recognition Hook                       */
/* -------------------------------------------------------------------------- */
/*
 * State machine:
 *   IDLE  -->  SPEAKING_QUESTION  -->  LISTENING_ANSWER  -->  SPEAKING_QUESTION ...
 *
 * - SPEAKING_QUESTION: AI reads the question aloud (mic is OFF).
 * - LISTENING_ANSWER:  Mic is ON, user speaks. Transcript accumulates.
 *   The user clicks "Submit" / "Skip" to finalise and advance.
 *   The toggle button only pauses/resumes the mic; it does NOT advance.
 */
function useInterviewSpeechRecognition(questions = [], onAllQuestionsCompleted = null) {
  const {
    isListening,
    isSpeaking,
    transcript,
    sttSupported,
    ttsSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
    speak,
    cancelSpeech,
    warmup,
  } = useSpeech();

  const questionList = Array.isArray(questions) ? questions : [];

  /* ---- state ---- */
  const [transcriptMessages, setTranscriptMessages] = useState(initialTranscriptData);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");

  /* ---- refs for values accessed inside async/callbacks ---- */
  const questionIndexRef = useRef(0);           // next question to ask
  const isBusySpeakingRef = useRef(false);       // true while AI is speaking
  const hasStartedRef = useRef(false);

  /* sync transcript from hook into local state */
  useEffect(() => {
    setCurrentTranscript(transcript);
  }, [transcript]);

  /* ---- helpers ---- */
  const getQuestionMeta = useCallback((index) => {
    const item = questionList[index];
    if (!item) return null;
    if (typeof item === "string") {
      return { questionId: String(index + 1), text: item };
    }
    const questionId =
      item?.questionId != null ? String(item.questionId) :
      item?._id != null        ? String(item._id) :
      String(index + 1);
    const text = typeof item?.text === "string" ? item.text : "";
    return { questionId, text };
  }, [questionList]);

  /* ---- core: speak a question, await it, then open the mic ---- */
  const askQuestion = useCallback(async (index) => {
    if (index >= questionList.length) return;
    const meta = getQuestionMeta(index);
    if (!meta?.text) return;

    // 1. Stop mic while AI speaks
    stopListening();

    // 2. Add question to transcript panel
    setTranscriptMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        questionId: meta.questionId,
        questionText: meta.text,
        answer: "",
        status: "asked",
        askedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    // 3. Speak the question and WAIT for it to finish
    isBusySpeakingRef.current = true;
    await speak(meta.text);
    isBusySpeakingRef.current = false;

    // 4. Advance index
    questionIndexRef.current = index + 1;

    // 5. Clear previous answer transcript and open mic
    resetTranscript();
    if (hasStartedRef.current && sttSupported) {
      startListening();
    }
  }, [questionList, getQuestionMeta, speak, stopListening, startListening, resetTranscript, sttSupported]);

  /* ---- set answer on last pending question ---- */
  const setAnswerForLastPending = useCallback((answerText, status = "answered") => {
    const normalised = String(answerText || "").trim();
    setTranscriptMessages((prev) => {
      let idx = -1;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (!prev[i]?.answer) { idx = i; break; }
      }
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        answer: normalised,
        status,
        answeredAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      return updated;
    });
  }, []);

  /* ---- public API ---- */

  const startInterview = useCallback(() => {
    setHasStarted(true);
    hasStartedRef.current = true;
    questionIndexRef.current = 0;

    // MUST be called synchronously inside the click handler
    // to unlock the audio context in Chromium browsers.
    warmup();

    // Small delay, then ask the first question
    setTimeout(() => {
      askQuestion(0);
    }, 600);
  }, [askQuestion, warmup]);

  const submitAnswer = useCallback((answerText) => {
    const cleaned = String(answerText || "").trim();
    if (!cleaned) return false;

    const last = transcriptMessages[transcriptMessages.length - 1];
    if (!last || last.answer) return false;

    // Stop mic & save
    stopListening();
    setAnswerForLastPending(cleaned, "answered");
    resetTranscript();

    // Ask next question after a beat
    const nextIdx = questionIndexRef.current;
    if (nextIdx < questionList.length) {
      setTimeout(() => askQuestion(nextIdx), 600);
    } else {
      // AUTO SUBMIT: Current question was the last one
      if (onAllQuestionsCompleted) {
        setTimeout(() => onAllQuestionsCompleted(), 1000);
      }
    }
  }, [transcriptMessages, stopListening, resetTranscript, setAnswerForLastPending, questionList.length, askQuestion, onAllQuestionsCompleted]);

  const skipCurrentQuestion = useCallback(() => {
    if (!hasStartedRef.current || isBusySpeakingRef.current) return;
    const last = transcriptMessages[transcriptMessages.length - 1];
    if (!last || last.answer) return;

    stopListening();
    resetTranscript();
    setAnswerForLastPending("[Unanswered - Skipped]", "unanswered");

    const nextIdx = questionIndexRef.current;
    if (nextIdx < questionList.length) {
      setTimeout(() => askQuestion(nextIdx), 600);
    } else {
      // AUTO SUBMIT: Skipped the last question
      if (onAllQuestionsCompleted) {
        setTimeout(() => onAllQuestionsCompleted(), 1000);
      }
    }
  }, [transcriptMessages, stopListening, resetTranscript, setAnswerForLastPending, questionList.length, askQuestion, onAllQuestionsCompleted]);

  /**
   * Toggle only pauses/resumes the mic.
   * It does NOT submit the answer or advance the question.
   */
  const toggleListening = useCallback(() => {
    if (!sttSupported) return;
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [sttSupported, isListening, stopListening, startListening]);

  /**
   * "Submit current voice answer" — reads whatever has been
   * accumulated in the transcript, saves it, moves on.
   */
  const submitVoiceAnswer = useCallback(() => {
    const answer = transcript.trim();
    if (!answer) return false;
    return submitAnswer(answer);
  }, [transcript, submitAnswer]);

  /**
   * Restart listening — clears the accumulated transcript
   * and re-opens the mic from scratch for the current question.
   */
  const restartListening = useCallback(() => {
    if (!sttSupported) return;
    stopListening();
    resetTranscript();
    // Small delay to let the browser release the mic
    setTimeout(() => {
      startListening();
    }, 200);
  }, [sttSupported, stopListening, resetTranscript, startListening]);

  const canSkip =
    hasStarted &&
    !isBusySpeakingRef.current &&
    !isSpeaking &&
    transcriptMessages.length > 0 &&
    !transcriptMessages[transcriptMessages.length - 1]?.answer;

  return {
    currentTranscript,
    transcriptMessages,
    isListening,
    isSpeaking,
    speechError,
    hasStarted,
    browserSupportsSpeechRecognition: sttSupported,
    supportsSpeechRecognition: sttSupported,
    toggleListening,
    stopListening,
    startListening,
    submitManualAnswer: submitAnswer,
    submitVoiceAnswer,
    skipCurrentQuestion,
    startInterview,
    cancelSpeech,
    restartListening,
    currentQuestionIndex: questionIndexRef.current,
    hasMoreQuestions: questionIndexRef.current < questionList.length,
    canSkipCurrentQuestion: canSkip,
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
        <div className="relative w-full h-full bg-linear-to-br from-gray-900 to-black rounded-lg overflow-hidden">

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
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-gray-900 to-black">
              <div className="relative">
                {isAI && (
                  <div className="absolute inset-0 animate-pulse">
                    <div className="h-full w-full bg-linear-to-r from-blue-500/10 to-purple-500/10 blur-xl"></div>
                  </div>
                )}

                <div className="relative z-10">
                  <Avatar className="h-16 w-16 sm:h-20 md:h-24 lg:h-32 sm:w-20 md:w-24 lg:w-32 border-2 sm:border-3 md:border-4 border-background">
                    <AvatarFallback className={`text-lg sm:text-xl md:text-2xl ${isAI ? 'bg-linear-to-br from-blue-500 to-purple-600' : 'bg-linear-to-br from-gray-700 to-gray-900'}`}>
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

function TranscriptPanel({
  transcriptMessages,
  isSpeaking,
  isListening,
  currentTranscript,
  supportsSpeechRecognition,
  manualAnswer,
  onManualAnswerChange,
  onManualAnswerSubmit,
  onSubmitVoiceAnswer,
  onRestartListening,
}) {
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

  const allMessages = transcriptMessages.flatMap((entry, index) => {
    const items = [
      {
        id: `${entry.id || index}-q`,
        speaker: "AI Interviewer",
        timestamp: entry.askedAt || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        message: entry.questionText || "Question",
        isAI: true,
        isLive: false,
      },
    ];

    if (entry.answer) {
      items.push({
        id: `${entry.id || index}-a`,
        speaker: "You",
        timestamp: entry.answeredAt || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        message: entry.answer,
        isAI: false,
        isLive: false,
      });
    }

    return items;
  });

  // Show live transcript (what the user is currently saying)
  if (currentTranscript && currentTranscript.trim()) {
    allMessages.push({
      id: "live-transcript",
      speaker: "You",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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

      <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            {allMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isAI ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 wrap-break-words ${
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
                  <p className="text-xs sm:text-sm wrap-break-words">{msg.message}</p>
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
        <div className="border-t p-3 space-y-2 shrink-0">
          <p className="text-xs text-muted-foreground">
            {supportsSpeechRecognition
              ? "Speak your answer or type below. Click 'Submit Voice Answer' when done."
              : "Speech-to-text is unavailable. Type your answer and submit."}
          </p>

          {/* Submit voice answer + Restart buttons */}
          {supportsSpeechRecognition && (
            <div className="flex items-center gap-2">
              <Button
                onClick={onSubmitVoiceAnswer}
                disabled={isSpeaking || !currentTranscript?.trim()}
                variant="default"
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Voice Answer
              </Button>
              <Button
                onClick={onRestartListening}
                disabled={isSpeaking}
                variant="outline"
                size="icon"
                className="shrink-0"
                aria-label="Restart listening"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Textarea
            value={manualAnswer}
            onChange={(event) => onManualAnswerChange(event.target.value)}
            rows={2}
            placeholder="Type your answer here..."
            disabled={isSpeaking}
          />
          <Button
            onClick={onManualAnswerSubmit}
            disabled={isSpeaking || !String(manualAnswer || "").trim()}
            className="w-full sm:w-auto"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Answer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/*                                Control Bar                                 */
function ControlBar({
  onEndInterview,
  isEndingInterview,
  hasStream,
  isListening,
  onToggleListening,
  onSkipQuestion,
  canSkipQuestion,
  isSpeaking,
  hasStarted,
  onStartInterview,
  supportsSpeechRecognition,
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

            {/* Mic toggle - only pauses/resumes mic, does NOT advance question */}
            {hasStarted && supportsSpeechRecognition && (
              <Button
                variant={isListening ? "default" : "secondary"}
                size="icon"
                onClick={onToggleListening}
                className={`h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full`}
                aria-label={isListening ? "Mute microphone" : "Unmute microphone"}
                disabled={isSpeaking}
              >
                {isListening ? (
                  <Mic className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <MicOff className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </Button>
            )}

            {hasStarted && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 sm:h-9 md:h-10 px-3 sm:px-4 rounded-full text-xs sm:text-sm"
                onClick={onSkipQuestion}
                disabled={!canSkipQuestion}
                aria-label="Skip question"
              >
                <SkipForward className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Skip</span>
              </Button>
            )}

            {/* End Interview Button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 sm:h-9 md:h-10 px-3 sm:px-4 md:px-6 rounded-full text-xs sm:text-sm"
                >
                  <PhoneOff className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">End Interview</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>End Interview Session?</DialogTitle>
                  <DialogDescription>
                    This will end the current interview. Your progress and transcript will be saved.
                    Are you sure you want to end the interview?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    onClick={onEndInterview}
                    variant="destructive"
                    disabled={isEndingInterview}
                  >
                    {isEndingInterview ? "Ending..." : "End Interview"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
  const params = useParams();
  const router = useRouter();
  const interviewId = params?.id;
  const jobIdFromQuery = useSearchParams()?.get("jobId");
  const [questions, setQuestions] = useState([]);
  const [candidate, setCandidate] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [isLoadingInterview, setIsLoadingInterview] = useState(true);
  const [interviewError, setInterviewError] = useState(null);
  const [isStartingInterview, setIsStartingInterview] = useState(false);
  const [isEndingInterview, setIsEndingInterview] = useState(false);

  const questionItems = useMemo(() => {
    if (!Array.isArray(questions)) {
      return [];
    }
    return questions
      .map((question, index) => {
        if (typeof question === "string") {
          return {
            questionId: String(index + 1),
            text: question,
          };
        }

        return {
          questionId:
            question?.questionId != null
              ? String(question.questionId)
              : question?._id != null
                ? String(question._id)
                : String(index + 1),
          text: typeof question?.text === "string" ? question.text : "",
        };
      })
      .filter((question) => Boolean(question.text));
  }, [questions]);

  useEffect(() => {
    let isMounted = true;

    const loadInterview = async () => {
      if (!interviewId) {
        setIsLoadingInterview(false);
        return;
      }

      setIsLoadingInterview(true);
      setInterviewError(null);

      try {
        let jobId = jobIdFromQuery;

        if (!jobId) {
          const listResponse = await axios.get("/api/interview");
          const match = Array.isArray(listResponse.data)
            ? listResponse.data.find((item) => String(item?._id) === String(interviewId))
            : null;
          jobId = match?.jobId?._id ?? match?.jobId;
          if (jobId && typeof jobId !== "string") {
            jobId = String(jobId);
          }
        }

        if (!jobId) {
          throw new Error("Missing jobId for interview request.");
        }

        const response = await axios.get(`/api/interview/${interviewId}?jobId=${jobId}`);
        if (!isMounted) {
          return;
        }

        const data = response.data || {};
        setQuestions(Array.isArray(data.questions) ? data.questions : []);
        setCandidate(data.candidate || null);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        console.error("Error fetching interview data:", error);
        setInterviewError("Unable to load interview details.");
        setQuestions([]);
        setCandidate(null);
      } finally {
        if (isMounted) {
          setIsLoadingInterview(false);
        }
      }
    };

    loadInterview();

    return () => {
      isMounted = false;
    };
  }, [interviewId, jobIdFromQuery]);

  const candidateDisplayName =
    candidate?.resume?.fullName || candidate?.fullName || candidate?.name;
  const candidateName = candidateDisplayName || "Candidate";

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
    speechError,
    hasStarted,
    browserSupportsSpeechRecognition,
    toggleListening,
    stopListening,
    submitManualAnswer,
    submitVoiceAnswer,
    skipCurrentQuestion,
    startInterview,
    canSkipCurrentQuestion,
    supportsSpeechRecognition,
    cancelSpeech,
    restartListening,
  } = useInterviewSpeechRecognition(questionItems, () => {
    // This callback handles the auto-submit
    handleEndInterview();
  });

  const [fullscreenMode, setFullscreenMode] = useState(null);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [manualAnswer, setManualAnswer] = useState("");

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (interviewStarted && !isEndingInterview) {
        event.preventDefault();
        event.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [interviewStarted, isEndingInterview]);

  useEffect(() => {
    const handleDisableActions = (event) => {
      if (interviewStarted) {
        if (event.type === 'contextmenu') {
          event.preventDefault();
        } else if (event.type === 'keydown') {
          const isCtrlC = (event.ctrlKey || event.metaKey) && event.key === 'c';
          const isCtrlV = (event.ctrlKey || event.metaKey) && event.key === 'v';
          if (isCtrlC || isCtrlV) {
            event.preventDefault();
          }
        }
      }
    };

    window.addEventListener('contextmenu', handleDisableActions);
    window.addEventListener('keydown', handleDisableActions);

    return () => {
      window.removeEventListener('contextmenu', handleDisableActions);
      window.removeEventListener('keydown', handleDisableActions);
    };
  }, [interviewStarted]);

  const handleStartInterview = async () => {
    if (isStartingInterview || isLoadingInterview || questionItems.length === 0 || interviewError) {
      return;
    }
    setIsStartingInterview(true);

    try {
      setInterviewStarted(true);
      startInterview();
      await initializeStream();
    } finally {
      setIsStartingInterview(false);
    }
  };

  const handleEndInterview = async () => {
    setIsEndingInterview(true);
    stopListening();
    cancelSpeech();
    cleanup();

    const liveAnswer = (currentTranscript || "").trim();
    const finalTranscript = transcriptMessages.map((entry, index, arr) => {
      const isLastPending = !entry.answer && index === arr.length - 1;
      if (isLastPending && liveAnswer) {
        return {
          ...entry,
          answer: liveAnswer,
          status: "answered",
          answeredAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      }
      if (isLastPending && !liveAnswer && entry.status === "asked") {
        return {
          ...entry,
          status: "unanswered",
        };
      }
      return entry;
    });

    const transcriptByQuestionId = new Map(
      finalTranscript
        .filter((entry) => entry?.questionId != null)
        .map((entry) => [String(entry.questionId), entry])
    );

    const storageTranscript = questionItems.map((question) => {
      const questionId = String(question.questionId);
      const entry = transcriptByQuestionId.get(questionId);

      if (!entry) {
        return {
          questionId,
          answer: "",
          status: "unanswered",
          askedAt: null,
          answeredAt: null,
        };
      }

      return {
        questionId,
        answer: entry.answer || "",
        status: entry.status || (entry.answer ? "answered" : "unanswered"),
        askedAt: entry.askedAt || null,
        answeredAt: entry.answeredAt || null,
      };
    });

    setTranscript(storageTranscript);

    try {
      await axios.post(`/api/interview/${interviewId}/transcript`, {
        transcript: storageTranscript,
      });
      setInterviewStarted(false);
      setFullscreenMode(null);
      router.push("/candidate/dashboard");
    } catch (error) {
      console.error("Failed to save transcript:", error);
    } finally {
      setIsEndingInterview(false);
    }
  };

  const handleToggleFullscreen = (mode) => {
    setFullscreenMode(fullscreenMode === mode ? null : mode);
  };

  const handleSubmitManualAnswer = () => {
    const didSubmit = submitManualAnswer(manualAnswer);
    if (didSubmit) {
      setManualAnswer("");
    }
  };

  const handleSubmitVoiceAnswer = () => {
    submitVoiceAnswer();
  };

  if (isEndingInterview) {
    return (
      <div className="flex items-center justify-center h-full m-auto px-4">
        <div className="flex flex-col items-center text-center space-y-4 bg-background border rounded-2xl shadow-sm p-8 max-w-md w-full">

          {/* Status Icon */}
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600">
            <CircleCheck className="w-7 h-7" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold tracking-tight">
            Interview Completed
          </h2>

          {/* Description */}
          <p className="text-sm text-muted-foreground">
            Thank you for participating. Your responses have been successfully submitted.
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Submission Overlay */}
      <Dialog open={isEndingInterview}>
        <DialogContent className="sm:max-w-md text-center py-10" showCloseButton={false}>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <DialogHeader>
              <DialogTitle className="text-xl">Processing Interview</DialogTitle>
              <DialogDescription className="text-base pt-2">
                We're saving your transcript and generating your evaluation results. Please don't close this window.
              </DialogDescription>
            </DialogHeader>
          </div>
        </DialogContent>
      </Dialog>

      <header className="border-b bg-card/80 backdrop-blur-sm shrink-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-base sm:text-lg md:text-xl font-bold">
                AI Technical Interview{candidateDisplayName ? ` — ${candidateDisplayName}` : ""}
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
                  {isListening && supportsSpeechRecognition && (
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

      {!browserSupportsSpeechRecognition && (
        <div className="px-3 sm:px-4 py-2">
          <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Note: Speech-to-text is not supported by your browser (e.g. Firefox). Please use Chrome, Edge or Thorium for the best experience, or continue by typing.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {interviewError && (
        <div className="px-3 sm:px-4 py-2">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{interviewError}</AlertDescription>
          </Alert>
        </div>
      )}
      {speechError && (
        <div className="px-3 sm:px-4 py-2">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{speechError}</AlertDescription>
          </Alert>
        </div>
      )}

      <main className="flex-1 overflow-hidden p-2 sm:p-3 md:p-4 ">
        {!interviewStarted ? (
          <StartInterviewScreen
            onStartInterview={handleStartInterview}
            isInitializing={isStartingInterview || isInitializing || isLoadingInterview}
            isReadyToStart={!isLoadingInterview && !interviewError && questionItems.length > 0}
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
                  name={candidateName}
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
                  supportsSpeechRecognition={supportsSpeechRecognition}
                  manualAnswer={manualAnswer}
                  onManualAnswerChange={setManualAnswer}
                  onManualAnswerSubmit={handleSubmitManualAnswer}
                  onSubmitVoiceAnswer={handleSubmitVoiceAnswer}
                  onRestartListening={restartListening}
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
                    name={candidateName}
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
                  supportsSpeechRecognition={supportsSpeechRecognition}
                  manualAnswer={manualAnswer}
                  onManualAnswerChange={setManualAnswer}
                  onManualAnswerSubmit={handleSubmitManualAnswer}
                  onSubmitVoiceAnswer={handleSubmitVoiceAnswer}
                  onRestartListening={restartListening}
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
                  name={candidateName}
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
                  supportsSpeechRecognition={supportsSpeechRecognition}
                  manualAnswer={manualAnswer}
                  onManualAnswerChange={setManualAnswer}
                  onManualAnswerSubmit={handleSubmitManualAnswer}
                  onSubmitVoiceAnswer={handleSubmitVoiceAnswer}
                  onRestartListening={restartListening}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {interviewStarted && (
        <ControlBar
          onEndInterview={handleEndInterview}
          isEndingInterview={isEndingInterview}
          hasStream={!!candidateStream}
          isListening={isListening}
          onToggleListening={toggleListening}
          onSkipQuestion={skipCurrentQuestion}
          canSkipQuestion={canSkipCurrentQuestion}
          isSpeaking={isSpeaking}
          hasStarted={hasStarted}
          onStartInterview={startInterview}
          supportsSpeechRecognition={supportsSpeechRecognition}
        />
      )}
    </div>
  );
}
