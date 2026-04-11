import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Sparkles, X, ArrowUpRight } from "lucide-react";

const ChatbotWindow = ({ isOpen, onClose, onSendMessage }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: "bot-welcome",
          text: "Hi there! I'm your AI assistant. I can summarize your resume, give feedback, and answer your questions. What can I help you with?",
          sender: "bot",
        },
      ]);
    } else {
      setMessages([]);
    }
  }, [isOpen]);

  const appendMessage = (text, sender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: `${sender}-${Date.now()}-${Math.random()}`,
        text,
        sender,
      },
    ]);
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    appendMessage(messageText, "user");
    setIsSending(true);

    try {
      let assistantReply = null;

      if (typeof onSendMessage === "function") {
        const maybeReply = await onSendMessage(messageText);
        if (typeof maybeReply === "string" && maybeReply.trim()) {
          assistantReply = maybeReply.trim();
        }
      }

      if (!assistantReply) {
        const response = await fetch("/api/candidate/chatbot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: messageText }),
        });

        const data = await response.json();
        assistantReply = data?.reply || "I wasn't able to get that. Could you try again?";
      }

      appendMessage(assistantReply, "bot");
    } catch (error) {
      console.error("Error sending message to chatbot API:", error);
      appendMessage("Oops! Something went wrong. Please try again.", "bot");
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (!input.trim() || isSending) return;
    const nextMessage = input.trim();
    setInput("");
    await sendMessage(nextMessage);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-4 bottom-6 z-50 flex justify-end sm:inset-auto sm:right-6 sm:bottom-28">
      <Card
        role="dialog"
        aria-modal="true"
        aria-label="AI assistant chat window"
        className="w-full max-w-sm !gap-0 !py-0 overflow-hidden border border-border/80 bg-card/95 shadow-2xl backdrop-blur-lg"
      >
        <div className="flex items-start gap-3 border-b border-border/80 bg-gradient-to-r from-primary/10 via-transparent to-transparent px-5 py-4">
          <span className="rounded-full bg-primary/15 p-2 text-primary">
            <MessageCircle className="size-4" aria-hidden="true" />
          </span>
          <div className="flex flex-col text-sm">
            <span className="font-semibold tracking-tight">AI Assistant</span>
            <span className="text-muted-foreground">Here to guide your interview prep</span>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="ml-auto text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Close chat window</span>
          </Button>
        </div>

        <ScrollArea className="h-72 px-5 py-4" aria-live="polite">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="size-3 animate-pulse" aria-hidden="true" />
                <span>The assistant is responding...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t border-border/80 px-5 py-4">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <Input
              type="text"
              placeholder="Ask about resumes, jobs, etc."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending}
              aria-label="Type a message to the assistant"
            />
            <Button type="submit" disabled={isSending} className="gap-1">
              Send
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ChatbotWindow;
