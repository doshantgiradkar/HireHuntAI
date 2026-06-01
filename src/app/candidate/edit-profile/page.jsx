"use client";

import EditCandidateProfileForm from "./EditCandidateProfileForm";

import { useHeader } from "@/store/user.store";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { ErrorPopup } from "@/components/error_popup";

export default function Page() {
  const setTitle = useHeader((s) => s.setTitle);
  const { getToken } = useAuth();
  const [candidateData, setCandidateData] = useState({});
  const [error, setError] = useState({
    open: false,
    title: "",
    message: "",
  });

  const getUserInfo = async () => {
    const clerkToken = await getToken();
    const res = await axios.get("/api/candidate/", {
      headers: { Authorization: `Bearer ${clerkToken}` },
    });
    // Ensure res.data.candidate exists
    return res.data.candidate || {};
  };

  useEffect(() => {
    setTitle("Edit Candidate Profile");
  }, []);

  useEffect(() => {
    getUserInfo()
      .then((data) => {
        setCandidateData(data);
      })
      .catch((err) => {
        console.error("Error fetching candidate data:", err);
        setError({
          open: true,
          title: "Failed to fetch user info",
          message: "Alert!",
        });
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <ErrorPopup
        open={error.open}
        onOpenChange={(open) => setError((prev) => ({ ...prev, open }))}
        title={error.title}
        message={error.message}
      />
      {candidateData && Object.keys(candidateData).length > 0 ? (
        <EditCandidateProfileForm
          initialData={candidateData}
          onSubmit={(data) => console.log("Updated Candidate:", data)}
        />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
    </div>
  );
}
