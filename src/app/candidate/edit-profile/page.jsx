"use client";

import EditCandidateProfileForm from "./EditCandidateProfileForm";

import { useHeader } from "@/store/user.store";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

export default function Page() {
  const setTitle = useHeader((s) => s.setTitle);
  const { getToken } = useAuth();
  const [candidateData, setCandidateData] = useState({});

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
        console.log("Candidate Data:", data);
        setCandidateData(data);
      })
      .catch((err) => {
        console.error("Error fetching candidate data:", err);
      });
  }, []);

  return (
    <div className="w-full flex justify-center">
      {candidateData && Object.keys(candidateData).length > 0 ? (
        <EditCandidateProfileForm
          initialData={candidateData}
          onSubmit={(data) => console.log("Updated Candidate:", data)}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
