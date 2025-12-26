import mongoose from "mongoose";

const recruiterSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
  
      unique: true,
      index: true,
    },

    logo: String,
    name: { type: String  },
    industry: { type: String  },
    size: { type: String  },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    overview: { type: String  },
    website: { type: String  },
    headquarters: { type: String  },
    founded: { type: String  },
    companyType: { type: String  },
    primaryRoles: [String],
    contactEmail: { type: String  },
    contactPhone: { type: String  },

    admin: {
      avatar: String,
      name: { type: String  },
      role: { type: String  },
      email: { type: String  },
      phone: { type: String  },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Recruiter ||
  mongoose.model("Recruiter", recruiterSchema);
