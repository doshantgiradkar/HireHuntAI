import React from "react"
import { MessageCircle, X, Copy, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function ViewFeedbackDialog({
  open,
  onOpenChange,
  feedback,
  jobTitle,
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(feedback || "")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const hasFeedback = feedback && feedback.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            <DialogTitle>Interview Feedback</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Job Title Context */}
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{jobTitle}</span>
          </div>

          {/* Feedback Content */}
          {hasFeedback ? (
            <div className="bg-muted rounded-lg p-4 border border-border">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap break-words max-w-prose">
                {feedback}
              </p>
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <p className="text-muted-foreground">
                No feedback has been provided yet. The recruiter may add feedback after the interview is reviewed.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {hasFeedback && (
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Copy
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
