import { connect } from "@/lib/db";
import calculateMatchScore from "@/lib/matchJobs";
import jobModel from "@/models/jobModel";
import { checkAuth } from "@/utils/checkAuth";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth()
  const authResult = await checkAuth({
    allowedRoles: ["recruiter", "candidate"],
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

    // todo: implement this

    // Get paginated jobs
    const jobs = await jobModel.find().limit(count);
    const jobsWithScore = await Promise.all(
      jobs.map(async (job) => {
        const matchScore = await calculateMatchScore(userId, job._id);

        return {
          ...job.toObject(),
          matchScore,
        };
      })
    );

    return NextResponse.json({ jobsWithScore, count }, { status: 200 });
  } catch (error) {
    console.error("JOB_GET_ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch jobs" },
      { status: 500 },
    );
  }
}
