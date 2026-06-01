/**
 * Cron Job Service for Automated Candidate Shortlisting
 *
 * This service runs automatically at scheduled intervals to:
 * 1. Find jobs with expired application deadlines
 * 2. Shortlist top candidates (1.5x openings) based on ATS score and matchScore
 * 3. Schedule interviews for shortlisted candidates
 * 4. Update application statuses (shortlisted/rejected)
 * 5. Send notifications to candidates and recruiters
 */

import cron from "node-cron";
import { connect } from "./db.js";
import jobModel from "../models/jobModel.js";
import ApplicationModel from "../models/applicationModel.js";
import { Interview } from "../models/interviewModel.js";
import { Assessment } from "../models/assessmentModel.js";
import getQuestions from "./InterviewQuestions.js";
import {
  shortlistCandidates,
  transformToInterviewFormat,
  validateShortlistingPossible,
} from "./shortlistingLogic.js";
import {
  sendShortlistNotification,
  sendRecruiterShortlistNotification,
} from "./emailService.js";

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
let cronJobInstance = null;

/**
 * Schedule an interview for shortlisted candidates
 */
async function scheduleInterview(jobId, shortlistedCandidates, job) {
  try {
    // Generate interview questions
    const questions = await getQuestions(
      job.title,
      job.description,
      job.skills,
    );

    if (!questions || questions.length === 0) {
      console.error(`Failed to generate questions for job ${jobId}`);
      return null;
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
    const candidateList = transformToInterviewFormat(shortlistedCandidates);

    // Create Interview Session
    const newInterview = await Interview.create({
      jobId: jobId,
      candidates: candidateList,
      assessmentId: newAssessment._id,
      startAt: startAt,
      endAt: endAt,
      duration: 1440, // 24 hours in minutes
    });

    return newInterview;
  } catch (error) {
    console.error(`Error scheduling interview for job ${jobId}:`, error);
    return null;
  }
}

/**
 * Update application statuses after shortlisting
 */
async function updateApplicationStatuses(jobId, shortlistedIds, rejectedIds) {
  try {
    // Mark shortlisted applications
    if (shortlistedIds.length > 0) {
      await ApplicationModel.updateMany(
        { jobId: jobId, candidateClerkId: { $in: shortlistedIds } },
        { status: "shortlisted" },
      );
    }

    // Mark rejected applications
    if (rejectedIds.length > 0) {
      await ApplicationModel.updateMany(
        { jobId: jobId, candidateClerkId: { $in: rejectedIds } },
        { status: "rejected" },
      );
    }

    return { shortlistedIds, rejectedIds };
  } catch (error) {
    console.error(
      `Error updating application statuses for job ${jobId}:`,
      error,
    );
    throw error;
  }
}

/**
 * Send notifications to shortlisted candidates and recruiter
 */
async function sendNotifications(jobId, job, shortlistedCandidates, recruiter) {
  try {
    // Send notifications to shortlisted candidates
    for (const candidate of shortlistedCandidates) {
      try {
        await sendShortlistNotification({
          candidateEmail: candidate.email,
          candidateName: candidate.fullName,
          jobTitle: job.title,
          companyName: job.companyName,
          interviewDate: new Date(
            new Date().getTime() + 24 * 60 * 60 * 1000,
          ).toLocaleDateString(),
        });
      } catch (error) {
        console.error(
          `Failed to send notification to ${candidate.email}:`,
          error,
        );
        // Continue with other candidates even if one fails
      }
    }

    // Send notification to recruiter
    try {
      await sendRecruiterShortlistNotification({
        recruiterEmail: recruiter.email,
        recruiterName: recruiter.fullName || recruiter.companyName,
        jobTitle: job.title,
        shortlistCount: shortlistedCandidates.length,
        totalRequired: job.openings,
      });
    } catch (error) {
      console.error(`Failed to send recruiter notification:`, error);
    }
  } catch (error) {
    console.error(`Error in sending notifications for job ${jobId}:`, error);
  }
}

/**
 * Main cron function - Process shortlisting for expired jobs
 */
async function processJobShortlisting() {
  console.log(
    `[CRON] Starting job shortlisting process at ${new Date().toISOString()}`,
  );

  try {
    await connect();

    // Find jobs where application deadline has passed and status is "Open"
    const now = new Date();
    const expiredJobs = await jobModel
      .find({
        expiresAt: { $lt: now },
        status: "Open",
      })
      .lean();

    console.log(`[CRON] Found ${expiredJobs.length} expired jobs to process`);

    if (expiredJobs.length === 0) {
      console.log(`[CRON] No expired jobs found`);
      return;
    }

    // Process each expired job
    for (const job of expiredJobs) {
      try {
        console.log(`[CRON] Processing job: ${job._id} - ${job.title}`);

        // Check if interview already exists for this job
        const existingInterview = await Interview.findOne({
          jobId: job._id,
        }).lean();
        if (existingInterview) {
          console.log(
            `[CRON] Interview already exists for job ${job._id}, skipping`,
          );

          // Update job status to "interview_scheduled"
          await jobModel.findByIdAndUpdate(
            job._id,
            { status: "interview_scheduled" },
            { new: true },
          );
          continue;
        }

        // Fetch all applications for this job
        const applications = await ApplicationModel.find(
          { jobId: job._id },
          {
            candidateId: 1,
            candidateClerkId: 1,
            email: 1,
            fullName: 1,
            "eligibility.matchScore": 1,
            "eligibility.atsScore": 1,
          },
        ).lean();

        // Validate shortlisting is possible
        const validation = validateShortlistingPossible(job, applications);
        if (!validation.isValid) {
          console.log(
            `[CRON] Validation failed for job ${job._id}: ${validation.message}`,
          );
          // Leave job as Open if no eligible candidates
          continue;
        }

        // Run shortlisting logic
        const shortlistResult = shortlistCandidates({
          openings: job.openings,
          applications: applications,
        });

        console.log(
          `[CRON] Shortlisting result for job ${job._id}: ` +
            `shortlisted=${shortlistResult.shortlistCount}, ` +
            `rejected=${shortlistResult.rejectedCandidates.length}, ` +
            `totalEligible=${shortlistResult.totalEligible}`,
        );

        if (shortlistResult.shortlistCount === 0) {
          console.log(`[CRON] No candidates shortlisted for job ${job._id}`);
          continue;
        }

        // Schedule interview
        const interview = await scheduleInterview(
          job._id,
          shortlistResult.shortlistedCandidates,
          job,
        );

        if (!interview) {
          console.error(`[CRON] Failed to create interview for job ${job._id}`);
          continue;
        }

        // Update application statuses
        const shortlistedIds = shortlistResult.shortlistedCandidates.map(
          (c) => c.candidateClerkId,
        );
        const rejectedIds = shortlistResult.rejectedCandidates.map(
          (c) => c.candidateClerkId,
        );

        await updateApplicationStatuses(job._id, shortlistedIds, rejectedIds);

        // Update job status
        await jobModel.findByIdAndUpdate(
          job._id,
          {
            status: "interview_scheduled",
            shortlistedCount: shortlistResult.shortlistCount,
          },
          { new: true },
        );

        // Send notifications
        const recruiter = await jobModel
          .findById(job._id)
          .populate("recruiterId", "email fullName companyName")
          .lean();
        if (recruiter?.recruiterId) {
          await sendNotifications(
            job._id,
            job,
            shortlistResult.shortlistedCandidates,
            recruiter.recruiterId,
          );
        }

        console.log(`[CRON] Successfully processed job ${job._id}`);
      } catch (error) {
        console.error(`[CRON] Error processing job ${job._id}:`, error);
        // Continue with next job even if this one fails
      }
    }

    console.log(
      `[CRON] Job shortlisting process completed at ${new Date().toISOString()}`,
    );
  } catch (error) {
    console.error(`[CRON] Fatal error in processJobShortlisting:`, error);
  }
}

/**
 * Initialize cron jobs
 * Runs every hour at minute 0
 * Can be customized with different cron expressions
 */
export function initializeCronJobs() {
  if (cronJobInstance) {
    console.log("[CRON] Cron jobs already initialized");
    return;
  }

  // Schedule to run every hour at minute 0
  // Format: second minute hour day-of-month month day-of-week
  // "0 0 * * * *" = every hour at minute 0
  cronJobInstance = cron.schedule("0 * * * *", processJobShortlisting, {
    runOnInit: false, // Don't run immediately on init
    timezone: "UTC",
  });

  console.log("[CRON] Job shortlisting cron initialized (runs every hour)");

  // Optional: Run on startup (commented out - uncomment if needed)
  // processJobShortlisting();

  return cronJobInstance;
}

/**
 * Stop all cron jobs
 */
export function stopCronJobs() {
  if (cronJobInstance) {
    cronJobInstance.stop();
    cronJobInstance = null;
    console.log("[CRON] Cron jobs stopped");
  }
}

/**
 * Get cron job status
 */
export function getCronStatus() {
  return {
    isRunning: cronJobInstance?.status === "started",
    instance: cronJobInstance ? "initialized" : "not initialized",
  };
}

/**
 * Manually trigger shortlisting for testing
 */
export async function manualTriggerShortlisting() {
  console.log("[MANUAL] Manually triggering shortlisting process");
  return await processJobShortlisting();
}
