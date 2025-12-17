import { NextResponse } from "next/server";
import { connect } from "@/lib/db";

import { auth } from "@clerk/nextjs/server";
import recruiterModel from "@/models/recruiterModel";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    await connect();

    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Always trust server-side Clerk user id as owner
    const payload = {
      ...body,
      clerkId: userId,
      admin: {
        ...(body.admin || {}),
        clerkId: userId,
      },
    };

    // Validate required fields server-side via Mongoose validators

    const recruiter = await recruiterModel.findOneAndUpdate(
      { clerkId: userId },    // filter by owner
      { $set: payload },      // set provided fields
      {
        upsert: true, // create if missing
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json({ recruiter }, { status: 201 });
  } catch (error) {
    console.error("RECRUITER_POST_ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connect();

    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const recruiter = await recruiterModel.findOne({ clerkId: userId });

    if (!recruiter) {
      return NextResponse.json({ message: "Recruiter not found" }, { status: 404 });
    }

    return NextResponse.json({ recruiter }, { status: 200 });
  } catch (error) {
    console.error("RECRUITER_GET_ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch recruiter" },
      { status: 500 }
    );
  }
}