import { NextResponse } from "next/server";
import { connect } from "@/lib/db";

import { auth } from "@clerk/nextjs/server";
import recruiterModel from "@/models/recruiterModel";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    await connect();

    const body = await req.json();

    const { clerkId } = body;

    if (!clerkId) {
      return NextResponse.json(
        { message: "clerkId is required" },
        { status: 400 }
      );
    }

    const recruiter = await recruiterModel.findOneAndUpdate(
      { clerkId },              
      { $set: body },
      {
        upsert: true,
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