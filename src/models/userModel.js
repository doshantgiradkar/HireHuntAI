import mongoose, { SchemaTypes } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true },
    firstName: { type: String, required: [true, "Please add first name"] },
    lastName: { type: String, required: [true, "Please add last name"] },
    email: {
      type: String,
      required: [true, "Please enter email ID"],
      lowercase: true,
      unique: true,
    },
    imageUrl: { type: String, required: false },
    role: { type: String, enum: ["recruiter", "candidate"], required: false },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
