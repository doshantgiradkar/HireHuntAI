import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
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

    companyName: {
      type: String,
      required: true,
    },

    companyLogo: String,

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    workMode: {
      type: String,
      enum: ["Onsite", "Remote", "Hybrid"],
      required: true,
    },

    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      required: true,
    },

    experienceLevel: {
      type: String,
      enum: ["Fresher", "Mid", "Senior", "Lead"],
    },

    experienceYear: {
      type: Number,
      required : true,
    },

    salaryRange: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: "INR",
      },
    },

    skills: {
      type: [String],
      index: true,
    },

    openings: {
      type: Number,
      default: 1,
    },

    applicationDeadline: Date,

    interviewProcess: String,

    status: {
      type: String,
      enum: ["Draft", "Open", "Paused", "Closed"],
      default: "Draft",
      index: true,
    },

    visibility: {
      type: String,
      enum: ["Public", "Private", "Internal"],
      default: "Public",
    },

    viewsCount: {
      type: Number,
      default: 0,
    },

    applicationsCount: {
      type: Number,
      default: 0,
    },

    shortlistedCount: {
      type: Number,
      default: 0,
    },

    hiredCount: {
      type: Number,
      default: 0,
    },

    postedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Job || mongoose.model("Job", jobSchema);
