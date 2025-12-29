// models/offerLetterModel.js
import mongoose from "mongoose";

const offerLetterSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true, // one offer per application
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },

    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
      required: true,
    },

    offerLetterUrl: {
      type: String,
      required: true,
    },

    compensation: {
      ctc: Number,
      currency: { type: String, default: "INR" },
      breakdown: Object,
    },

    joiningDate: Date,

    status: {
      type: String,
      enum: ["draft", "sent", "accepted", "rejected", "expired"],
      default: "draft",
      index: true,
    },

    sentAt: Date,
    respondedAt: Date,
    expiresAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.OfferLetter ||
  mongoose.model("OfferLetter", offerLetterSchema);
