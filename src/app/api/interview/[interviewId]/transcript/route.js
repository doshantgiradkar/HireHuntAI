import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { Interview } from "@/models/interviewModel";
import { checkAuth } from "@/utils/checkAuth";

const normalizeTranscript = (rawTranscript) => {
  if (!Array.isArray(rawTranscript)) {
    return [];
  }

  return rawTranscript
    .map((entry) => {
      if (!entry) {
        return null;
      }

      const message =
        typeof entry.message === "string"
          ? entry.message
          : typeof entry.text === "string"
            ? entry.text
            : "";

      if (!message.trim()) {
        return null;
      }

      const speaker =
        typeof entry.speaker === "string"
          ? entry.speaker
          : typeof entry.role === "string"
            ? entry.role
            : typeof entry.name === "string"
              ? entry.name
              : "Unknown";

      const clientId =
        entry.clientId != null
          ? String(entry.clientId)
          : entry.id != null
            ? String(entry.id)
            : undefined;

      const timestamp =
        typeof entry.timestamp === "string"
          ? entry.timestamp
          : entry.timestamp != null
            ? String(entry.timestamp)
            : undefined;

      return {
        clientId,
        speaker,
        message: message.trim(),
        timestamp,
        isAI: Boolean(entry.isAI),
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

    return NextResponse.json(
      {
        message: append ? "Transcript appended." : "Transcript saved.",
        transcriptCount: candidateEntry?.transcript?.length ?? 0,
        interviewId: interview._id,
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
