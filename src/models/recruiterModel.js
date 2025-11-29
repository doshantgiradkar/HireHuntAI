import mongoose, { SchemaTypes } from "mongoose";

const recruiterSchema = new mongoose.Schema({
    user_id: { type: SchemaTypes.ObjectId },
    posted_job: [{ type: SchemaTypes.ObjectId }],
});

export default Candidate = new mongoose.models("Candidate", candidateSchema);
