"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">Agentic Interview</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/login")}>Login</Button>
            <Button onClick={() => router.push("/signup")} className="bg-blue-600 text-white">Sign Up</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <Card className="w-full max-w-2xl shadow-xl border-0 bg-white/90 dark:bg-slate-900/90">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Welcome to Agentic Interview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-lg text-slate-600 dark:text-slate-300 mb-6">
              The AI-powered platform for seamless, smart, and secure interview management.<br />
              Sign up as a candidate or recruiter to get started!
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" onClick={() => router.push("/signup")} className="bg-blue-600 text-white">Get Started</Button>
              <Button size="lg" variant="outline" onClick={() => router.push("/login")}>Login</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
