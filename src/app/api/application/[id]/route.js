import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connect } from "@/lib/db";
import Application from "@/models/applicationModel";

export async function GET(req, { params }) {
  try {
    await connect();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid application id" },
        { status: 400 }
      );
    }

    const application = await Application.findById(id);

    if (!application) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(application, { status: 200 });
  } catch (error) {
    console.error("Get application error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connect();

    const { id } = params;
    const updates = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid application id" },
        { status: 400 }
      );
    }

    const allowedUpdates = ["status", "resumeUrl"];
    const filteredUpdates = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    const application = await Application.findByIdAndUpdate(
      id,
      filteredUpdates,
      { new: true }
    );

    if (!application) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Application updated successfully",
        application,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connect();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid application id" },
        { status: 400 }
      );
    }

    const application = await Application.findByIdAndDelete(id);

    if (!application) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Application deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete application error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
