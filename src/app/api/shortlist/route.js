/**
 * Shortlist API Endpoint
 * 
 * POST /api/shortlist?jobId=<jobId> - Manually trigger shortlisting for a job
 * GET /api/shortlist?jobId=<jobId> - Get shortlisting status/history for a job
 */

import { connect } from "@/lib/db";
import { checkAuth } from "@/utils/checkAuth";
import { NextResponse } from "next/server";
import jobModel from "@/models/jobModel";
import ApplicationModel from "@/models/applicationModel";
import { Interview } from "@/models/interviewModel";
import { Assessment } from "@/models/assessmentModel";
import getQuestions from "@/lib/InterviewQuestions";
import {
  shortlistCandidates,
  transformToInterviewFormat,
  validateShortlistingPossible
} from "@/lib/shortlistingLogic";
import { sendShortlistNotification, sendRecruiterShortlistNotification } from "@/lib/emailService";

/**
 * GET - Retrieve shortlisting status for a job
 */
export async function GET(request) {
  try {
    await connect();
    
    // Check authentication - only recruiters can access
    const authResult = await checkAuth({ allowedRoles: ["recruiter"] });
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: authResult.error },
        { status: authResult.error === "Forbidden" ? 403 : 401 }
      );
    }

    const jobId = new URL(request.url).searchParams.get("jobId");
    if (!jobId) {
      return NextResponse.json(
        { error: "jobId query parameter is required" },
        { status: 400 }
      );
    }

    // Get job details
    const job = await jobModel.findById(jobId).lean();
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if recruiter owns this job
    if (job.recruiterClerkId !== authResult.userId) {
      return NextResponse.json(
        { error: "Unauthorized - you don't own this job" },
        { status: 403 }
      );
    }

    // Get interview info
    const interview = await Interview.findOne({ jobId: jobId }).lean();

    // Get application counts by status
    const applicationStats = await ApplicationModel.aggregate([
      { $match: { jobId: jobId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {};
    applicationStats.forEach(stat => {
      stats[stat._id] = stat.count;
    });

    return NextResponse.json({
      jobId,
      jobTitle: job.title,
      status: job.status,
      expiresAt: job.expiresAt,
      openings: job.openings,
      targetShortlistCount: Math.ceil(job.openings * 1.5),
      isExpired: new Date(job.expiresAt) < new Date(),
      interviewScheduled: !!interview,
      interviewStartsAt: interview?.startAt,
      interviewEndsAt: interview?.endAt,
      applicationStats: stats,
      shortlistedCount: stats.shortlisted || 0
    });
  } catch (error) {
    console.error("Error in GET /api/shortlist:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Manually trigger shortlisting for a job
 */
export async function POST(request) {
  try {
    await connect();

    // Check authentication - only recruiters can access
    const authResult = await checkAuth({ allowedRoles: ["recruiter"] });
    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: authResult.error },
        { status: authResult.error === "Forbidden" ? 403 : 401 }
      );
    }

    const jobId = new URL(request.url).searchParams.get("jobId");
    if (!jobId) {
      return NextResponse.json(
        { error: "jobId query parameter is required" },
        { status: 400 }
      );
    }

    // Get job details
    const job = await jobModel.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if recruiter owns this job
    if (job.recruiterClerkId !== authResult.userId) {
      return NextResponse.json(
        { error: "Unauthorized - you don't own this job" },
        { status: 403 }
      );
    }

    // Check if interview already exists
    const existingInterview = await Interview.findOne({ jobId: jobId }).lean();
    if (existingInterview) {
      return NextResponse.json(
        { error: "Interview already scheduled for this job", interviewId: existingInterview._id },
        { status: 400 }
      );
    }

    // Fetch all applications for this job
    const applications = await ApplicationModel.find(
      { jobId: jobId },
      {
        candidateId: 1,
        candidateClerkId: 1,
        email: 1,
        fullName: 1,
        "eligibility.matchScore": 1,
        "eligibility.atsScore": 1
      }
    ).lean();

    // Validate shortlisting is possible
    const validation = validateShortlistingPossible(job, applications);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 }
      );
    }

    // Run shortlisting logic
    const shortlistResult = shortlistCandidates({
      openings: job.openings,
      applications: applications
    });

    if (shortlistResult.shortlistCount === 0) {
      return NextResponse.json(
        { error: "No candidates shortlisted after filtering", reason: shortlistResult.reason },
        { status: 400 }
      );
    }

    // Generate interview questions
    const questions = await getQuestions(job.title, job.description, job.skills);
    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate interview questions" },
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

    // Calculate interview timing: next day 00:00 to 23:59
    const now = new Date();
    const startAt = new Date(now);
    startAt.setDate(startAt.getDate() + 1);
    startAt.setHours(0, 0, 0, 0); // Midnight

    const endAt = new Date(startAt);
    endAt.setHours(23, 59, 59, 999); // End of day

    // Transform candidates to interview format
    const candidateList = transformToInterviewFormat(shortlistResult.shortlistedCandidates);

    // Create Interview Session
    const newInterview = await Interview.create({
      jobId: jobId,
      candidates: candidateList,
      assessmentId: newAssessment._id,
      startAt: startAt,
      endAt: endAt,
      duration: 1440 // 24 hours in minutes
    });

    // Update application statuses
    const shortlistedIds = shortlistResult.shortlistedCandidates.map(c => c.candidateClerkId);
    const rejectedIds = shortlistResult.rejectedCandidates.map(c => c.candidateClerkId);

    if (shortlistedIds.length > 0) {
      await ApplicationModel.updateMany(
        { jobId: jobId, candidateClerkId: { $in: shortlistedIds } },
        { status: "shortlisted" }
      );
    }

    if (rejectedIds.length > 0) {
      await ApplicationModel.updateMany(
        { jobId: jobId, candidateClerkId: { $in: rejectedIds } },
        { status: "rejected" }
      );
    }

    // Update job status
    await jobModel.findByIdAndUpdate(
      jobId,
      {
        status: "interview_scheduled",
        shortlistedCount: shortlistResult.shortlistCount
      }
    );

    // Send notifications
    try {
      // Get recruiter details for notification
      const recruiter = await jobModel.findById(jobId).populate("recruiterId", "email fullName companyName").lean();

      // Send to shortlisted candidates
      for (const candidate of shortlistResult.shortlistedCandidates) {
        try {
          await sendShortlistNotification({
            candidateEmail: candidate.email,
            candidateName: candidate.fullName,
            jobTitle: job.title,
            companyName: job.companyName,
            interviewDate: startAt.toLocaleDateString()
          });
        } catch (error) {
          console.error(`Failed to send notification to ${candidate.email}:`, error);
        }
      }

      // Send to recruiter
      if (recruiter?.recruiterId) {
        try {
          await sendRecruiterShortlistNotification({
            recruiterEmail: recruiter.recruiterId.email,
            recruiterName: recruiter.recruiterId.fullName || recruiter.recruiterId.companyName,
            jobTitle: job.title,
            shortlistCount: shortlistResult.shortlistCount,
            totalRequired: job.openings
          });
        } catch (error) {
          console.error(`Failed to send recruiter notification:`, error);
        }
      }
    } catch (error) {
      console.error("Error sending notifications:", error);
      // Don't fail the API call if notifications fail
    }

    return NextResponse.json(
      {
        message: "Shortlisting completed successfully",
        interviewId: newInterview._id,
        shortlistedCount: shortlistResult.shortlistCount,
        rejectedCount: shortlistResult.rejectedCandidates.length,
        targetCount: shortlistResult.targetCount,
        totalEligible: shortlistResult.totalEligible,
        interviewStartsAt: startAt,
        interviewEndsAt: endAt
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/shortlist:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
