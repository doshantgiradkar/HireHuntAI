"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  Sparkles,
  X,
  Send,
  Loader2,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const renderFormattedText = (text) => {
  const lines = String(text ?? "").split("\n");

  return lines.map((line, lineIndex) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);

    return (
      <React.Fragment key={`line-${lineIndex}`}>
        {parts.map((part, partIndex) => {
          const isBold = part.startsWith("**") && part.endsWith("**") && part.length > 4;

          if (isBold) {
            return (
              <strong key={`part-${lineIndex}-${partIndex}`}>
                {part.slice(2, -2)}
              </strong>
            );
          }

          return (
            <React.Fragment key={`part-${lineIndex}-${partIndex}`}>
              {part}
            </React.Fragment>
          );
        })}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
};

const RecruiterAIPanel = ({ isOpen, onClose, contextData, pageType }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with context-aware welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessages = {
        dashboard: "Hi! I can help analyze your recruiting metrics, identify trends, and suggest optimizations for your hiring funnel. What insights would you like?",
        analytics: "I'm here to help you interpret your analytics data. Ask me about trends, conversions, or performance insights.",
        candidate: "I can help you evaluate this candidate, highlight key strengths, and suggest interview questions. What would you like to know?",
        job: "I can help you refine this job posting, suggest improvements, or analyze candidate applications. How can I assist?",
        discover: "I have access to all your published jobs and can help you find the best candidates across all positions. What are you looking for?",
        default: "Hi! I'm your AI recruiting assistant. How can I help you today?",
      };

      const welcomeText = welcomeMessages[pageType] || welcomeMessages.default;

      setMessages([
        {
          id: "bot-welcome",
          text: welcomeText,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
      setError(null);
    }
  }, [isOpen, pageType]);

  const buildContextPrompt = useCallback(() => {
    let contextPrompt = "";

    switch (pageType) {
      case "dashboard":
        if (contextData?.summaryCards) {
          contextPrompt = `Dashboard Context: ${JSON.stringify(contextData.summaryCards)}. ${contextData.topJobs ? `Top jobs: ${JSON.stringify(contextData.topJobs)}` : ""}`;
        }
        break;
      case "analytics":
        if (contextData?.keyMetrics) {
          contextPrompt = `Analytics Context: Key metrics - ${JSON.stringify(contextData.keyMetrics)}. ${contextData.analyticsFilters ? `Filters: ${JSON.stringify(contextData.analyticsFilters)}` : ""}`;
        }
        break;
      case "candidate":
        if (contextData?.candidate) {
          contextPrompt = `Candidate: ${contextData.candidate.fullName || "Unknown"}. Experience: ${contextData.candidate.totalExperienceDuration || 0} years. Skills: ${contextData.candidate.resume?.skills?.join(", ") || "Not specified"}. Education: ${contextData.candidate.resume?.education?.map((e) => e.course).join(", ") || "Not specified"}`;
        }
        break;
      case "job":
        if (contextData?.job) {
          contextPrompt = `Job: ${contextData.job.title} at ${contextData.job.companyName}. Location: ${contextData.job.location}. Required skills: ${contextData.job.skills?.join(", ") || "Not specified"}. Applications: ${contextData.job.applicationsCount || 0}`;
        }
        break;
      case "discover":
        if (contextData?.jobs) {
          contextPrompt = `Available jobs: ${contextData.jobs.length} positions. ${contextData.jobs.map((j) => `${j.title} (${j.applicationsCount || 0} apps)`).join("; ")}`;
        }
        break;
      default:
        break;
    }

    return contextPrompt;
  }, [pageType, contextData]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);
    setError(null);

    try {
      const contextPrompt = buildContextPrompt();
      const systemPrompt = `You are an AI recruiting assistant helping a recruiter. Keep responses concise and actionable. ${contextPrompt}`;

      const response = await fetch("/api/recruiter/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          pageType,
          context: contextData,
          systemPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      const assistantReply = data?.reply || "I wasn't able to process that. Could you try again?";

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          text: assistantReply,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setError(err.message || "Failed to send message. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-error-${Date.now()}`,
          text: "Oops! Something went wrong. Please try again.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (input.trim() && !isSending) {
      await sendMessage(input.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-md flex-col border-l border-border/80 bg-background shadow-2xl transition-transform duration-300 ease-out"
        role="dialog"
        aria-modal="true"
        aria-label="AI recruiting assistant"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-primary/10 via-transparent to-transparent px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/15 p-2 text-primary">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-semibold text-sm tracking-tight">
                AI Recruiting Assistant
              </h2>
              <p className="text-xs text-muted-foreground">Context-aware help</p>
            </div>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onClose}
            aria-label="Close assistant panel"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-6 py-4" aria-live="polite" aria-label="Chat messages">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground border border-border/40"
                  }`}
                >
                  {renderFormattedText(message.text)}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 animate-pulse" aria-hidden="true" />
                <span>AI is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Error Alert */}
        {error && (
          <div className="px-6 pt-2 pb-0">
            <Alert variant="destructive" className="mb-2 py-2">
              <AlertCircle className="h-3 w-3" />
              <AlertDescription className="text-xs ml-2">{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-border/60 bg-card/50 px-6 py-4 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <Input
              type="text"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending}
              aria-label="Type your question"
              className="text-sm"
            />
            <Button
              type="submit"
              disabled={isSending || !input.trim()}
              size="icon"
              className="h-9 w-9 flex-shrink-0"
              aria-label="Send message"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default RecruiterAIPanel;
