"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useHeader } from "@/store/user.store";
import { Upload, FileText, X, ChevronDown } from "lucide-react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { ErrorPopup } from "@/components/error_popup";

const ResumeViewerPage = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [error, setError] = useState({
    open: false,
    title: "",
    message: "",
  });
  const setTitle = useHeader((state) => state.setTitle);
  const fileInputRef = useRef(null);

  const handleUpload = async () => {
    if (!resumeFile) return;
    const formData = new FormData();
    formData.append("resume", resumeFile);

    setLoading(true);
    const resp = await axios.post("/api/candidate/resume", formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    setLoading(false);

    if (resp.status != 200) {
      setError({
        open: true,
        title: "Failed to upload resume!",
        message: "Parsing model is busy, Please try again in a moment",
      });
    } else {
      window.location.href = "/candidate/edit-profile";
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleClearFile = () => {
    setResumeFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleResumeView = () => {
    setShowResume(!showResume);
  };

  useEffect(() => {
    setTitle("Upload Your Resume");
    axios.get("/api/candidate/resume/url").then((resp) => {
      if (resp.status !== 200) {
        setResumeUrl("");
      }
      setResumeUrl(resp.data.resumeUrl);
    });
  }, [setTitle, setResumeUrl]);

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <ErrorPopup
        open={error.open}
        message={error.message}
        title={error.title}
        onOpenChange={(open) => setError((prev) => ({ ...prev, open }))}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
        {/* Upload Section */}
        <div className="flex items-center justify-center min-h-[calc(100vh-30rem)]">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 px-4">
                Upload Your Resume
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground px-4">
                Get started by uploading your resume
              </p>
            </div>

            <Card className="border-dashed border-2 hover:border-primary/50 transition-colors mx-4">
              <CardHeader className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-center">
                  <div className="p-3 sm:p-4 rounded-full bg-primary/10">
                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center text-lg sm:text-xl">
                  Upload Your Resume
                </CardTitle>
                <CardDescription className="text-center text-sm sm:text-base px-2">
                  Support for PDF, DOC, and DOCX files
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                  <label className="relative flex-1">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="h-11 sm:h-12 cursor-pointer"
                    />
                  </label>

                  {isLoading ? (
                    <Button
                      onClick={handleUpload}
                      disabled={true}
                      size="lg"
                      className="h-11 sm:h-12 whitespace-nowrap"
                    >
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleUpload}
                      disabled={!resumeFile}
                      size="lg"
                      className="h-11 sm:h-12 whitespace-nowrap"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Resume
                    </Button>
                  )}
                </div>

                {resumeFile && (
                  <div className="mt-2 p-3 sm:p-4 bg-muted rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs sm:text-sm font-medium flex items-center gap-2 break-all">
                        <FileText className="w-4 h-4 shrink-0" />
                        <span className="truncate">{resumeFile.name}</span>
                      </p>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleClearFile}
                        className="h-8 w-8"
                        aria-label="Remove selected file"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Resume Preview Section */}
        {resumeUrl && (
          <div className="mt-8 mx-4">
            <div
              onClick={toggleResumeView}
              className="cursor-pointer hover:bg-muted/50 transition-colors p-4 sm:p-6 border rounded-lg bg-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold">
                      Current Resume
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {showResume
                        ? "Your uploaded resume is displayed below"
                        : "Click to preview your current resume"}
                    </p>
                  </div>
                </div>
                <div
                  className="transition-transform duration-300"
                  style={{
                    transform: showResume ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div
              className="overflow-hidden transition-all duration-500 ease-in-out"
              style={{
                maxHeight: showResume ? "2000px" : "0px",
                opacity: showResume ? 1 : 0,
              }}
            >
              <div className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    <iframe
                      src={resumeUrl}
                      title="Resume Preview"
                      className="w-full h-175 rounded-md border-0"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeViewerPage;
