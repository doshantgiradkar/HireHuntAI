import Candidate from "@/models/candidateModel";
import jobModel from "@/models/jobModel";
import { TaskType } from "@google/generative-ai";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

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

export default async function calculateMatchScore (userId, jobId) {
  let Match = {
    isEligible: false,
    matchScore: 0,
    reason: "",
  };

  try {

    const job = await jobModel.findById(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    const candidate = await Candidate.findOne({ clerkId: userId });
    if (!candidate) {
      throw new Error("Candidate not found");
    }

    const { resume } = candidate;

    if (!resume?.atsScore || resume.atsScore < 70) {
      return {
        ...Match,
        matchScore: 0,
        isEligible: false,
        reason: "ATS score is below the required threshold",
      };
    }

    // const highestEdu = resume.education?.[resume.education.length - 1]?.eduType;
    // const jobExpectedEdu = job.educationLevel;

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

    // Skills — 30
    const candSkills = normalizeArray(resume.skills);
    const jobSkills = normalizeArray(job.skills);
    const overlap = candSkills.filter((s) => jobSkills.includes(s)).length;
    const skillScore = Math.min(30, (overlap / jobSkills.length) * 30);
    score += skillScore;

    // Experience Duration — 10
    const exp = candidate.totalExperienceDuration || 0;
    const min = job.experienceYear || {};
    let expScore = experienceDurationScore(exp, min);
    score += expScore;

    // ATS — 35
    const atsScore = linearMap(resume.atsScore, 70, 100, 10, 35);
    score += atsScore;

    // Education — 10
    score += 10; // Passed hard filter → full score

    // Semantic — 10
    const resumeText = JSON.stringify(resume);
    const sim = await semanticSimilarity(resumeText, job.description);
    score += sim * 10;

    // Certificates — 3
    const certCount = resume.certifications?.length || 0;
    score += Math.min(3, certCount);

    // Location / WorkMode — 2
    let locScore = 0;
    if (job.workMode === "Remote") locScore = 2;
    else if (candidate.address?.city === job.location) locScore = 2;
    else if (candidate.address?.state === job.location) locScore = 1;
    score += locScore;

    const matchScore = Math.round(score);
    const isEligible = matchScore >= 60;

    return isEligible
      ? { matchScore, isEligible }
      : {
          matchScore,
          isEligible,
          reason: "Overall match score below eligibility threshold",
        };
  } catch (err) {
    console.error(err);
    return {
      ...Match,
       reason: "Error Calculating Match Score"
    };
  }
};

export async function calculateMatchScoreByJobs (userId, jobs) {
  let Match = {
    isEligible: false,
    matchScore: 0,
    reason: "",
  };

  try {
    const candidate = await Candidate.findOne({ clerkId: userId });
    if (!candidate) {
      throw new Error("Candidate not found");
    }

    const { resume } = candidate;

    if (!resume?.atsScore || resume.atsScore < 70) {
      return {
        ...Match,
        matchScore: 0,
        isEligible: false,
        reason: "ATS score is below the required threshold",
      };
    }

    // const highestEdu = resume.education?.[resume.education.length - 1]?.eduType;
    // const jobExpectedEdu = job.educationLevel;

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

    // Skills — 30
    const candSkills = normalizeArray(resume.skills);
    const jobSkills = normalizeArray(job.skills);
    const overlap = candSkills.filter((s) => jobSkills.includes(s)).length;
    const skillScore = Math.min(30, (overlap / jobSkills.length) * 30);
    score += skillScore;

    // Experience Duration — 10
    const exp = candidate.totalExperienceDuration || 0;
    const min = job.experienceYear || {};
    let expScore = experienceDurationScore(exp, min);
    score += expScore;

    // ATS — 35
    const atsScore = linearMap(resume.atsScore, 70, 100, 10, 35);
    score += atsScore;

    // Education — 10
    score += 10; // Passed hard filter → full score

    // Semantic — 10
    const resumeText = JSON.stringify(resume);
    const sim = await semanticSimilarity(resumeText, job.description);
    score += sim * 10;

    // Certificates — 3
    const certCount = resume.certifications?.length || 0;
    score += Math.min(3, certCount);

    // Location / WorkMode — 2
    let locScore = 0;
    if (job.workMode === "Remote") locScore = 2;
    else if (candidate.address?.city === job.location) locScore = 2;
    else if (candidate.address?.state === job.location) locScore = 1;
    score += locScore;

    const matchScore = Math.round(score);
    const isEligible = matchScore >= 60;

    return isEligible
      ? { matchScore, isEligible }
      : {
          matchScore,
          isEligible,
          reason: "Overall match score below eligibility threshold",
        };
  } catch (err) {
    console.error(err);
    return {
      ...Match,
       reason: "Error Calculating Match Score"
    };
  }
};
