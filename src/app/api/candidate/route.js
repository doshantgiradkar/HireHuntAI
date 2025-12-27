import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import Candidate from "@/models/candidateModel";

export async function PUT(req) {
  try {
    await connect();

    const { userId } = await auth();
    const body = await req.json();

    // Find existing candidate by _id or clerkId
    let existing = await Candidate.findOne({ clerkId: userId });

    if (!existing) {
      return NextResponse.json(
        { message: "Candidate not found" },
        { status: 404 },
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
      };
    }

    // Execute update
    console.log(existing._id);
    console.log(updates);
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

export async function GET() {
  try {
    await connect();

    const { userId } = await auth();
    console.log(userId);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const candidate = await candidateModel.findOne({ clerkId: userId });

    if (!candidate) {
      return NextResponse.json(
        { message: "Candidate not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ candidate }, { status: 200 });
  } catch (error) {
    console.error("CANDIDATE_GET_ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch candidate" },
      { status: 500 },
    );
  }
}

