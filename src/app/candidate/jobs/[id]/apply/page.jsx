"use client";

import { useHeader } from "@/store/user.store";
import axios from "axios";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";

export default function Page({ params }) {
  const setTitle = useHeader((state) => state.setTitle);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState({});
  const jobId = React.use(params).id;

  useEffect(() => {
    axios.get(`/api/job/${jobId}`).then((res) => {
      setDetails(res.data.job);
    });
  }, []);

  useEffect(() => {
    setTitle(`Apply for ${details.companyName}`);
  }, [details]);

  return <div>

  </div>;
}
