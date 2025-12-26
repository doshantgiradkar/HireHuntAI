import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import userModel from "@/models/userModel";
import mongoose from "mongoose";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    await connect();

    const { userId } = await auth();

    let user = null;

    // 1️⃣ If MongoDB ObjectId → fetch by _id
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await userModel.findById(userId);
    }

    // 2️⃣ Else → treat as Clerk ID
    if (!user) {
      user = await userModel.findOne({ clerkId: userId });
    }

    console.log(user);
    if (!user) {
      return NextResponse.json(
        { message: `User not found with id: ${userId}` },
        { status: 404 },
      );
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

export async function PUT(req) {
  try {
    await connect();

    const { userId } = auth();
    const body = await req.json();

    // find existing user by id or clerkId
    let existing = null;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      existing = await userModel.findById(userId);
    }
    if (!existing) {
      existing = await userModel.findOne({ clerkId: userId });
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
      "fistName",
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

export async function POST(req) {
  try {
    const { user } = await req.json();
    if (!user) {
      return NextResponse.json(
        { error: "User data is required" },
        { status: 400 },
      );
    }
    await connect();
    const { id, email_addresses, first_name, last_name, image_url, role } =
      user;
    const existingUser = await User.findOne({ clerkId: id });
    if (!existingUser) {
      const newUser = new User({
        clerkId: id,
        email: email_addresses[0].email_address,
        firstName: first_name,
        lastName: last_name,
        imageUrl: image_url,
        role: role,
      });
      await newUser.save();
      return NextResponse.json({
        success: true,
        message: "User created successfully",
      });
    } else {
      return NextResponse.json({
        success: true,
        message: "User already exists",
      });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
