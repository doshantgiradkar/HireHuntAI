import { connect } from "@/lib/db";
import jobModel from "@/models/jobModel";
import recruiterModel from "@/models/recruiterModel";
import { NextResponse } from "next/server";

export async function POST(req) {
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

    const recruiter = await recruiterModel.findOne({ clerkId: recruiterClerkId });

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