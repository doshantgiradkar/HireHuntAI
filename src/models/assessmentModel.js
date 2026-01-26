import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  modelAnswer: { type: String, required: true },
  score: { type: Number, default: 10 }
});

const assessmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [questionSchema],
}, { timestamps: true });

// FIX: Check if the model exists first. If yes, use it. If no, create it.
export const Assessment = mongoose.models.Assessment || mongoose.model('Assessment', assessmentSchema);
