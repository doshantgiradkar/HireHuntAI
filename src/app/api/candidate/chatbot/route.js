import { NextResponse } from "next/server";
import { ApiError, GoogleGenAI } from "@google/genai";
import { checkAuth } from "@/utils/checkAuth";
import { connect } from "@/lib/db";
import Candidate from "@/models/candidateModel";

const MODEL = "gemini-3-flash-preview";
const MAX_REPLY_CHAR = 500;

function buildCandidateContext(candidate) {
  if (!candidate?.resume) {
    return "No resume data is available for this candidate. Encourage them to upload or refresh their resume.";
  }

  const segments = [];
  const { resume, totalExperienceDuration, address } = candidate;

  if (resume.skills?.length) {
    segments.push(`Skills: ${resume.skills.join(", ")}.`);
  }

  if (resume.experience?.length) {
    const topExperience = resume.experience
      .slice(0, 4)
      .map((exp) => {
        const desc = exp.jobDesc ? ` - ${exp.jobDesc}` : "";
        return `${exp.jobTitle} (${exp.months} months)${desc}`;
      })
      .join(" | ");
    segments.push(`Experience: ${topExperience}.`);
  }

  if (resume.projects?.length) {
    const topProjects = resume.projects
      .slice(0, 4)
      .map((project) => {
        const technologies = Array.isArray(project.technologies)
          ? project.technologies.filter(Boolean).join(", ")
          : "";
        const desc = project.description ? ` - ${project.description}` : "";
        const techText = technologies ? ` [Tech: ${technologies}]` : "";
        const urlText = project.url ? ` (${project.url})` : "";
        return `${project.title || "Untitled project"}${techText}${urlText}${desc}`;
      })
      .join(" | ");
    segments.push(`Projects: ${topProjects}.`);
  }

  if (typeof totalExperienceDuration === "number") {
    segments.push(`Total experience: ${totalExperienceDuration} years.`);
  }

  if (resume.education?.length) {
    const eduSummary = resume.education
      .slice(0, 3)
      .map(
        (edu) =>
          `${edu.eduType} in ${edu.course} @ ${edu.instituteName} (${edu.yearOfComp})`,
      )
      .join(" | ");
    segments.push(`Education: ${eduSummary}.`);
  }

  if (resume.certifications?.length) {
    const certSummary = resume.certifications
      .slice(0, 3)
      .map(
        (cert) =>
          `${cert.name} - ${cert.provider}${cert.yearOfComp ? ` (${cert.yearOfComp})` : ""}`,
      )
      .join(" | ");
    segments.push(`Certifications: ${certSummary}.`);
  }

  if (resume.socials?.length) {
    const socials = resume.socials
      .map((social) => `${social.name}: ${social.url}`)
      .join(" | ");
    segments.push(`Social profiles: ${socials}.`);
  }

  if (address?.city && address?.state) {
    segments.push(`Location: ${address.city}, ${address.state}.`);
  }

  if (typeof resume.atsScore === "number") {
    segments.push(`ATS score: ${resume.atsScore}.`);
  }

  const summary = segments.join("\n").trim();
  return summary || "Resume data is present but no readable fields were found.";
}

export async function POST(request) {
  const authResult = await checkAuth({ allowedRoles: ["candidate"] });

  if (!authResult.authenticated) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.error === "Forbidden" ? 403 : 401 },
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  const message =
    typeof payload?.message === "string" ? payload.message.trim() : "";

  if (!message) {
    return NextResponse.json(
      { error: "A non-empty message is required" },
      { status: 400 },
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
      { status: 500 },
    );
  }

  await connect();

  const candidate = await Candidate.findOne({
    clerkId: authResult.userId,
  }).lean();
  const candidateContext = buildCandidateContext(candidate);

  const ai = new GoogleGenAI({ apiKey, apiVersion: "v1alpha" });
  const systemPrompt =
    "You are a resume-savvy interview preparation assistant. Give concise, practical answers grounded in the candidate's verified details, highlight strengths, point out gaps kindly, and suggest next steps for interview prep and job search. Your responses must stay within " +
    `${MAX_REPLY_CHAR} characters and explicitly mention when data is missing.` +
    `\n\nCandidate profile data:\n${candidateContext}\nIf information is missing, be transparent about it and encourage the candidate to update their resume.`;

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
    console.error("Candidate chatbot Gemini error:", error);

    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          error: "Unable to generate a response at this time.",
          details:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: error.status ?? 502 },
      );
    }

    return NextResponse.json(
      {
        error: "Unable to generate a response at this time.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 502 },
    );
  }
}
