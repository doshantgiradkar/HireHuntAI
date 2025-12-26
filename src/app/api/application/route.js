import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connect } from "@/lib/db";
import Application from "@/models/applicationModel";

export async function POST(req) {
  try {
    await connect();

    const {
      jobId,
      recruiterId,
      recruiterClerkId,
      candidateClerkId,
      candidateId,
      resumeUrl,
    } = await req.json();

    // 🧪 Basic validation
    if (
      !jobId ||
      !recruiterId ||
      !recruiterClerkId ||
      !candidateClerkId ||
      !candidateId||
      !resumeUrl
    ) {
      return NextResponse.json(
        {
          message:
            "jobId, recruiterId, recruiterClerkId, candidateClerkId, resumeUrl are required",
        },
        { status: 400 }
      );
    }

    // Validate Mongo IDs
    if (
      !mongoose.Types.ObjectId.isValid(jobId) ||
      !mongoose.Types.ObjectId.isValid(recruiterId)
    ) {
      return NextResponse.json(
        { message: "Invalid MongoDB ObjectId" },
        { status: 400 }
      );
    }

    const application = await Application.create({
      jobId,
      recruiterId,
      recruiterClerkId,
      candidateClerkId,
      candidateId,
      resumeUrl,
    });

    return NextResponse.json(
      {
        message: "Job applied successfully (TEST MODE)",
        application,
      },
      { status: 201 }
    );
  } catch (error) {
    // Duplicate application
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "You have already applied for this job" },
        { status: 409 }
      );
    }

    console.error("Apply job test error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
