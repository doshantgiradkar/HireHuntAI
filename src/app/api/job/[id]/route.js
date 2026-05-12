import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connect } from "@/lib/db";
import jobModel from "@/models/jobModel";
import { checkAuth } from "@/utils/checkAuth";
import calculateMatchScore from "@/lib/matchJobs";
import ApplicationModel from "@/models/applicationModel";

export async function GET(req, { params }) {
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

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid job id" }, { status: 400 });
    }

    const job = await jobModel.findById(id);

    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    // Recruiters don't have candidate profiles, so skip match score and application lookup
    if (authResult.role === "recruiter") {
      return NextResponse.json({ job: job.toObject() }, { status: 200 });
    }

    const application = await ApplicationModel.findOne({
      jobId: id,
      candidateClerkId: authResult.userId,
    }).select(["status", "applicationId"]);

    let hasApplied = false;
    let applicationStatus = 'open';

    if (application) {
      hasApplied = true;
      applicationStatus = application.status;
    } else {
      hasApplied = false;
      applicationStatus = 'open';
    }

    const matchScore = await calculateMatchScore(authResult.userId, job._id);
    const jobWithScore = {
      ...job.toObject(),
      applicationId: application?._id,
      matchScore,
      hasApplied,
      applicationStatus,
    };

    return NextResponse.json({ job: jobWithScore }, { status: 200 });
  } catch (error) {
    console.error("JOB_GET_ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch job" },
      { status: 500 },
    );
  }
}

export async function PUT(req, { params }) {
  const authResult = await checkAuth({ allowedRoles: ["recruiter"] });
  if (!authResult.authenticated) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.error === "Forbidden" ? 403 : 401 },
    );
  }
  try {
    await connect();

    const { id } = await params;
    const body = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid job id" }, { status: 400 });
    }

    const updatedJob = await jobModel.findByIdAndUpdate(
      id,
      { $set: body },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedJob) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Job updated successfully", job: updatedJob },
      { status: 200 },
    );
  } catch (error) {
    console.error("JOB_PUT_ERROR:", error);
    return NextResponse.json(
      { message: "Failed to update job" },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  const authResult = await checkAuth({ allowedRoles: ["recruiter"] });
  if (!authResult.authenticated) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.error === "Forbidden" ? 403 : 401 },
    );
  }

  try {
    await connect();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid job id" }, { status: 400 });
    }
    const deletedJob = await jobModel.findByIdAndDelete(id);
    if (!deletedJob) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Job deleted successfully", job: deletedJob },
      { status: 200 },
    );
  } catch (error) {
    console.error("JOB_DELETE_ERROR:", error);
    return NextResponse.json(
      { message: "Failed to delete job" },
      { status: 500 },
    );
  }
}
