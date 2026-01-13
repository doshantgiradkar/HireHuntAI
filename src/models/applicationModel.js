import mongoose from "mongoose";

const eligibility = {
  matchScore: { type: Number },
  isEligible: { type: Boolean },
  reason: { type: String }
};

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      index: true,
    },
    candidateClerkId: {
      type: String,
      required: true,
      index: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
      required: true,
      index: true,
    },
    recruiterClerkId: {
      type: String,
      required: true,
      index: true,
    },
    resumeUrl: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    coverLetter: {
      type: String,
      required: true,
    },
    eligibility: {
      type: eligibility,
      required: true
    },
    skills: {
      type: [String],
      required: true,
    },
    experienceSummary: {
      type: String,
    },
    whyInterested: {
      type: String,
      required: true,
    },
    availabilityDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: [
        "applied",
        "shortlisted",
        "interview_scheduled",
        "rejected",
        "hired",
      ],
      default: "applied",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index(
  { jobId: 1, candidateClerkId: 1 },
  { unique: true }
);

const ApplicationModel =
  mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);

export default ApplicationModel;
