import React, { useState } from "react";
import axios from "axios";
import { Loader2, AlertCircle, UserCheck } from "lucide-react";
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

export default function HireDialog({
  open,
  onOpenChange,
  jobId,
  applications,
  onHireSuccess,
}) {
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [joiningDate, setJoiningDate] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

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

  const handleHire = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!joiningDate || !expiresAt) {
        toast.error("Please select joining and expiry dates");
        return;
      }

      const response = await axios.post("/api/hire", {
        jobId,
        candidateClerkIds: selectedCandidates,
        joiningDate,
        expiresAt,
      });

      if (response.data.success) {
        toast.success(
          `Offer letters sent to ${selectedCandidates.length} candidate${
            selectedCandidates.length > 1 ? "s" : ""
          }`,
        );

        setSelectedCandidates([]);
        setJoiningDate("");
        setExpiresAt("");

        onOpenChange(false);

        onHireSuccess?.();
      }
    } catch (err) {
      const message =
        err.response?.data?.error || "Failed to generate offer letters";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getCandidateName = (app) =>
    `${app.user?.firstName || ""} ${app.user?.lastName || ""}`.trim();

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Hire Candidates</DialogTitle>
          <DialogDescription>
            Select one or more candidates to mark as hired.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Candidates</h3>

            <Button variant="ghost" size="sm" onClick={handleSelectAll}>
              {selectedCandidates.length === applications.length
                ? "Deselect All"
                : "Select All"}
            </Button>
          </div>

          <div className="border rounded-lg max-h-64 overflow-y-auto p-3 space-y-2">
            {applications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No candidates available
              </p>
            ) : (
              applications.map((app) => (
                <label
                  key={app.candidateClerkId}
                  className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer"
                >
                  <Checkbox
                    checked={selectedCandidates.includes(app.candidateClerkId)}
                    onCheckedChange={() =>
                      handleSelectCandidate(app.candidateClerkId)
                    }
                  />

                  <Avatar className="h-8 w-8">
                    <AvatarImage src={app.user?.imageUrl} />
                    <AvatarFallback>
                      {getInitials(getCandidateName(app))}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {getCandidateName(app)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {app.user?.email}
                    </p>
                  </div>

                  <Badge variant="outline">{app.status}</Badge>
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Joining Date</label>

            <input
              type="date"
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Offer Expiry Date</label>

            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            onClick={handleHire}
            disabled={loading || selectedCandidates.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Hiring...
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Hire Selected Candidates
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
