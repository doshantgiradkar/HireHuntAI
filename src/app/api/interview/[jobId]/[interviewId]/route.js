import { connect } from "@/lib/db";
import Candidate from "@/models/candidateModel";
import { Assessment } from "@/models/assessmentModel";
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

  await connect();
  const { interviewId } = await params;

  const interview = await Interview.findById(interviewId)
    .populate("assessmentId");

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
      duration: interview.duration
    },
    { status: 200 }
  );
}
