// models/offerLetterModel.js
import mongoose from "mongoose";

const signatureSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["RECRUITER", "CANDIDATE", "HR", "LEGAL"],
      required: true,
    },

    signerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    signature: {
      type: String, // base64 encoded digital signature
      required: true,
    },

    signedHash: {
      type: String, // hash that was signed (important for verification)
      required: true,
    },

    algorithm: {
      type: String,
      default: "RSA-SHA256",
    },

    signedAt: {
      type: Date,
      default: Date.now,
    },

    ipAddress: String,
    userAgent: String,

    publicKeyId: String,

    revoked: {
      type: Boolean,
      default: false,
    },

    revokedAt: Date,
  },
  { _id: false }
);

const offerLetterSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true,
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

    documentHash: {
      type: String,
      required: true,
      index: true,
    },

    version: {
      type: Number,
      default: 1,
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

    signatures: [signatureSchema],

    sentAt: Date,
    respondedAt: Date,
    expiresAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.OfferLetter ||
  mongoose.model("OfferLetter", offerLetterSchema);