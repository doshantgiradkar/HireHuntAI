import mongoose from "mongoose";

const SkillSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true, 
      trim: true,
      lowercase: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    aliases: {
      type: [String],
      default: [],
      trim: true,
    },
  }
);

// Prevent model overwrite upon hot reload in Next.js
export default mongoose.models.Skill || mongoose.model("Skill", SkillSchema);
