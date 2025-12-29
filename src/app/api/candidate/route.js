import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
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

    if (
      existing.resume.resumeUrl &&
      existing.resume.atsScore &&
      existing.resume.skills &&
      existing.resume.socials &&
      existing.resume.education &&
      existing.resume.certifications &&
      existing.resume.experience &&
      existing.dateOfBirth
    ) {
      await Candidate.findOneAndUpdate(
        { _id: existing._id },
        { $set: { isProfileComplete: true } },
      );
      const client = await clerkClient();
      await client.users.updateUser(userId, {
        isProfileComplete: true,
      });
    }

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

export async function POST(req) {
  try {
    const { candidate } = await req.json();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate data with resume is required" },
        { status: 400 },
      );
    }

    await connect();

    // Check if candidate already exists
    const existingCandidate = await Candidate.findOne({ clerkId: userId });

    if (existingCandidate) {
      return NextResponse.json(
        {
          success: true,
          message: "Candidate already exists",
          candidate: existingCandidate,
        },
        { status: 409 },
      );
    }

    // Create new candidate
    const newCandidate = new Candidate({
      clerkId: userId,
      resume: {
        resumeUrl: candidate.resume.resumeUrl,
        atsScore: candidate.resume.atsScore ?? 0,
        skills: candidate.resume.skills ?? [],
        socials: candidate.resume.socials ?? [],
        education: candidate.resume.education ?? [],
        certifications: candidate.resume.certifications ?? [],
        experience: candidate.resume.experience ?? [],
      },
      dateOfBirth: candidate.dateOfBirth ?? null,
      appliedJobs: candidate.appliedJobs ?? [],
      totalExperienceDuration: candidate.totalExperienceDuration ?? 0,
    });

    await newCandidate.save();

    if (
      candidate.resume.resumeUrl &&
      candidate.resume.atsScore &&
      candidate.resume.skills &&
      candidate.resume.socials &&
      candidate.resume.education &&
      candidate.dateOfBirth
    ) {
      await Candidate.findOneAndUpdate(
        { _id: existing._id },
        { $set: { isProfileComplete: true } },
      );
      const client = await clerkClient();
      await client.users.updateUser(userId, {
        isProfileComplete: true,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Candidate created successfully",
        candidate: newCandidate,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("CREATE_CANDIDATE_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
