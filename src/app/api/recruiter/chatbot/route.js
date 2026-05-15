import { NextResponse } from "next/server";
import { ApiError, GoogleGenAI } from "@google/genai";
import { checkAuth } from "@/utils/checkAuth";

const MODEL = "gemini-3-flash-preview";
const MAX_REPLY_CHAR = 800;

function buildRecruiterContext(contextData, pageType) {
  const segments = [];

  switch (pageType) {
    case "dashboard":
      if (contextData?.summaryCards) {
        Object.entries(contextData.summaryCards).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            segments.push(`${key}: ${JSON.stringify(value)}`);
          }
        });
      }
      if (contextData?.topJobs?.length) {
        const topJobsSummary = contextData.topJobs
          .slice(0, 5)
          .map((j) => `${j.title} (${j.applicationsCount || 0} apps)`)
          .join(", ");
        segments.push(`Top performing jobs: ${topJobsSummary}`);
      }
      break;

    case "analytics":
      if (contextData?.keyMetrics) {
        Object.entries(contextData.keyMetrics).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            segments.push(`${key}: ${value}`);
          }
        });
      }
      if (contextData?.analyticsFilters) {
        segments.push(
          `Current filters: Date range - ${contextData.analyticsFilters.dateRange || "all"}, ` +
          `Department - ${contextData.analyticsFilters.department || "all"}, ` +
          `Location - ${contextData.analyticsFilters.location || "all"}`
        );
      }
      break;

    case "candidate":
      if (contextData?.candidate) {
        const c = contextData.candidate;
        segments.push(`Candidate: ${c.fullName}`);
        segments.push(`Experience: ${c.totalExperienceDuration || 0} years`);
        if (c.resume?.skills?.length) {
          segments.push(`Skills: ${c.resume.skills.slice(0, 10).join(", ")}`);
        }
        if (c.resume?.education?.length) {
          segments.push(
            `Education: ${c.resume.education
              .map((e) => `${e.course} @ ${e.instituteName}`)
              .join(", ")}`
          );
        }
        if (c.resume?.atsScore !== undefined) {
          segments.push(`ATS Score: ${c.resume.atsScore}%`);
        }
      }
      break;

    case "job":
      if (contextData?.job) {
        const j = contextData.job;
        segments.push(`Job: ${j.title} at ${j.companyName}`);
        segments.push(`Location: ${j.location}, Mode: ${j.workMode}`);
        if (j.skills?.length) {
          segments.push(`Required skills: ${j.skills.slice(0, 8).join(", ")}`);
        }
        segments.push(`Applications: ${j.applicationsCount || 0}`);
        segments.push(`Salary: ${j.salaryRange?.min || "N/A"} - ${j.salaryRange?.max || "N/A"}`);
      }
      if (contextData?.applicantsSummary) {
        segments.push(`Applicants Summary:\n${contextData.applicantsSummary}`);
      }
      if (contextData?.stats) {
        const stats = contextData.stats;
        segments.push(
          `Application Stats: Total - ${stats.totalApplied}, Avg Match - ${stats.avgMatchScore}%, ` +
          `Shortlisted - ${stats.shortlisted}, Interviewed - ${stats.interviewed}, ` +
          `Hired - ${stats.hired}, Rejected - ${stats.rejected}`
        );
      }
      if (contextData?.applications?.length) {
        segments.push(`Detailed candidate list loaded with ${contextData.applications.length} applications`);
      }
      break;

    case "discover":
      if (contextData?.jobs?.length) {
        segments.push(`Available positions: ${contextData.jobs.length}`);
        const jobSummary = contextData.jobs
          .slice(0, 5)
          .map((j) => `${j.title} (${j.applicationsCount || 0} apps)`)
          .join(", ");
        segments.push(`Latest jobs: ${jobSummary}`);
      }
      break;

    default:
      break;
  }

  const summary = segments.join("\n").trim();
  return summary || "Context data not available";
}

export async function POST(request) {
  const authResult = await checkAuth({ allowedRoles: ["recruiter"] });

  if (!authResult.authenticated) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.error === "Forbidden" ? 403 : 401 }
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const message =
    typeof payload?.message === "string" ? payload.message.trim() : "";
  const pageType = payload?.pageType || "default";
  const contextData = payload?.context || {};

  if (!message) {
    return NextResponse.json(
      { error: "A non-empty message is required" },
      { status: 400 }
    );
  }

  const apiKey =
    process.env.CHAT_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  if (!apiKey) {
    console.error("Gemini API key is not configured");
    return NextResponse.json(
      { error: "Gemini API key is not configured" },
      { status: 500 }
    );
  }

  const recruiterContext = buildRecruiterContext(contextData, pageType);

  const ai = new GoogleGenAI({ apiKey, apiVersion: "v1alpha" });
  const systemPrompt =
    "You are an AI recruiting assistant helping a recruiter manage their hiring process. " +
    "Provide actionable insights, strategic recommendations, and concise analysis. " +
    "Focus on practical next steps and optimization strategies. " +
    `Your responses must stay within ${MAX_REPLY_CHAR} characters.` +
    `\n\nContext:\n${recruiterContext}`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
      config: {
        systemInstruction: {
          role: "system",
          parts: [{ text: systemPrompt }],
        },
        temperature: 0.7,
      },
    });

    const rawText = response?.text ?? "";
    const reply = typeof rawText === "string" ? rawText.trim() : "";

    if (!reply) {
      throw new Error("Gemini response did not include output text");
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Recruiter chatbot Gemini error:", error);

    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          error: "Unable to generate a response at this time.",
          details:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: error.status ?? 502 }
      );
    }

    return NextResponse.json(
      {
        error: "Unable to generate a response at this time.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 502 }
    );
  }
}
