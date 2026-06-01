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

      // keep only the matched candidate inside candidates array
      {
        $addFields: {
          candidates: {
            $filter: {
              input: "$candidates",
              as: "candidate",
              cond: {
                $eq: ["$$candidate.candidateId", authResult.userId],
              },
            },
          },
        },
      },

      {
        $lookup: {
          from: "jobs",
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

    if (!jobId) {
      return NextResponse.json(
        { 
          error: "Missing jobId parameter",
          details: "Please provide a valid job ID in the request."
        },
        { status: 400 }
      );
    }

    // Fetch Job Details
    const job = await jobModel.findById(jobId, { title: 1, description: 1, skills: 1 });
    if (!job) {
      return NextResponse.json(
        { 
          error: "Job not found",
          details: "The job position you're trying to schedule for no longer exists."
        },
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
        { 
          error: "No applications found for this job",
          details: "There are no active applications to schedule interviews for."
        },
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
      feedback: "",
      interviewScore: 0,
    }));

    // If no candidates qualify (edge case), you might want to handle it
    if (candidateList.length === 0) {
      return NextResponse.json(
        { 
          error: "No eligible candidates found",
          details: "No candidates meet the percentile cutoff for this job."
        },
        { status: 400 }
      );
    }

    try {
      const questions = await getQuestions(job.title, job.description, job.skills);

      if (!questions || questions.length === 0) {
        return NextResponse.json(
          { 
            error: "Failed to generate interview questions",
            details: "The AI service encountered an issue. Please try again later."
          },
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
    } catch (aiError) {
      // Handle AI service errors specifically
      if (aiError.status === 503 || aiError.message?.includes("high demand")) {
        return NextResponse.json(
          { 
            error: "AI service temporarily unavailable",
            details: "The service is experiencing high demand. Please try again in a few moments."
          },
          { status: 503 }
        );
      }
      throw aiError;
    }
  } catch (error) {
    console.error("Error in Interview API:", error);
    
    // Handle specific error types
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { 
          error: "Validation error",
          details: Object.values(error.errors).map(e => e.message).join(", ")
        },
        { status: 400 }
      );
    }

    if (error.name === "MongoError" || error.code === 11000) {
      return NextResponse.json(
        { 
          error: "Database error",
          details: "An interview session for this configuration already exists."
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        error: "Internal server error",
        details: "Something went wrong. Please try again or contact support if the problem persists.",
        ...(process.env.NODE_ENV === 'development' && { debug: error.message })
      },
      { status: 500 }
    );
  }
}
