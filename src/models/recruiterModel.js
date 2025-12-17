import mongoose from "mongoose";

const recruiterSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    logo: String,
    name: { type: String, required: true },
    industry: { type: String, required: true },
    size: { type: String, required: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    overview: { type: String, required: true },
    website: { type: String, required: true },
    headquarters: { type: String, required: true },
    founded: { type: String, required: true },
    companyType: { type: String, required: true },
    primaryRoles: [String],
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },

    admin: {
      avatar: String,
      name: { type: String, required: true },
      role: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Recruiter ||
  mongoose.model("Recruiter", recruiterSchema);
