import { connect } from "@/lib/db";
import jobModel from "@/models/jobModel";
import { checkAuth } from "@/utils/checkAuth";
import { NextResponse } from "next/server";

export async function GET() {
  const authResult = await checkAuth({
    allowedRoles: ["recruiter", "candidate"],
  });
  if (!authResult.authenticated) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.error === "Forbidden" ? 403 : 401 }
    );
  }

  try {
    await connect();
    const count = 3;

    // todo: implement this shit


    // Get paginated jobs
    const jobs = await jobModel
      .find()
      .limit(count);

    return NextResponse.json(
      { jobs, count },
      { status: 200 }
    );
  } catch (error) {
    console.error("JOB_GET_ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
