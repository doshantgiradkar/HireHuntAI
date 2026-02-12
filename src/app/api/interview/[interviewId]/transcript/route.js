import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { calculateInterviewScore } from "@/lib/interviewScoring";
import { Assessment } from "@/models/assessmentModel";
import { Interview } from "@/models/interviewModel";
import { checkAuth } from "@/utils/checkAuth";

const buildInterviewFeedback = (scoreSummary) => {
  if (scoreSummary?.disqualified) {
    return String(
      scoreSummary?.disqualificationReason ||
      "Candidate disqualified due to unanswered mandatory first question."
    );
  }

  const perQuestion = Array.isArray(scoreSummary?.perQuestion)
    ? scoreSummary.perQuestion
    : [];

  const concise = perQuestion
    .map((entry, index) => {
      const feedback = String(entry?.feedback || "").trim();
      if (!feedback) {
        return null;
      }
      return `Q${index + 1}: ${feedback}`;
    })
    .filter(Boolean)
    .slice(0, 3);

  return concise.length > 0
    ? concise.join(" | ")
    : "Interview scored successfully.";
};

const normalizeTranscript = (rawTranscript) => {
  if (!Array.isArray(rawTranscript)) {
    return [];
  }

  return rawTranscript
    .map((entry) => {
      if (!entry) {
        return null;
      }

      const questionId =
        entry.questionId != null
          ? String(entry.questionId)
          : entry.question?._id != null
            ? String(entry.question._id)
            : undefined;

      const answer =
        typeof entry.answer === "string"
          ? entry.answer.trim()
          : typeof entry.message === "string"
            ? entry.message.trim()
            : typeof entry.text === "string"
              ? entry.text.trim()
              : "";

      const status =
        typeof entry.status === "string"
          ? entry.status
          : answer
            ? "answered"
            : "unanswered";

      const askedAt =
        typeof entry.askedAt === "string"
          ? entry.askedAt
          : typeof entry.timestamp === "string"
            ? entry.timestamp
            : undefined;

      const answeredAt =
        typeof entry.answeredAt === "string"
          ? entry.answeredAt
          : undefined;

      // Legacy support: old payload entries without questionId are kept only if they have text.
      if (!questionId && !answer) {
        return null;
      }

      return {
        questionId,
        answer,
        status,
        askedAt,
        answeredAt,
      };
    })
    .filter(Boolean);
};

