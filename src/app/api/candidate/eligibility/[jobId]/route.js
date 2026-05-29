import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connect as dbConnect } from "@/lib/db";
import Job from "@/models/jobModel";
import Candidate from "@/models/candidateModel";
import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { TaskType } from "@google/generative-ai";

// =====================
// Utility helpers
// =====================

const levelOrder = ["Fresher", "Mid", "Senior", "Lead"];

function levelDistance(a, b) {
  return Math.abs(levelOrder.indexOf(a) - levelOrder.indexOf(b));
}

function normalizeArray(arr = []) {
  return arr.map((v) => v.toLowerCase().trim());
}

function linearMap(value, inMin, inMax, outMin, outMax) {
  return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
}

function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

export async function semanticSimilarity(resumeText, jobText) {
  if (!resumeText || !jobText) return 0;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // 2. Get the model instance
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

  // 3. Execute batch embeddings
  const result = await model.batchEmbedContents({
    requests: [
      {
        content: { parts: [{ text: resumeText }] },
        taskType: TaskType.SEMANTIC_SIMILARITY,
      },
      {
        content: { parts: [{ text: jobText }] },
        taskType: TaskType.SEMANTIC_SIMILARITY,
      },
    ],
  });
  const [resumeEmbedding, jobEmbedding] = result.embeddings.map(
    (e) => e.values,
  );

  const similarity = cosineSimilarity(resumeEmbedding, jobEmbedding);

  // Clamp to 0–1 range (safety)
  return Math.max(0, Math.min(1, similarity));
}

function experienceDurationScore(exp, min) {
  if (exp == null || min == null) return 0;

  // How fast the curve reaches max score (tunable)
  const softness = min * 0.6 + 0.5;

  // Difference from requirement
  const delta = exp - min;

  // Sigmoid-like smooth curve
  const normalized = 1 / (1 + Math.exp(-delta / softness));

  return Math.round(normalized * 10);
}

// =====================
// Main Route
// =====================

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const candidate = await Candidate.findOne({ clerkId: userId });
    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 },
      );
    }

    const { resume } = candidate;

    // =====================
    // 🚦 HARD FILTERS
    // =====================

    if (!resume?.atsScore || resume.atsScore < 70) {
      return NextResponse.json({
        matchScore: 0,
        isEligible: false,
        reason: "ATS score is below the required threshold",
      });
    }

    const highestEdu = resume.education?.[resume.education.length - 1]?.eduType;
    const jobExpectedEdu = job.educationLevel;

    // if (highestEdu !== jobExpectedEdu) {
    //   return NextResponse.json({
    //     matchScore: 0,
    //     isEligible: false,
    //     reason: "Education level does not meet job expectation"
    //   });
    // }

    // =====================
    // 🧮 SCORING
    // =====================

    let score = 0;

    // 1️⃣ Skills — 30
    const candSkills = normalizeArray(resume.skills);
    const jobSkills = normalizeArray(job.skills);
    const overlap = candSkills.filter((s) => jobSkills.includes(s)).length;
    const skillScore = Math.min(30, (overlap / jobSkills.length) * 30);
    score += skillScore;

    // 3️⃣ Experience Duration — 10
    const exp = candidate.totalExperienceDuration || 0;
    const min = job.experienceYear || {};
    let expScore = experienceDurationScore(exp, min);
    score += expScore;

    // 4️⃣ ATS — 35
    const atsScore = linearMap(resume.atsScore, 70, 100, 10, 35);
    score += atsScore;

    // 5️⃣ Education — 10
    score += 10; // Passed hard filter → full score

    // 6️⃣ Semantic — 10
    const resumeText = JSON.stringify(resume);
    const sim = await semanticSimilarity(resumeText, job.description);
    score += sim * 10;

    // 7️⃣ Certificates — 3
    const certCount = resume.certifications?.length || 0;
    score += Math.min(3, certCount);

    // 8️⃣ Location / WorkMode — 2
    let locScore = 0;
    if (job.workMode === "Remote") locScore = 2;
    else if (candidate.address?.city === job.location) locScore = 2;
    else if (candidate.address?.state === job.location) locScore = 1;
    score += locScore;

    const matchScore = Math.round(score);
    const isEligible = matchScore >= 60;

    return NextResponse.json(
      isEligible
        ? { matchScore, isEligible }
        : {
            matchScore,
            isEligible,
            reason: "Overall match score below eligibility threshold",
          },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
