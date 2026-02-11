import mongoose from "mongoose";

// Single Answer Schema
const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  response: { type: String, required: true },
  score: { type: Number, default: 0 },
}, { _id: false });

const transcriptMessageSchema = new mongoose.Schema({
  clientId: { type: String },
  speaker: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: String },
  isAI: { type: Boolean, default: false },
}, { _id: false });

// Single Candidate Schema
// This represents ONE candidate inside the session
const candidateSubSchema = new mongoose.Schema({
  candidateId: {
    type: String,
    required: true,
    ref: 'Candidate'
  },
  matchScore: { type: Number, default: 0 },
  feedback: { type: Number, min: 0, max: 5 },
  answers: [answerSchema],
  // TODO: add interviewScore to schema if you intend to persist it.
  transcript: { type: [transcriptMessageSchema], default: [] }
}, { _id: false });

const interviewSessionSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: 'Job',
  },
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Assessment'
  },
  // The Array of Candidates
  candidates: {
    type: [candidateSubSchema],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed'],
    default: 'scheduled'
  },
  startAt: {
    type: Date,
    required: true // Removed default Date.now
  },
  endAt: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true
  }
}, { timestamps: true });

export const Interview = mongoose.models.Interview || mongoose.model('Interview', interviewSessionSchema);
