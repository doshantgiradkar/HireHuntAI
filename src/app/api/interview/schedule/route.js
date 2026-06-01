import { connect } from "@/lib/db";
import { sendShortlistNotification } from "@/lib/emailService";
import getQuestions from "@/lib/InterviewQuestions";
import ApplicationModel from "@/models/applicationModel";
import { Assessment } from "@/models/assessmentModel";
import { Interview } from "@/models/interviewModel";
import jobModel from "@/models/jobModel";
import recruiterModel from "@/models/recruiterModel";
import User from "@/models/userModel";
import { checkAuth } from "@/utils/checkAuth";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Connect to Database
    await connect();

    // Check authentication
    const authResult = await checkAuth({ allowedRoles: ["recruiter"] });
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.error === "Forbidden" ? 403 : 401 },
      );
    }

    const body = await request.json();
    const { jobId, candidates, startAt, endAt, duration } = body;
    const recruiter = await recruiterModel.findOne({
      clerkId: authResult.userId, // or whatever identifier you have
    });

    // Validation
    if (
      !jobId ||
      !candidates ||
      !Array.isArray(candidates) ||
      candidates.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid request: jobId and candidates array are required",
          details:
            "Please provide a valid job ID and select at least one candidate.",
        },
        { status: 400 },
      );
    }

    if (!startAt || !endAt || !duration) {
      return NextResponse.json(
        {
          error: "Invalid request: startAt, endAt, and duration are required",
          details: "Please provide interview date and time.",
        },
        { status: 400 },
      );
    }

    // Validate dates
    const start = new Date(startAt);
    const end = new Date(endAt);
    if (start >= end) {
      return NextResponse.json(
        {
          error: "Invalid dates: start time must be before end time",
          details: "Please select a valid interview time window.",
        },
        { status: 400 },
      );
    }

    // Fetch Job Details
    const job = await jobModel.findById(jobId, {
      title: 1,
      description: 1,
      skills: 1,
    });
    if (!job) {
      return NextResponse.json(
        {
          error: "Job not found",
          details:
            "The job position you're trying to schedule for no longer exists.",
        },
        { status: 404 },
      );
    }

    // Fetch selected candidate applications to get match scores
    const applications = await ApplicationModel.find(
      { jobId: jobId, candidateClerkId: { $in: candidates } },
      { candidateClerkId: 1, "eligibility.matchScore": 1 },
    ).lean();

    if (!applications || applications.length === 0) {
      return NextResponse.json(
        {
          error: "No matching applications found for selected candidates",
          details:
            "One or more candidates don't have active applications for this job.",
        },
        { status: 400 },
      );
    }

    const candidateList = applications.map((app) => ({
      candidateId: app.candidateClerkId,
      matchScore: app.eligibility?.matchScore || 0,
      feedback: "",
      interviewScore: 0,
    }));

    try {
      const questions = await getQuestions(
        job.title,
        job.description,
        job.skills,
      );

      if (!questions || questions.length === 0) {
        return NextResponse.json(
          {
            error: "Failed to generate interview questions",
            details:
              "The AI service encountered an issue. Please try again later.",
          },
          { status: 500 },
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

      // Create Interview Session with provided date/time
      const newInterview = await Interview.create({
        jobId: jobId,
        candidates: candidateList,
        assessmentId: newAssessment._id,
        status: "scheduled",
        startAt: start,
        endAt: end,
        duration: duration,
      });

      const candidateIds = candidateList.map(
        (candidate) => candidate.candidateId,
      );

      const users = await User.find({
        clerkId: { $in: candidateIds },
      });

      const userMap = new Map(users.map((user) => [user.clerkId, user]));

      await Promise.all(
        candidateList.map(async (candidate) => {
          const user = userMap.get(candidate.candidateId);

          if (!user) return;

          await sendShortlistNotification({
            candidateEmail: user.email,
            candidateName: `${user.firstName} ${user.lastName}`,
            jobTitle: job.title,
            companyName: recruiter.industry,
            interviewDate: start.toLocaleDateString(),
          });
        }),
      );

      return NextResponse.json(
        {
          success: true,
          message: "Interview session created successfully",
          _id: newInterview._id,
          interviewId: newInterview._id,
          candidatesSelected: candidateList.length,
        },
        { status: 201 },
      );
    } catch (aiError) {
      // Handle AI service errors specifically
      if (aiError.status === 503 || aiError.message?.includes("high demand")) {
        return NextResponse.json(
          {
            error: "AI service temporarily unavailable",
            details:
              "The service is experiencing high demand. Please try again in a few moments.",
          },
          { status: 503 },
        );
      }
      throw aiError;
    }
  } catch (error) {
    console.error("Error in Schedule Interview API:", error);

    // Handle specific error types
    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          error: "Validation error",
          details: Object.values(error.errors)
            .map((e) => e.message)
            .join(", "),
        },
        { status: 400 },
      );
    }

    if (error.name === "MongoError" || error.code === 11000) {
      return NextResponse.json(
        {
          error: "Database error",
          details:
            "An interview session for this configuration already exists.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          "Something went wrong. Please try again or contact support if the problem persists.",
        ...(process.env.NODE_ENV === "development" && { debug: error.message }),
      },
      { status: 500 },
    );
  }
}
