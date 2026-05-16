"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const RecruiterAIToggle = ({ onClick, variant = "outline", size = "icon" }) => {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onClick}
      className="relative gap-2"
      title="Open AI recruiting assistant"
    >
      <Sparkles className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">Open AI recruiting assistant</span>
    </Button>
  );
};

export default RecruiterAIToggle;
