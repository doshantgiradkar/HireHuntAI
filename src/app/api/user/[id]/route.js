import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import userModel from "@/models/userModel";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await connect();

    const id = (await params).id;

    let user = null;
    // 1️⃣ If MongoDB ObjectId → fetch by _id
    if (mongoose.Types.ObjectId.isValid(id)) {
      user = await userModel.findById(id);
    }

    // 2️⃣ Else → treat as Clerk ID
    if (!user) {
      user = await userModel.findOne({ clerkId: id });
    }

    console.log(id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("GET_USER_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connect();

    const {id} = await params;
    const body = await req.json();

    // find existing user by id or clerkId
    let existing = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      existing = await userModel.findById(id);
    }
    if (!existing) {
      existing = await userModel.findOne({ clerkId: id });
    }

    if (!existing) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Prevent changing ownership: clerkId in payload must match existing clerkId (if provided)
    const payloadClerkId = body.clerkId || body?.admin?.clerkId || null;
    if (payloadClerkId && payloadClerkId !== existing.clerkId) {
      return NextResponse.json(
        { message: "Cannot change user owner (clerkId)" },
        { status: 403 },
      );
    }

    // prepare update object (only allow known fields)
    const updates = {};
    const allowedFields = [
      "logo",
      "firstName",
      "lastName",
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
    allowedFields.forEach((f) => {
      if (body[f] !== undefined) updates[f] = body[f];
    });

    // admin updates
    if (body.admin) {
      updates.admin = {
        avatar: body.admin.avatar ?? existing.admin.avatar,
        firstName: body.admin.firstName ?? existing.admin.firstName,
        lastName: body.admin.lastName ?? existing.admin.lastName,
        role: body.admin.role ?? existing.admin.role,
        email: body.admin.email ?? existing.admin.email,
        phone: body.admin.phone ?? existing.admin.phone,
        clerkId: existing.clerkId, // keep owner
      };
    }

    const updated = await userModel.findOneAndUpdate(
      { _id: existing._id },
      { $set: updates },
      { new: true, runValidators: true },
    );

    return NextResponse.json(
      { message: "User updated", user: updated },
      { status: 200 },
    );
  } catch (error) {
    console.error("UPDATE_USER_ERROR:", error);
    return NextResponse.json(
      { message: "Failed to update user" },
      { status: 500 },
    );
  }
}
