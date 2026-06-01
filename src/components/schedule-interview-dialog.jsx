"use client";

import React, { useState } from "react";
import axios from "axios";
import { Calendar, Loader2, AlertCircle, Zap } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ScheduleInterviewDialog({
  open,
  onOpenChange,
  jobId,
  applications,
  onScheduleSuccess,
}) {
  const [mode, setMode] = useState("auto"); // "auto" or "manual"
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSelectCandidate = (clerkId) => {
    setSelectedCandidates((prev) =>
      prev.includes(clerkId)
        ? prev.filter((id) => id !== clerkId)
        : [...prev, clerkId],
    );
  };

  const handleSelectAll = () => {
    if (selectedCandidates.length === applications.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(applications.map((app) => app.candidateClerkId));
    }
  };

  // Auto-select top 25% candidates by match score
  const handleAutoSelectTopCandidates = () => {
    const sorted = [...applications].sort(
      (a, b) =>
        (b.eligibility?.matchScore || 0) - (a.eligibility?.matchScore || 0),
    );
    const topCount = Math.ceil(sorted.length * 0.25) || 1;
    const topCandidates = sorted
      .slice(0, topCount)
      .map((app) => app.candidateClerkId);
    setSelectedCandidates(topCandidates);
  };

  const handleScheduleAuto = async () => {
    // Use the auto-selection API endpoint - selects top 25% automatically
    try {
      setLoading(true);
      setError(null);
      const toastId = toast.loading("Scheduling interview...");

      const response = await axios.post(`/api/interview?jobId=${jobId}`);

      if (response.data.interviewId || response.data.message) {
        onOpenChange(false);
        // Reset form
        setMode("auto");
        setSelectedCandidates([]);
        setScheduledDate("");

        toast.success(
          "Interview scheduled successfully! Candidates will be notified.",
        );

        if (onScheduleSuccess) {
          onScheduleSuccess();
          toast.dismiss(toastId);
        }
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Failed to schedule interview";
      setError(errorMessage);
      toast.error(errorMessage, {
        description:
          err.response?.data?.details ||
          "Please try again or contact support if the issue persists.",
        duration: 5000,
      });
      console.error("Auto-schedule error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleManual = async () => {
    if (!scheduledDate || selectedCandidates.length === 0) {
      const message = "Please select candidates and date";
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const toastId = toast.loading(
        "Scheduling interview for selected candidates...",
      );

      // Interview available for whole day: 9 AM to 5 PM
      const startDateTime = new Date(`${scheduledDate}T09:00:00`);
      const endDateTime = new Date(`${scheduledDate}T17:00:00`);
      const durationMinutes = 480; // 8 hours in minutes

      const response = await axios.post("/api/interview/schedule", {
        jobId,
        candidates: selectedCandidates,
        startAt: startDateTime.toISOString(),
        endAt: endDateTime.toISOString(),
        duration: durationMinutes,
      });

      if (response.data.success || response.data._id) {
        onOpenChange(false);
        // Reset form
        setMode("auto");
        setSelectedCandidates([]);
        setScheduledDate("");

        toast.success(
          `Interview scheduled for ${selectedCandidates.length} candidate${selectedCandidates.length !== 1 ? "s" : ""}!`,
          {
            description: "They will be notified about the interview.",
            duration: 4000,
          },
        );
        toast.dismiss(toastId);

        if (onScheduleSuccess) {
          onScheduleSuccess();
        }
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Failed to schedule interview";
      setError(errorMessage);

      // Specific error handling for common cases
      if (err.response?.status === 503) {
        toast.error("Service temporarily unavailable", {
          description:
            "AI service is experiencing high demand. Please try again in a moment.",
          duration: 5000,
        });
      } else if (err.response?.status === 400) {
        toast.error("Invalid request", {
          description: errorMessage,
          duration: 5000,
        });
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Authentication error", {
          description: "You don't have permission to perform this action.",
          duration: 5000,
        });
      } else {
        toast.error("Failed to schedule interview", {
          description: errorMessage,
          duration: 5000,
        });
      }

      console.error("Manual schedule error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCandidateName = (app) =>
    app.user
      ? `${app.user.firstName || ""} ${app.user.lastName || ""}`.trim()
      : "Unknown";

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  const formatStatusLabel = (status) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusVariant = (status) => {
    const variants = {
      applied: "secondary",
      shortlisted: "default",
      interview_scheduled: "outline",
      hired: "default",
      rejected: "destructive",
    };
    return variants[status] || "secondary";
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Schedule Interview Session</DialogTitle>
          <DialogDescription>
            Choose automatic selection (top 25% candidates) or manually select
            candidates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Mode Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMode("auto")}
              className={`p-4 border rounded-lg transition-all ${
                mode === "auto"
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4" />
                <span className="font-semibold">Auto-Select</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Automatically selects top 25% candidates by match score
              </p>
            </button>

            <button
              onClick={() => setMode("manual")}
              className={`p-4 border rounded-lg transition-all ${
                mode === "manual"
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">Manual Select</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Manually choose which candidates to interview
              </p>
            </button>
          </div>

          {/* Manual Selection Mode */}
          {mode === "manual" && (
            <>
              {/* Candidates Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">Select Candidates</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="text-xs"
                  >
                    {selectedCandidates.length === applications.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                </div>

                <div className="border rounded-lg max-h-64 overflow-y-auto space-y-2 p-3">
                  {applications.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-8 text-center">
                      No applications found
                    </p>
                  ) : (
                    applications.map((app) => (
                      <label
                        key={app.candidateClerkId}
                        className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={selectedCandidates.includes(
                            app.candidateClerkId,
                          )}
                          onCheckedChange={() =>
                            handleSelectCandidate(app.candidateClerkId)
                          }
                        />
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={app.user?.imageUrl} />
                          <AvatarFallback>
                            {getInitials(getCandidateName(app))}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {getCandidateName(app)}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {app.user?.email}
                          </p>
                        </div>
                        <Badge
                          variant={getStatusVariant(app.status)}
                          className="text-xs shrink-0"
                        >
                          {formatStatusLabel(app.status)}
                        </Badge>
                      </label>
                    ))
                  )}
                </div>

                {selectedCandidates.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {selectedCandidates.length} candidate
                    {selectedCandidates.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date
                </label>
                <input
                  type="date"
                  min={today}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Interview available 9 AM - 5 PM
                </p>
              </div>

              {/* Summary */}
              {selectedCandidates.length > 0 && scheduledDate && (
                <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
                  <p className="font-medium">Interview Summary</p>
                  <div className="space-y-1 text-muted-foreground text-xs">
                    <div>
                      <span className="text-foreground font-medium">
                        {selectedCandidates.length}
                      </span>{" "}
                      candidate{selectedCandidates.length !== 1 ? "s" : ""}
                    </div>
                    <div>
                      <span className="text-foreground font-medium">
                        {scheduledDate}
                      </span>{" "}
                      (9 AM - 5 PM)
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Auto-Select Mode */}
          {mode === "auto" && (
            <div className="border rounded-lg p-4 space-y-3 bg-background">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 shrink-0">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    Auto-Selection Enabled
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The system will automatically select the top 25% candidates
                    by match score. This will be scheduled for 24 hours from now
                    (9 AM - 5 PM).
                  </p>
                </div>
              </div>
              <div className="bg-muted rounded-lg p-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Total Applications:
                  </span>
                  <span className="font-medium text-foreground">
                    {applications.length}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 mt-2">
                  <span className="text-muted-foreground">
                    Estimated Selected:
                  </span>
                  <span className="font-medium text-foreground">
                    {Math.ceil(applications.length * 0.25) || 1}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={
              mode === "auto" ? handleScheduleAuto : handleScheduleManual
            }
            disabled={
              loading ||
              (mode === "manual" &&
                (selectedCandidates.length === 0 || !scheduledDate))
            }
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Interview
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
