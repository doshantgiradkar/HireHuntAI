import fs from "fs";
import { NextResponse } from "next/server";

import { connect } from "@/lib/db";

import ApplicationModel from "@/models/applicationModel";
import Candidate from "@/models/candidateModel";
import User from "@/models/userModel";
import Job from "@/models/jobModel";
import Recruiter from "@/models/recruiterModel";
import OfferLetter from "@/models/offerLetterModel";

import { generateOfferLetterPDF } from "@/lib/generateOfferPdf";
import { sendOfferLetterEmail } from "@/lib/emailService";
import { uploadOfferLetter } from "@/utils/claudinary";

export async function POST(req) {
  try {
    await connect();

    const { jobId, candidateClerkIds, joiningDate, expiresAt } =
      await req.json();

    if (!jobId || !candidateClerkIds || !Array.isArray(candidateClerkIds)) {
      return NextResponse.json(
        {
          error: "jobId and candidateClerkIds are required",
        },
        {
          status: 400,
        },
      );
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const recruiter = await Recruiter.findById(job.recruiterId);

    if (!recruiter) {
      return NextResponse.json(
        { error: "Recruiter not found" },
        { status: 404 },
      );
    }

    const applications = await ApplicationModel.find({
      jobId,
      candidateClerkId: {
        $in: candidateClerkIds,
      },
    });

    if (!applications.length) {
      return NextResponse.json(
        {
          error: "Applications not found",
        },
        {
          status: 404,
        },
      );
    }

    const results = [];

    for (const application of applications) {
      try {
        const candidate = await Candidate.findById(application.candidateId);

        if (!candidate) continue;

        const user = await User.findOne({
          clerkId: candidate.clerkId,
        });

        if (!user) continue;

        const pdfPath = await generateOfferLetterPDF({
          recruiter,
          candidate,
          user,
          job,
          joiningDate,
          expiresAt,
        });

        const uploadResult = await uploadOfferLetter(pdfPath);

        if (fs.existsSync(pdfPath)) {
          fs.unlinkSync(pdfPath);
        }

        const offerLetter = await OfferLetter.findOneAndUpdate(
          {
            applicationId: application._id,
          },
          {
            applicationId: application._id,
            jobId: job._id,
            candidateId: candidate._id,
            recruiterId: recruiter._id,

            offerLetterUrl: uploadResult.secure_url,

            compensation: {
              ctc: job.salaryRange?.max || job.salaryRange?.min,
              currency: job.salaryRange?.currency || "INR",
            },

            joiningDate,
            expiresAt,

            status: "sent",
            sentAt: new Date(),
          },
          {
            upsert: true,
            new: true,
          },
        );

        await sendOfferLetterEmail({
          candidateEmail: user.email,
          candidateName: `${user.firstName} ${user.lastName}`,
          companyName: recruiter.name,
          jobTitle: job.title,
          offerLetterUrl: uploadResult.secure_url,
          joiningDate,
          expiresAt,
        });

        application.status = "hired";
        await application.save();

        results.push({
          candidate: user.email,
          offerLetterId: offerLetter._id,
          success: true,
        });
      } catch (candidateError) {
        console.error("Offer letter generation failed:", candidateError);

        results.push({
          applicationId: application._id,
          success: false,
          error: candidateError.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error("Generate Offer Letter Error:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
