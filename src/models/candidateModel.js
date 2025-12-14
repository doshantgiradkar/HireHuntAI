import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
    jobTitle: { type: String, required: true },
    jobDesc: { type: String, required: true }
});

const educationSchema = new mongoose.Schema({
    eduType: { type: String, enum: ['SSC', 'HSC', 'UG', 'PG', 'Diploma'], required: true },
    instituteName: { type: String, required: true },
    course: { type: String, required: true },
    score: { type: Number, required: true },
    isCGPA: { type: Boolean, required: true },
    yearOfComp: { type: Number, required: true }
});

const socialSchema = new mongoose.Schema({
    name: { type: String, enum: ['leetcode', 'linkedin', 'github', 'others'], required: true },
    url: { type: String, required: true },
});

const certificateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    provider: { type: String, required: true },
    url: { type: String },
    yearOfComp: { type: Number }
});

const resumeSchema = new mongoose.Schema({
    resumeUrl: { type: String, required: true },
    socials: [socialSchema],
    education: [educationSchema],
    certifications: [certificateSchema],
    experience: [experienceSchema],
    atsScore: { type: Number },
    skills: { type: String },
});

const candidateSchema = new mongoose.Schema({
    userId: { type: SchemaTypes.ObjectId },
    description: { type: string, required: true },
    resume: { resumeSchema },
    dateOfBirth: { type: Date },
    mobileNo: { type: Number, match: /^\d{10}$/ },
    atsScore: { type: Number },
    appliedJobs: [{ type: SchemaTypes.ObjectId }],
    totalExperienceDuration: { type: Number },
    skills: [{ type: String }]
});

export default Candidate = new mongoose.models("Candidate", candidateSchema);
