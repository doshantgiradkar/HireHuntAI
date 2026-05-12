import React from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const ChatbotBubble = ({ onClick }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        type="button"
        size="icon-lg"
        className="relative rounded-full border border-primary/40 bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:bg-primary/90 focus-visible:ring-ring/70 supports-[backdrop-filter]:backdrop-blur"
        onClick={onClick}
        aria-label="Open AI assistant chat"
      >
        <MessageCircle className="size-5" aria-hidden="true" />
        <span
          className="absolute -right-1 -top-1 inline-flex h-3 w-3 animate-pulse rounded-full bg-emerald-400 ring-2 ring-card"
          aria-hidden="true"
        />
      </Button>
    </div>
  );
};

export default ChatbotBubble;
