import { connect } from "@/lib/db";
import Candidate from "@/models/candidateModel";
import { Interview } from "@/models/interviewModel";
import { checkAuth } from "@/utils/checkAuth";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {

  const authResult = await checkAuth({
    allowedRoles: ["candidate"],
  });

  if (!authResult.authenticated) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.error === "Forbidden" ? 403 : 401 }
    );
  }

  const { interviewId } = await params;

  if (!interviewId) {
    return NextResponse.json(
      { error: "Missing interviewId." },
      { status: 400 }
    );
  }

  try {
    await connect();

    const interview = await Interview.findOne({
      _id: interviewId,
      "candidates.candidateId": authResult.userId,
    }).populate("assessmentId");

    const candidate = await Candidate.findOne({ userId: authResult.userId });

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        jobId: interview.jobId,
        candidate,
        questions: interview.assessmentId?.questions,
        status: interview.status,
        startAt: interview.startAt,
        endAt: interview.endAt,
        duration: interview.duration,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching interview details:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
