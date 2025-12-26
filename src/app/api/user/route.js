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
