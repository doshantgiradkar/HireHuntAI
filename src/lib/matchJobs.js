import Candidate from "@/models/candidateModel";
import jobModel from "@/models/jobModel";
import { TaskType } from "@google/generative-ai";
import { GoogleGenerativeAI } from "@google/generative-ai";

function normalizeArray(arr = []) {
  return arr.filter(Boolean).map((v) => String(v).toLowerCase().trim());
}

function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

function normalizeScore(raw) {
  if (raw <= 40) return raw;

  return Math.round(50 + ((raw - 40) / 60) * 50);
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

function calculateSkillsScore(candidateSkills, jobSkills) {
  if (!jobSkills?.length) return 20;

  const candidate = new Set(normalizeArray(candidateSkills));
  const required = normalizeArray(jobSkills);

  const matched = required.filter((skill) => candidate.has(skill)).length;
  const ratio = matched / required.length;

  return Math.sqrt(ratio) * 30;
}

function calculateExperienceScore(candidateYears, requiredYears) {
  candidateYears = Number(candidateYears || 0);
  requiredYears = Number(requiredYears || 0);

  if (requiredYears <= 0) return 20;

  const ratio = candidateYears / requiredYears;

  if (ratio >= 1.5) return 20;
  if (ratio >= 1.0) return 18;
  if (ratio >= 0.75) return 15;
  if (ratio >= 0.5) return 10;

  return Math.round(ratio * 10);
}

function calculateEducationScore(candidate, job) {
  if (!job.educationLevel) return 5;

  const candidateEdu =
    candidate.resume?.education?.[candidate.resume.education.length - 1]
      ?.eduType;

  if (!candidateEdu) return 0;

  return candidateEdu === job.educationLevel ? 5 : 2;
}

function calculateATSScore(atsScore) {
  if (!atsScore) return 0;

  if (atsScore >= 90) return 10;
  if (atsScore >= 80) return 8;
  if (atsScore >= 70) return 6;
  if (atsScore >= 60) return 4;

  return 2;
}

function calculateLocationScore(candidate, job) {
  if (job.workMode === "Remote") return 2;

  if (candidate.address?.city?.toLowerCase() === job.location?.toLowerCase()) {
    return 2;
  }

  if (candidate.address?.state?.toLowerCase() === job.location?.toLowerCase()) {
    return 1;
  }

  return 0;
}

export default async function calculateMatchScore(userId, jobId) {
  try {
    const [candidate, job] = await Promise.all([
      Candidate.findOne({ clerkId: userId }),
      jobModel.findById(jobId),
    ]);

    if (!candidate || !job) {
      return {
        matchScore: 0,
        isEligible: false,
        reason: "Candidate or job not found",
      };
    }

    const resume = candidate.resume || {};

    let score = 0;

    // Skills (40)
    score += calculateSkillsScore(resume.skills, job.skills);

    // Experience (20)
    score += calculateExperienceScore(
      candidate.totalExperienceDuration,
      job.experienceYear,
    );

    // Semantic similarity (20)
    let semanticScore = 0;

    try {
      const similarity = await semanticSimilarity(
        JSON.stringify(resume),
        `${job.title}\n${job.description}`,
      );

      semanticScore = Math.round(similarity * 20);
    } catch (err) {
      console.error("Semantic score failed:", err);
    }

    score += semanticScore;

    // Education (5)
    score += calculateEducationScore(candidate, job);

    // ATS (10)
    score += calculateATSScore(resume.atsScore);

    // Certifications (3)
    score += Math.min(resume.certifications?.length || 0, 3);

    // Location (2)
    score += calculateLocationScore(candidate, job);

    const rawScore = score;

    const matchScore =
      rawScore <= 40 ? rawScore : Math.round(50 + ((rawScore - 40) / 60) * 50);

    return {
      matchScore,
      isEligible: matchScore >= 50,
    };
  } catch (err) {
    console.error(err);

    return {
      matchScore: 0,
      isEligible: false,
      reason: "Error calculating score",
    };
  }
}

export async function calculateMatchScoreByJobs(userId, job) {
  try {
    const candidate = await Candidate.findOne({
      clerkId: userId,
    });

    if (!candidate) {
      return {
        matchScore: 0,
        isEligible: false,
        reason: "Candidate not found",
      };
    }

    const resume = candidate.resume || {};

    // Skills (40)
    const skillsScore = calculateSkillsScore(resume.skills, job.skills);

    // Experience (20)
    const experienceScore = calculateExperienceScore(
      candidate.totalExperienceDuration,
      job.experienceYear,
    );

    // Semantic (20)
    let semanticScore = 0;

    try {
      const similarity = await semanticSimilarity(
        JSON.stringify(resume),
        `${job.title}\n${job.description}`,
      );

      semanticScore = Math.round(similarity * 20);
    } catch (error) {
      console.error("Semantic similarity failed:", error);
    }

    // Education (5)
    const educationScore = calculateEducationScore(candidate, job);

    // ATS (10)
    const atsScore = calculateATSScore(resume.atsScore);

    // Certifications (3)
    const certificationScore = Math.min(resume.certifications?.length || 0, 3);

    // Location (2)
    const locationScore = calculateLocationScore(candidate, job);

    const rawScore =
      skillsScore +
      experienceScore +
      semanticScore +
      educationScore +
      atsScore +
      certificationScore +
      locationScore;

    const matchScore =
      rawScore <= 40 ? rawScore : Math.round(50 + ((rawScore - 40) / 60) * 50);

    return {
      matchScore,
      isEligible: matchScore >= 50,
      breakdown: {
        skills: skillsScore,
        experience: experienceScore,
        semantic: semanticScore,
        education: educationScore,
        ats: atsScore,
        certifications: certificationScore,
        location: locationScore,
      },
    };
  } catch (error) {
    console.error("MATCH_SCORE_ERROR:", error);

    return {
      matchScore: 0,
      isEligible: false,
      reason: "Error calculating score",
    };
  }
}
