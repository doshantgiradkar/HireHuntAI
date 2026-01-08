import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import mongoose from "mongoose";
import ApplicationModel from "@/models/applicationModel";

export async function GET(req, { params }) {
  try {
    await connect();

    const { jobId } = await params;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return NextResponse.json(
        { success: false, message: "Invalid Job ID" },
        { status: 400 }
      );
    }

    const applications = await ApplicationModel.aggregate([
      {
        $match: {
          jobId: new mongoose.Types.ObjectId(jobId),
        },
      },
      {
        $lookup: {
          from: "candidates",          // collection name
          localField: "candidateClerkId",
          foreignField: "clerkId",  
          as: "candidate",
        },
      },
      {
        $lookup: {
          from: "users",               // collection name
          localField: "candidateClerkId",
          foreignField: "clerkId",     // MUST match User schema field
          as: "user",
        },
      },
      { $unwind: "$candidate" },
      { $unwind: "$user" },
      {
        $project: {
          status: 1,
          resumeUrl: 1,
          createdAt: 1,

          // Candidate model fields
          "candidate.resume.experience": 1,
          "candidate.resume.skills": 1,

          // User model fields
          "user.firstName": 1,
          "user.lastName": 1,
          "user.email": 1,
          "user.imageUrl": 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return NextResponse.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("GET CANDIDATES BY JOB ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch candidates" },
      { status: 500 }
    );
  }
}
