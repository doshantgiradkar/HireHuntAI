import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
    job_title: { type: String, required: true },
    job_desc: { type: String, required: true }
});

const educationSchema = new mongoose.Schema({
    edu_type: { type: String, enum: ['SSC', 'HSC', 'UG', 'PG', 'Diploma'], required: true },
    institute_name: { type: String, required: true },
    course: { type: String, required: true },
    score: { type: Number, required: true },
    year_of_comp: { type: Number, required: true }
});

const socialSchema = new mongoose.Schema({
    name: { type: String, enum: ['leetcode', 'linkedin', 'github', 'others'], required: true },
    url: { type: String, required: true },
});

const certificateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    provider: { type: String, required: true },
    url: { type: String },
    year_of_comp: { type: Number }
});

const resumeSchema = new mongoose.Schema({
    resume_url: { type: String, required: true },
    socials: [socialSchema],
    education: [educationSchema],
    certifications: [certificateSchema],
    experience: [experienceSchema],
    ats_score: { type: Number },
    skills: { type: String },
});

const candidateSchema = new mongoose.Schema({
    user_id: { type: SchemaTypes.ObjectId },
    resume: { resumeSchema },
    date_of_birth: { type: Date },
    mobile_no: { type: Number, match: /^\d{10}$/ },
    ats_score: { type: Number },
    applied_jobs: [{ type: SchemaTypes.ObjectId }],
    total_experience_duration: { type: Number },
    skills: [{ type: String }]
});

export default Candidate = new mongoose.models("Candidate", candidateSchema);
