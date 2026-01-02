import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import recruiterModel from "@/models/recruiterModel";
import { checkAuth } from "@/utils/checkAuth";
import mongoose from "mongoose";
import { deleteLogo, uploadLogo } from "@/utils/claudinary";
import { clerkClient } from "@clerk/nextjs/server";

const parseJSON = (value, fallback = []) => {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
};

export async function GET(req, { params }) {
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

    const { id } = await params;
    console.log(id);
    let recruiter = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      recruiter = await recruiterModel.findById(id);
    }

    if (!recruiter) {
      recruiter = await recruiterModel.findOne({ clerkId: id });
    }

    if (!recruiter) {
      return NextResponse.json(
        { message: "Recruiter not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ recruiter }, { status: 200 });
  } catch (error) {
    console.error("GET_RECRUITER_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch recruiter" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
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
  try {
    await connect();

    const { id } = await params;

    /* ---------- FIND EXISTING RECRUITER ---------- */

    let existing = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      existing = await recruiterModel.findById(id);
    }

    if (!existing) {
      existing = await recruiterModel.findOne({ clerkId: id });
    }

    if (!existing) {
      return NextResponse.json(
        { message: "Recruiter not found" },
        { status: 404 }
      );
    }

    /* ---------- PARSE BODY (JSON OR FORM DATA) ---------- */

    let body = {};
    let logoFile = null;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      formData.forEach((value, key) => {
        if (key === "logo" && value instanceof File) {
          logoFile = value;
        } else {
          body[key] = value;
        }
      });
    } else {
      body = await req.json();
    }

    /* ---------- SECURITY: PREVENT OWNER CHANGE ---------- */

    if (body.clerkId && body.clerkId !== existing.clerkId) {
      return NextResponse.json(
        { message: "Cannot change recruiter owner (clerkId)" },
        { status: 403 }
      );
    }

    /* ---------- HANDLE LOGO UPLOAD ---------- */

    let logoUrl = existing.logo;

    if (logoFile) {
      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public/tmp");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const ext = logoFile.type.split("/")[1];
      const fileName = `logo_${Date.now()}.${ext}`;
      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, buffer);

      try {
        if (existing.logo) {
          await deleteLogo(existing.logo);
        }

        const uploaded = await uploadLogo(filePath);
        logoUrl = uploaded.secure_url;
      } finally {
        fs.rmSync(filePath, { force: true });
      }
    }

    /* ---------- BUILD UPDATE PAYLOAD ---------- */

    const updates = {};

    const allowedFields = [
      "name",
      "industry",
      "size",
      "status",
      "overview",
      "website",
      "headquarters",
      "founded",
      "companyType",
      "primaryRoles",
      "contactEmail",
      "contactPhone",
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        if (field === "primaryRoles") {
          updates.primaryRoles = parseJSON(body.primaryRoles);
        } else {
          updates[field] = body[field];
        }
      }
    });

    if (logoUrl) {
      updates.logo = logoUrl;
    }

    if (body.admin) {
      const parsedAdmin =
        typeof body.admin === "string" ? JSON.parse(body.admin) : body.admin;

      updates.admin = {
        avatar: parsedAdmin.avatar ?? existing.admin.avatar,
        name: parsedAdmin.name ?? existing.admin.name,
        role: parsedAdmin.role ?? existing.admin.role,
        email: parsedAdmin.email ?? existing.admin.email,
        phone: parsedAdmin.phone ?? existing.admin.phone,
      };
    }

    /* ---------- UPDATE DB ---------- */

    const updated = await recruiterModel.findByIdAndUpdate(
      existing._id,
      { $set: updates },
      { new: true, runValidators: true }
    );
  
    const client = await clerkClient();
    client.users.updateUserMetadata(clerkId, {
      publicMetadata: {
        isProfileComplete: true,
      },
    });

    return NextResponse.json(
      {
        message: "Recruiter updated successfully",
        recruiter: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE_RECRUITER_ERROR:", error);
    return NextResponse.json(
      { message: "Failed to update recruiter" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const authResult = await checkAuth({ allowedRoles: ["recruiter"] });
  if (!authResult.authenticated) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.error === "Forbidden" ? 403 : 401 }
    );
  }
  try {
    await connect();

    const { id } = await params;

    let query = {};

    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { clerkId: id };
    }

    const deletedRecruiter = await recruiterModel.findOneAndDelete(query);

    if (!deletedRecruiter) {
      return NextResponse.json(
        { message: "Recruiter not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Recruiter deleted successfully",
        recruiter: deletedRecruiter,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE_RECRUITER_ERROR:", error);
    return NextResponse.json(
      { message: "Failed to delete recruiter" },
      { status: 500 }
    );
  }
}
