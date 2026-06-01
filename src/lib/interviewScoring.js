import { GoogleGenAI } from "@google/genai";

const SCORE_MODEL = "gemini-2.5-flash";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const extractJsonText = (raw) =>
  String(raw || "")
    .replace(/```json\s*/gi, "")
    .replace(/```/g, "")
    .trim();

const scoreWithGemini = async ({ evaluations, assessment = null }) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `
You are grading candidate interview answers.
Return ONLY valid JSON in this exact format:
{
  "perQuestion": [
    {
      "index": 0,
      "questionId": "string",
      "awardedScore": 0,
      "feedback": "short reason"
    }
  ]
}

CRITICAL rules:
- Return one entry per question in the SAME ORDER as the input array.
- "index" and "questionId" MUST be copied EXACTLY from the input — do NOT modify, truncate, or reformat them.
- For each question, "awardedScore" must be an integer from 0 to maxScore (inclusive).
- Compare candidateAnswer against modelAnswer for semantics, completeness, and technical correctness.
- "feedback" must be a concise, actionable plain text string.
- Be fair and objective. Award partial credit for partially correct answers.
- Award 0 only if the answer is completely wrong, irrelevant, or empty.

Assessment context:
${JSON.stringify(assessment)}

Questions and answers to evaluate (grade each one):
${JSON.stringify(evaluations)}
`;

  const response = await ai.models.generateContent({
    model: SCORE_MODEL,
    contents: prompt,
  });

  const parsed = JSON.parse(extractJsonText(response.text));
  if (!parsed || !Array.isArray(parsed.perQuestion)) {
    throw new Error("Invalid Gemini scoring response shape.");
  }

  return {
    perQuestion: parsed.perQuestion,
    engine: "gemini",
  };
};

export async function calculateInterviewScore({
  assessment = null,
  questions = [],
  transcriptEntries = [],
}) {
  const normalizedQuestions = Array.isArray(questions) ? questions : [];
  const normalizedTranscript = Array.isArray(transcriptEntries)
    ? transcriptEntries
    : [];

  const transcriptByQuestionId = new Map();
  normalizedTranscript.forEach((entry) => {
    if (entry?.questionId == null) {
      return;
    }
    const questionId = String(entry.questionId);
    // Keep first answer if duplicates appear later.
    if (!transcriptByQuestionId.has(questionId)) {
      transcriptByQuestionId.set(questionId, entry);
    }
  });

  const evaluations = normalizedQuestions.map((question, index) => {
    const questionId =
      question?._id != null
        ? String(question._id)
        : question?.questionId != null
          ? String(question.questionId)
          : String(index + 1);

    const maxScore = Number.isFinite(Number(question?.score))
      ? clamp(Number(question.score), 0, 100)
      : 10;

    const transcriptEntry = transcriptByQuestionId.get(questionId) || null;
    const candidateAnswerRaw =
      transcriptEntry?.answer ??
      transcriptEntry?.response ??
      transcriptEntry?.message ??
      "";
    const candidateAnswer = String(candidateAnswerRaw || "");
    const hasCandidateAnswer = Boolean(candidateAnswer.trim());

    return {
      index,
      questionId,
      questionText: String(question?.text || ""),
      modelAnswer: String(question?.modelAnswer || ""),
      candidateAnswer,
      hasCandidateAnswer,
      maxScore,
    };
  });

  const firstQuestion = evaluations[0] || null;
  if (firstQuestion && !firstQuestion.hasCandidateAnswer) {
    const perQuestion = evaluations.map((item) => ({
      questionId: item.questionId,
      maxScore: item.maxScore,
      awardedScore: 0,
      feedback:
        item.index === 0
          ? "Mandatory question not answered. Candidate disqualified."
          : "Score voided due to unanswered mandatory first question.",
    }));

    const maxScore = perQuestion.reduce((sum, row) => sum + row.maxScore, 0);
    return {
      totalScore: 0,
      maxScore,
      percentage: 0,
      normalizedScore: 0,
      perQuestion,
      engine: "rule",
      disqualified: true,
      disqualificationReason: "Unanswered mandatory first question.",
    };
  }

  const answeredEvaluations = evaluations.filter(
    (entry) => entry.hasCandidateAnswer,
  );
  let scored = {
    perQuestion: [],
    engine: "gemini",
  };
  if (answeredEvaluations.length > 0) {
    scored = await scoreWithGemini({
      evaluations: answeredEvaluations,
      assessment: assessment || { questions: normalizedQuestions },
    });
  }

  const modelResultByQuestionId = new Map();
  const modelResultByIndex = new Map();
  scored.perQuestion.forEach((entry) => {
    if (
      entry?.questionId != null &&
      !modelResultByQuestionId.has(String(entry.questionId))
    ) {
      modelResultByQuestionId.set(String(entry.questionId), entry);
    }
    if (
      Number.isFinite(Number(entry?.index)) &&
      !modelResultByIndex.has(Number(entry.index))
    ) {
      modelResultByIndex.set(Number(entry.index), entry);
    }
  });

  const perQuestion = evaluations.map((item) => {
    if (!item.hasCandidateAnswer) {
      return {
        questionId: item.questionId,
        maxScore: item.maxScore,
        awardedScore: 0,
        feedback: "No answer submitted.",
      };
    }

    const modelResult =
      modelResultByQuestionId.get(item.questionId) ||
      modelResultByIndex.get(item.index) ||
      null;

    const awardedScore = Number.isFinite(Number(modelResult?.awardedScore))
      ? clamp(Number(modelResult.awardedScore), 0, item.maxScore)
      : 0;

    return {
      questionId: item.questionId,
      maxScore: item.maxScore,
      awardedScore,
      feedback: String(
        modelResult?.feedback || "Score unavailable from model response.",
      ),
    };
  });

  const totalScore = perQuestion.reduce(
    (sum, row) => sum + row.awardedScore,
    0,
  );
  const maxScore = perQuestion.reduce((sum, row) => sum + row.maxScore, 0);
  const percentage =
    maxScore > 0 ? Number(((totalScore / maxScore) * 100).toFixed(2)) : 0;

  return {
    totalScore: Number(totalScore.toFixed(2)),
    maxScore,
    percentage,
    normalizedScore: percentage,
    perQuestion,
    engine: scored.engine,
    disqualified: false,
    disqualificationReason: null,
  };
}
