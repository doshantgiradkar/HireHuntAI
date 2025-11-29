import mongoose, { SchemaTypes } from "mongoose";

const userSchema = new mongoose.Schema({
    clerk_id: { type: String, required: true },
    first_name: { type: String, required: [true, "Please add first name"] },
    last_name: { type: String, required: [true, "Please add last name"] },
    email: { type: String, required: [true, "Please enter email ID"], lowercase: true, unique: true },
    image_url: { type: String, required: false },
    role: { type: String, enum: ['recruiter', 'candidate'], required: false },
}, { timestamps: true });

export default User = mongoose.model("User", userSchema);
