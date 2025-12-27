import { connect } from "@/lib/db";
import jobModel from "@/models/jobModel";
import recruiterModel from "@/models/recruiterModel";
import { checkAuth } from "@/utils/checkAuth";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  const authResult = await checkAuth({
    allowedRoles: ["recruiter"],
  });

  if (!authResult.authenticated) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.error === "Forbidden" ? 403 : 401 }
    );
  }

  try {
    await connect();

    const body = await req.json();
    const {
      recruiterClerkId,
      title,
      description,
      location,
      workMode,
      employmentType,
    } = body;

    if (
      !recruiterClerkId ||
      !title ||
      !description ||
      !location ||
      !workMode ||
      !employmentType
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    const recruiter = await recruiterModel.findOne({
      clerkId: recruiterClerkId,
    });

    if (!recruiter) {
      return NextResponse.json(
        { message: "Recruiter not found" },
        { status: 404 }
      );
    }

    const job = await jobModel.create({
      ...body,
      recruiterId: recruiter._id,
      recruiterClerkId: recruiter.clerkId,
      companyName: recruiter.name,
      companyLogo: recruiter.logo,
      status: body.status || "Draft",
      postedAt: body.status === "Open" ? new Date() : null,
    });

    return NextResponse.json(
      { message: "Job created successfully", job },
      { status: 201 }
    );
  } catch (error) {
    console.error("JOB_POST_ERROR:", error);
    return NextResponse.json(
      { message: "Failed to create job" },
      { status: 500 }
    );
  }
}

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

    const jobs = await jobModel
      .find({})
      .sort({ createdAt: -1 }); 

    return NextResponse.json(
      { jobs, count: jobs.length },
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