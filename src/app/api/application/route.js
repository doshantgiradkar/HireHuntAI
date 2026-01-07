import { NextResponse } from "next/server";
import mongoose, { model } from "mongoose";

import { connect } from "@/lib/db";
import Application from "@/models/applicationModel";
import jobModel from "@/models/jobModel";

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
      fullName,
      email,
      phone,
      coverLetter,
      skills,
      experienceSummary,
      whyInterested,
      availabilityDate,
    } = await req.json();

    // 🧪 Basic validation
    if (
      !jobId ||
      !recruiterId ||
      !recruiterClerkId ||
      !candidateClerkId ||
      !candidateId ||
      !resumeUrl ||
      !fullName ||
      !email ||
      !phone ||
      !coverLetter ||
      !skills ||
      !Array.isArray(skills) ||
      skills.length === 0 ||
      !whyInterested
    ) {
      return NextResponse.json(
        {
          message:
            "jobId, recruiterId, recruiterClerkId, candidateClerkId, candidateId, resumeUrl, fullName, email, phone, coverLetter, skills, and whyInterested are required",
        },
        { status: 400 },
      );
    }

    // Validate Mongo IDs
    if (
      !mongoose.Types.ObjectId.isValid(jobId) ||
      !mongoose.Types.ObjectId.isValid(recruiterId) ||
      !mongoose.Types.ObjectId.isValid(candidateId)
    ) {
      return NextResponse.json(
        { message: "Invalid MongoDB ObjectId" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 },
      );
    }

    // Validate phone format (basic validation)
    if (phone.trim().length < 10) {
      return NextResponse.json(
        { message: "Invalid phone number" },
        { status: 400 },
      );
    }

    // Create application object
    const applicationData = {
      jobId,
      recruiterId,
      recruiterClerkId,
      candidateClerkId,
      candidateId,
      resumeUrl,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      coverLetter: coverLetter.trim(),
      skills: skills.map((skill) => skill.trim()),
      whyInterested: whyInterested.trim(),
    };

    // Add optional fields if provided
    if (experienceSummary && experienceSummary.trim()) {
      applicationData.experienceSummary = experienceSummary.trim();
    }

    if (availabilityDate) {
      applicationData.availabilityDate = new Date(availabilityDate);
    }

    const application = await Application.create(applicationData);

    return NextResponse.json(
      {
        message: "Application submitted successfully",
        application,
      },
      { status: 201 },
    );
  } catch (error) {
    // Duplicate application
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "You have already applied for this job" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
}

export async function GET(req) {
  try {
    await connect();
    const applications = await Application.find()
      .populate({
        path: 'jobId',
        model: jobModel,
        select: 'title companyName location salaryRange workMode employmentType'
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ applications }, { status: 200 });
  } catch (error) {
    console.error("APPLICATION_GET_ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
