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
          from: "candidates",
          localField: "candidateClerkId",
          foreignField: "clerkId",
          as: "candidate",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "candidateClerkId",
          foreignField: "clerkId",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$candidate",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          jobId: 1,
          candidateId: 1,
          candidateClerkId: 1,
          recruiterId: 1,
          recruiterClerkId: 1,
          resumeUrl: 1,
          fullName: 1,
          email: 1,
          phone: 1,
          coverLetter: 1,
          eligibility: 1,
          skills: 1,
          experienceSummary: 1,
          whyInterested: 1,
          availabilityDate: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,

        
          "candidate.totalExperienceDuration": 1,
          "candidate.resume": 1,

          
          "user.firstName": 1,
          "user.lastName": 1,
          "user.email": 1,
          "user.imageUrl": 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
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
