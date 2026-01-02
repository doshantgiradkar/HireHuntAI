"use client";

import { useHeader } from "@/store/user.store";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";

export default function Page() {
  const setTitle = useHeader(state => state.setTitle)
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState({});

  useEffect(() => {
    setTitle(`Apply for - ${details.job.companyName}`);
  });

  return <div>Apply</div>
}
