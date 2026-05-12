import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import Candidate from "@/models/candidateModel";
import { checkAuth } from "@/utils/checkAuth";

export async function PUT(req) {
  try {
    await connect();
    const body = await req.json();

    const authResult = await checkAuth({
      allowedRoles: ["candidate"],
    });

    if (!authResult.authenticated) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.error === "Forbidden" ? 403 : 401 });
    }
    const userId = authResult.userId;

    // Find existing candidate by _id or clerkId
    let existing = await Candidate.findOne({ clerkId: userId });

    if (!existing) {
      return NextResponse.json({ message: "Candidate not found" }, { status: 404 });
    }

    // Build safe update object
    const updates = {};

    // Root-level fields
    const rootFields = ["dateOfBirth", "appliedJobs", "address", "totalExperienceDuration"];

    rootFields.forEach((field) => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    // calculate total experience duration
    const totalExperienceDuration = body.resume.experience.reduce((acc, exp) => acc + Number(exp.months), 0);
    // Resume updates (deep-safe)
    if (body.resume) {
      updates.resume = {
        resumeUrl: body.resume.resumeUrl ?? existing.resume.resumeUrl,
        atsScore: body.resume.atsScore ?? existing.resume.atsScore,
        skills: body.resume.skills ?? existing.resume.skills,
        socials: body.resume.socials ?? existing.resume.socials,
        education: body.resume.education ?? existing.resume.education,
        certifications: body.resume.certifications ?? existing.resume.certifications,
        experience: body.resume.experience ?? existing.resume.experience,
        projects: body.resume.projects ?? existing.resume.projects,
      };
      updates.totalExperienceDuration = (totalExperienceDuration / 12.0).toFixed(2);
    }

    // Execute update
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
      await Candidate.findOneAndUpdate({ _id: existing._id }, { $set: { isProfileComplete: true } });

      const client = await clerkClient();
      client.users.updateUserMetadata(userId, {
        publicMetadata: {
          hasResume: true,
          isProfileComplete: true,
        },
      });
    }

    return NextResponse.json({ message: "Candidate updated", candidate: updatedCandidate }, { status: 200 });
  } catch (error) {
    console.error("UPDATE_CANDIDATE_ERROR:", error);
    return NextResponse.json({ message: "Failed to update candidate" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connect();

    const { userId, error, authenticated, status } = await checkAuth({
      allowedRoles: ["candidate"],
    });

    if (!authenticated) {
      return NextResponse.json({ message: error }, { status });
    }

    const candidate = await Candidate.findOne({ clerkId: userId });

    if (!candidate) {
      return NextResponse.json({ message: "Candidate not found" }, { status: 404 });
    }

    return NextResponse.json({ candidate }, { status: 200 });
  } catch (error) {
    console.error("CANDIDATE_GET_ERROR:", error);
    return NextResponse.json({ message: "Failed to fetch candidate" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { candidate } = await req.json();
    const authResult = await checkAuth({
      allowedRoles: ["candidate"],
    });

    if (!authResult.authenticated) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.error === "Forbidden" ? 403 : 401 });
    }
    const userId = authResult.userId;

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

    // calculate total experience duration
    const totalExperienceDuration = candidate.resume.experience.reduce((acc, exp) => acc + Number(exp.months) || 0);
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
        projects: candidate.resume.projects ?? [],
      },
      dateOfBirth: candidate.dateOfBirth ?? null,
      appliedJobs: candidate.appliedJobs ?? [],
      totalExperienceDuration: (totalExperienceDuration / 12.0).toFixed(2),
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
      await Candidate.findOneAndUpdate({ _id: existing._id }, { $set: { isProfileComplete: true } });
      const client = await clerkClient();
      client.users.updateUserMetadata(userId, {
        publicMetadata: {
          hasResume: true,
          isProfileComplete: true,
        },
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
