import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import Candidate from "@/models/candidateModel";
import mongoose from "mongoose";
import { auth } from "@clerk/nextjs/server";

export async function GET(req, { params }) {
  try {
    await connect();

    const { id } =  await params; // no await here

    let candidate = null;

    // 1️⃣ If MongoDB ObjectId → fetch by _id
    if (mongoose.Types.ObjectId.isValid(id)) {
      candidate = await Candidate.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        {
          $lookup: {
            from: "users",           // users collection
            localField: "clerkId",
            foreignField: "clerkId",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      ]);
      candidate = candidate[0];
    }

    // 2️⃣ Else → treat as Clerk ID
    if (!candidate) {
      candidate = await Candidate.aggregate([
        { $match: { clerkId: id } },
        {
          $lookup: {
            from: "users",
            localField: "clerkId",
            foreignField: "clerkId",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      ]);
      candidate = candidate[0];
    }

    if (!candidate) {
      return NextResponse.json(
        { message: "Candidate not found" },
        { status: 404 }
      );
    }

    // Optional: merge user fields into candidate for easier frontend usage
    if (candidate.user) {
      candidate.fullName = candidate.user.firstName + " " + candidate.user.lastName;
      candidate.email = candidate.user.email;
      candidate.imageUrl = candidate.user.imageUrl;
      delete candidate.user; // remove user object if you just want merged fields
    }

    return NextResponse.json({ candidate }, { status: 200 });
  } catch (error) {
    console.error("GET_CANDIDATE_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch candidate" },
      { status: 500 }
    );
  }
}
export async function PUT(req, { params }) {
  try {
    await connect();

    const { userId } = await auth();
    const { id } =  await params;
    const body = await req.json();

    // Find existing candidate by _id or clerkId
    let existing = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      existing = await Candidate.findById(id);
    }

    if (!existing) {
      existing = await Candidate.findOne({ clerkId: id });
    }

    if (!existing) {
      return NextResponse.json(
        { message: "Candidate not found" },
        { status: 404 },
      );
    }

    // Prevent ownership change
    if (userId && userId !== existing.clerkId) {
      return NextResponse.json(
        { message: "Cannot change candidate owner (clerkId)" },
        { status: 403 },
      );
    }

    // Build safe update object
    const updates = {};

    // Root-level fields
    const rootFields = [
      "dateOfBirth",
      "appliedJobs",
      "totalExperienceDuration",
    ];

    rootFields.forEach((field) => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    // Resume updates (deep-safe)
    if (body.resume) {
      updates.resume = {
        resumeUrl: body.resume.resumeUrl ?? existing.resume.resumeUrl,
        atsScore: body.resume.atsScore ?? existing.resume.atsScore,
        skills: body.resume.skills ?? existing.resume.skills,
        socials: body.resume.socials ?? existing.resume.socials,
        education: body.resume.education ?? existing.resume.education,
        certifications:
          body.resume.certifications ?? existing.resume.certifications,
        experience: body.resume.experience ?? existing.resume.experience,
        projects: body.resume.projects ?? existing.resume.projects,
      };
    }

    // Execute update
    const updatedCandidate = await Candidate.findOneAndUpdate(
      { _id: existing._id },
      { $set: updates },
      { new: true, runValidators: true },
    );

    return NextResponse.json(
      { message: "Candidate updated", candidate: updatedCandidate },
      { status: 200 },
    );
  } catch (error) {
    console.error("UPDATE_CANDIDATE_ERROR:", error);
    return NextResponse.json(
      { message: "Failed to update candidate" },
      { status: 500 },
    );
  }
}
