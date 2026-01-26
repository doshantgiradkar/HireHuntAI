import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId, // CRITICAL: Links this answer to a specific question
    required: true
  },
  response: { type: String, required: true },
  score: { type: Number, default: 0 },
  feedback: { type: Number, min: 0, max: 5 },
}, { _id: false }); // No need for an ID for the answer itself

const interviewSessionSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Assessment' // Links back to the question paper
  },
  answers: [answerSchema], // Lightweight: Only stores ID and response
  totalScore: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed'],
    default: 'scheduled'
  }
}, { timestamps: true });

// Ensure a candidate can only take a specific assessment once (optional)
interviewSessionSchema.index({ candidateId: 1, assessmentId: 1 }, { unique: true });

export const Interview = mongoose.model('InterviewSession', interviewSessionSchema);
