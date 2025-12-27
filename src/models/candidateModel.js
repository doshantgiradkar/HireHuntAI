import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema({
    jobTitle: { type: String, required: true },
    jobDesc: { type: String },
});

const educationSchema = new mongoose.Schema({
    eduType: {
        type: String,
        enum: ["SSC", "HSC", "UG", "PG", "Diploma"],
        required: true,
    },
    instituteName: { type: String, required: true },
    course: { type: String, required: true },
    score: { type: Number, required: true },
    isCGPA: { type: Boolean, required: true },
    yearOfComp: { type: Number, required: true },
});

const socialSchema = new mongoose.Schema({
    name: {
        type: String,
        enum: ["leetcode", "linkedin", "github", "others"],
        required: true,
    },
    url: { type: String, required: false },
});

const certificateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    provider: { type: String, required: true },
    url: { type: String },
    yearOfComp: { type: Number },
});

const resumeSchema = new mongoose.Schema({
    resumeUrl: { type: String, required: true },
    socials: [socialSchema],
    education: [educationSchema],
    certifications: [certificateSchema],
    experience: [experienceSchema],
    atsScore: { type: Number },
    skills: [{ type: String }],
});

const addressSchema = new mongoose.Schema({
  line: {type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pinCode: { type: String, required: true },
  country: { type: String, require: true, default: "India" }
})

export const candidateSchema = new mongoose.Schema({
    clerkId: { type: String, unique: true },
    resume: { type: resumeSchema, required: true },
    address: { type: addressSchema },
    dateOfBirth: { type: Date },
    appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, default: null }],
    totalExperienceDuration: { type: Number },
});

const Candidate =
    mongoose.models.Candidate || mongoose.model("Candidate", candidateSchema);

export default Candidate;
