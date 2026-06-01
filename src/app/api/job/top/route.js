import { connect } from "@/lib/db";
import { calculateMatchScoreByJobs } from "@/lib/matchJobs";
import ApplicationModel from "@/models/applicationModel";
import jobModel from "@/models/jobModel";
import { checkAuth } from "@/utils/checkAuth";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  const authResult = await checkAuth({
    allowedRoles: ["candidate"],
  });
  if (!authResult.authenticated) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.error === "Forbidden" ? 403 : 401 },
    );
  }

  try {
    await connect();
    const count = 3;

    // Get paginated jobs
    const allJobs = await jobModel.find();

    // Score all jobs for the current user and sort by descending match score
    const scoredJobs = await Promise.all(
      allJobs.map(async (job) => {
        const score = await calculateMatchScoreByJobs(userId, job);
        return { job, score };
      }),
    );

    const jobs = scoredJobs.slice(0, count);

    const jobsWithScore = (
      await Promise.all(
        jobs.map(async ({ job, score }) => {
          const application = await ApplicationModel.findOne({
            jobId: job._id,
            candidateClerkId: userId,
          }).select(["status", "applicationId"]);
          var hasApplied = false;
          if (application) {
            hasApplied = true;
          }
          return {
            ...job.toObject(),
            matchScore: score,
            hasApplied,
          };
        }),
      )
    ).sort(
      (a, b) => (b.matchScore.matchScore ?? 0) - (a.matchScore.matchScore ?? 0),
    );

    return NextResponse.json({ jobs: jobsWithScore, count }, { status: 200 });
  } catch (error) {
    console.error("JOB_GET_ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch jobs" },
      { status: 500 },
    );
  }
}
