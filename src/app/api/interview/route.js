import { connect } from "@/lib/db";
import getQuestions from "@/lib/InterviewQuestions";
import ApplicationModel from "@/models/applicationModel";
import { Assessment } from "@/models/assessmentModel";
import { Interview } from "@/models/interviewModel";
import jobModel from "@/models/jobModel";
import { checkAuth } from "@/utils/checkAuth";
import { NextResponse } from "next/server";

export async function GET() {
  const authResult = await checkAuth({ allowedRoles: ["candidate"]})
  await connect()

  if (!authResult.authenticated) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.error === "Forbidden" ? 403 : 401 }
    );
  }

  try {
    const interviews = await Interview.aggregate([
      {
        $match: {
          "candidates.candidateId": authResult.userId,
        },
      },
      {
        $lookup: {
          from: "jobs",          // collection name (NOT model name)
          localField: "jobId",
          foreignField: "_id",
          as: "job",
        },
      },
      {
        $unwind: {
          path: "$job",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    return NextResponse.json(interviews);
  } catch (error) {
    console.error("Error in Interview API:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

// /api/interview?jobId=<jobId>
export async function POST(request) {
  try {
    // Connect to Database
    await connect();
    const jobId = new URL(request.url).searchParams.get("jobId");

    // Fetch Job Details
    const job = await jobModel.findById(jobId, { title: 1, description: 1, skills: 1 });
    if (!job) {
      return NextResponse.json(
        { error: "Job not found." },
        { status: 404 }
      );
    }

    // Fetch all applications for this job with their match scores
    const applications = await ApplicationModel.find(
      { jobId: jobId },
      { candidateId: 1, "eligibility.matchScore": 1, candidateClerkId: 1 }
    ).lean();

    if (!applications || applications.length === 0) {
      return NextResponse.json(
        { error: "No applications found for this job yet." },
        { status: 400 }
      );
    }

    // Extract scores and calculate percentile
    const scores = applications.map(app => app.eligibility?.matchScore || 0).sort((a, b) => a - b);

    // Formula for index of 75th percentile: (75/100) * (N - 1)
    // We want top 25% (people *above* the 75th percentile mark)
    const percentileIndex = Math.floor(scores.length * 0.75);
    const cutoffScore = scores[percentileIndex];

    // Filter candidates who meet or exceed the cutoff
    const topCandidates = applications.filter(app =>
      (app.eligibility?.matchScore || 0) >= cutoffScore
    );

    const candidateList = topCandidates.map(app => ({
      candidateId: app.candidateClerkId,
      matchScore: app.eligibility?.matchScore || 0,
      feedback: 0,
      interviewScore: 0,
      answers: []
    }));

    // If no candidates qualify (edge case), you might want to handle it
    if (candidateList.length === 0) {
      return NextResponse.json({ error: "No eligible candidates found above percentile cutoff." }, { status: 400 });
    }

    const questions = await getQuestions(job.title, job.description, job.skills);

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate questions." },
        { status: 500 }
      );
    }

    // Create Assessment Document
    const newAssessment = await Assessment.create({
      title: `${job.title} Assessment`,
      questions: questions.map((q) => ({
        text: q.text,
        modelAnswer: q.modelAnswer,
        score: q.score,
      })),
    });

    const twentyfourHoursFromNow = new Date();
    twentyfourHoursFromNow.setHours(twentyfourHoursFromNow.getHours() + 24);

    const fourHoursLater = new Date(twentyfourHoursFromNow);
    fourHoursLater.setHours(fourHoursLater.getHours() + 4);

    const newInterview = await Interview.create({
      jobId: jobId,
      candidates: candidateList,
      assessmentId: newAssessment._id,
      status: "scheduled",
      startAt: twentyfourHoursFromNow,
      endAt: fourHoursLater,
      duration: 240 // 4 hours in minutes
    });

    return NextResponse.json(
      {
        message: "Interview session created successfully",
        interviewId: newInterview._id,
        candidatesSelected: candidateList.length,
        percentileCutoffScore: cutoffScore
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error in Assessment API:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
