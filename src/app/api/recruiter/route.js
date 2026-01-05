export const runtime = "nodejs";

import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import recruiterModel from "@/models/recruiterModel";
import { uploadLogo } from "@/utils/claudinary";
import { checkAuth } from "@/utils/checkAuth";
import { clerkClient } from "@clerk/nextjs/server";

/* ================= POST ================= */

export async function POST(req) {
  let filePath = "";

  try {
    const authResult = await checkAuth({
      allowedRoles: ["recruiter"],
    });

    if (!authResult.authenticated) {
      return NextResponse.json(
        { message: authResult.error },
        { status: authResult.error === "Forbidden" ? 403 : 401 }
      );
    }

    const clerkId = authResult.userId;
    await connect();

    const formData = await req.formData();
    const recruiterData = {};

    for (const [key, value] of formData.entries()) {
      if (key === "logo") continue;

      if (key === "primaryRoles") {
        recruiterData.primaryRoles = JSON.parse(value);
      } else if (key === "admin") {
        recruiterData.admin = JSON.parse(value);
      } else if (key === "address") {
        recruiterData.address = JSON.parse(value);
      } else {
        recruiterData[key] = value;
      }
    }

    recruiterData.clerkId = clerkId;

    /* ---------- LOGO UPLOAD ---------- */
    const logo = formData.get("logo");

    if (logo && typeof logo === "object") {
      const bytes = await logo.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public/tmp");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const ext = logo.type.match(/\/(png|jpg|jpeg)/i)?.[1];
      if (!ext) {
        return NextResponse.json(
          { message: "Invalid file type" },
          { status: 400 }
        );
      }

      const fileName = `${Date.now()}.${ext}`;
      filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, buffer);

      const uploadResult = await uploadLogo(filePath);
      recruiterData.logo = uploadResult.secure_url;

      fs.unlinkSync(filePath);
    }

    Object.keys(recruiterData).forEach((key) => {
      if (recruiterData[key] === "") {
        delete recruiterData[key];
      }
    });

    const recruiter = await recruiterModel.findOneAndUpdate(
      { clerkId },
      { $set: recruiterData },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );
    const client = await clerkClient();
    await client.users.updateUserMetadata(clerkId, {
      publicMetadata: {
        hasResume: true,
        isProfileComplete: true,
      },
    });

    return NextResponse.json(
      { message: "Recruiter saved", recruiter },
      { status: 201 }
    );
  } catch (error) {
    console.error("RECRUITER_POST_ERROR:", error);

    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ================= GET ================= */

export async function GET() {
  const authResult = await checkAuth({
    allowedRoles: ["recruiter", "candidate"],
  });

  if (!authResult.authenticated) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.error === "Forbidden" ? 403 : 401 }
    );
  }

  try {
    await connect();
    const recruiters = await recruiterModel.find({});
    return NextResponse.json(
      { recruiters, count: recruiters.length },
      { status: 200 }
    );
  } catch (error) {
    console.error("RECRUITER_GET_ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch recruiters" },
      { status: 500 }
    );
  }
}
