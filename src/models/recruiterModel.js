import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  line: {type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pinCode: { type: String, required: true },
  country: { type: String, require: true, default: "India" }
})

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
    address: { type: addressSchema },
    founded: { type: String  },
     companyType: {
      type: String,
      enum: [
        "Startup",
        "Scale-up",
        "Enterprise",
        "Agency",
        "Consulting",
        "Non-profit",
        "Government",
      ],
    },
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
