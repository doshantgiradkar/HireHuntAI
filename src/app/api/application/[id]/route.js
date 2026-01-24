import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connect } from "@/lib/db";
import Application from "@/models/applicationModel";
import { checkAuth } from "@/utils/checkAuth";

export async function GET(req, { params }) {
  try {
    await connect();

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid application id" },
        { status: 400 }
      );
    }

    const applications = await Application.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
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

          // candidate fields
          "candidate.totalExperienceDuration": 1,
          "candidate.resume": 1,

          // user fields
          "user.firstName": 1,
          "user.lastName": 1,
          "user.email": 1,
          "user.imageUrl": 1,
        },
      },
    ]);

    if (!applications.length) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(applications[0], { status: 200 });
  } catch (error) {
    console.error("Get application error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connect();

    const { id } = params;
    const updates = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid application id" },
        { status: 400 }
      );
    }

    const allowedUpdates = ["status", "resumeUrl"];
    const filteredUpdates = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    const application = await Application.findByIdAndUpdate(
      id,
      filteredUpdates,
      { new: true }
    );

    if (!application) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Application updated successfully",
        application,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
   const authResult = await checkAuth({ allowedRoles: ["candidate"] });

  if (!authResult.authenticated) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.error === "Forbidden" ? 403 : 401 },
    );
  }

  const userId = authResult.userId;
  try {
    await connect();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid application id" },
        { status: 400 }
      );
    }

    const application = await Application.findById(id);
    if (!application) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      );
    }
    if(application.candidateClerkId !== userId){
      return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 }
    );

  }
  
  await Application.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Application deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete application error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