export async function POST(request, { params }) {
  const authResult = await checkAuth({ allowedRoles: ["candidate"] });

  if (!authResult.authenticated) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.error === "Forbidden" ? 403 : 401 }
    );
  }

  const { interviewId } = await params;

  if (!interviewId) {
    return NextResponse.json(
      { error: "Missing Interview ID." },
      { status: 400 }
    );
  }

  let payload = null;
  try {
    payload = await request.json();
  } catch (error) {
    payload = null;
  }

  const transcriptInput =
    payload?.transcript ?? payload?.transcriptMessages ?? payload?.messages;
  const normalizedTranscript = normalizeTranscript(transcriptInput);

  if (normalizedTranscript.length === 0) {
    return NextResponse.json(
      { error: "Transcript payload is empty or invalid." },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(request.url);
  const append = searchParams.get("append") === "true";

  try {
    await connect();

    const update = append
      ? { $push: { "candidates.$.transcript": { $each: normalizedTranscript } } }
      : { $set: { "candidates.$.transcript": normalizedTranscript } };

    const interview = await Interview.findOneAndUpdate(
      { _id: interviewId, "candidates.candidateId": authResult.userId },
      update,
      { new: true }
    );

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found." },
        { status: 404 }
      );
    }

    const candidateEntry = interview.candidates?.find(
      (candidate) => candidate.candidateId === authResult.userId
    );

    const interviewWithAssessment = await Interview.findOne({
      _id: interviewId,
      "candidates.candidateId": authResult.userId,
    }).populate("assessmentId");

    const candidateWithTranscript = interviewWithAssessment?.candidates?.find(
      (candidate) => candidate.candidateId === authResult.userId
    );

    let assessmentQuestions = Array.isArray(interviewWithAssessment?.assessmentId?.questions)
      ? interviewWithAssessment.assessmentId.questions
      : [];

    if (assessmentQuestions.length === 0 && interview?.assessmentId) {
      const assessmentDoc = await Assessment.findById(interview.assessmentId).lean();
      assessmentQuestions = Array.isArray(assessmentDoc?.questions) ? assessmentDoc.questions : [];
    }

    const transcriptForScoring = candidateWithTranscript?.transcript || candidateEntry?.transcript || normalizedTranscript;

    if (assessmentQuestions.length === 0) {
      return NextResponse.json(
        {
          message: append ? "Transcript appended." : "Transcript saved.",
          transcriptCount: candidateEntry?.transcript?.length ?? 0,
          interviewId: interview._id,
          warning: "Assessment questions unavailable; score not updated.",
        },
        { status: 200 }
      );
    }

    const assessmentForScoring = {
      id:
        interviewWithAssessment?.assessmentId?._id != null
          ? String(interviewWithAssessment.assessmentId._id)
          : String(interview?.assessmentId || ""),
      questions: assessmentQuestions,
    };

    const scoreSummary = await calculateInterviewScore({
      assessment: assessmentForScoring,
      questions: assessmentQuestions,
      transcriptEntries: transcriptForScoring,
    });

    const normalizedPercentage = scoreSummary?.disqualified
      ? 0
      : Number.isFinite(Number(scoreSummary?.normalizedScore))
        ? Number(scoreSummary.normalizedScore)
        : Number.isFinite(Number(scoreSummary?.percentage))
          ? Number(scoreSummary.percentage)
          : 18;
    const interviewFeedback = buildInterviewFeedback(scoreSummary);

    const scoreUpdateResult = await Interview.updateOne(
      { _id: interviewId },
      {
        $set: {
          "candidates.$[cand].interviewScore": normalizedPercentage,
          "candidates.$[cand].feedback": interviewFeedback,
        },
      },
      {
        arrayFilters: [{ "cand.candidateId": authResult.userId }],
      }
    );

    // Update candidate status to 'completed'
    await Interview.updateOne(
      { _id: interviewId },
      { $set: { "candidates.$[cand].status": "completed" } },
      {
        arrayFilters: [{ "cand.candidateId": authResult.userId }],
      }
    );

    if (!scoreUpdateResult?.matchedCount) {
      return NextResponse.json(
        { error: "Interview found but score update target was not matched." },
        { status: 404 }
      );
    }

    const verifyInterview = await Interview.findOne({
      _id: interviewId,
      "candidates.candidateId": authResult.userId,
    });

    const verifiedCandidate = verifyInterview?.candidates?.find(
      (candidate) => candidate.candidateId === authResult.userId
    );

    const persistedScore = Number(verifiedCandidate?.interviewScore);
    const persistedFeedback = String(verifiedCandidate?.feedback || "");
    if (!Number.isFinite(persistedScore)) {
      return NextResponse.json(
        {
          error: "Transcript saved but score did not persist.",
          debug: {
            scoreEngine: scoreSummary.engine,
            computedPercentage: normalizedPercentage,
            computedFeedback: interviewFeedback,
            updateMatchedCount: scoreUpdateResult?.matchedCount ?? 0,
            updateModifiedCount: scoreUpdateResult?.modifiedCount ?? 0,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: append ? "Transcript appended." : "Transcript saved.",
        transcriptCount: candidateEntry?.transcript?.length ?? 0,
        interviewId: interview._id,
        score: {
          ...scoreSummary,
          normalizedScore: normalizedPercentage,
          persistedScore,
          persistedFeedback,
          updateMatchedCount: scoreUpdateResult?.matchedCount ?? 0,
          updateModifiedCount: scoreUpdateResult?.modifiedCount ?? 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving transcript:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
