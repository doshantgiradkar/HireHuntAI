"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import CompanyProfileForm from "./CompanyProfileForm";
import { useHeader } from "@/store/user.store";

export default function Page() {
  const { user, isLoaded } = useUser();
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [initialData, setInitialData] = useState(null);
  const [mode, setMode] = useState("create");
  const setTitle = useHeader(state => state.setTitle);

  useEffect(() => {
    setTitle("Edit Company Profile");
    if (!isLoaded) return; 

    const fetchRecruiter = async () => {
      if (!user?.id) {
        setStatus("error");
        return;
      }

      setStatus("loading");

      try {
        // use path param per new API convention
        const res = await fetch(`/api/recruiter/${user.id}`);

        if (res.status === 404) {
          // no recruiter yet
          setInitialData(null);
          setMode("create");
          setStatus("ready");
          return;
        }

        if (!res.ok) {
          setStatus("error");
          console.error("Failed to fetch recruiter", await res.text());
          return;
        }

        const data = await res.json();
        setInitialData(data?.recruiter || null);
        setMode(data?.recruiter ? "edit" : "create");
        setStatus("ready");
      } catch (err) {
        console.error("Error fetching recruiter:", err);
        setStatus("error");
      }
    };

    fetchRecruiter();
  }, [isLoaded, user]);

  if (!isLoaded || status === "loading") {
    return <div className="p-6">Loading...</div>;
  }

  if (status === "error") {
    return <div className="p-6 text-destructive">Failed to load recruiter profile.</div>;
  }



  return (
    <div className="p-6">
      <CompanyProfileForm initialData={initialData} mode={mode} onSuccess={(res) => {
        if (res?.recruiter) {
          setInitialData(res.recruiter);
          setMode("edit");
        }
      }} />
    </div>
  );
}
