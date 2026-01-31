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

export const Assessment = mongoose.model('Assessment', assessmentSchema);
