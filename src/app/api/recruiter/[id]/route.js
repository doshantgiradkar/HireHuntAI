import { NextResponse } from "next/server"
import { connect } from "@/lib/db"
import recruiterModel from "@/models/recruiterModel"
import mongoose from "mongoose"
import { checkAuth } from "@/utils/checkAuth"


export async function GET(req, { params }) {
  const authResult = checkAuth({
    allowedRoles: ["recruiter","candidate"],
  })

  if (!authResult.authenticated) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.error === "Forbidden" ? 403 : 401 }
    )
  }

  try {
    await connect()

   const { id } = await params

    let recruiter = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      recruiter = await recruiterModel.findById(id)
    }

    if (!recruiter) {
      recruiter = await recruiterModel.findOne({ clerkId: id })
    }

    if (!recruiter) {
      return NextResponse.json(
        { message: "Recruiter not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ recruiter }, { status: 200 })
  } catch (error) {
    console.error("GET_RECRUITER_ERROR:", error)

    return NextResponse.json(
      { message: "Failed to fetch recruiter" },
      { status: 500 }
    )
  }
}

export async function PUT(req, { params }) {
  const authResult = checkAuth({
    allowedRoles: ["recruiter"],
  })

  if (!authResult.authenticated) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.error === "Forbidden" ? 403 : 401 }
    )
  }
  try {
    await connect()

    const { id } = await params
    const body = await req.json()

    // find existing recruiter by id or clerkId
    let existing = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      existing = await recruiterModel.findById(id)
    }
    if (!existing) {
      existing = await recruiterModel.findOne({ clerkId: id })
    }

    if (!existing) {
      return NextResponse.json({ message: "Recruiter not found" }, { status: 404 })
    }

   

    const payloadClerkId = body.clerkId || null
    if (payloadClerkId && payloadClerkId !== existing.clerkId) {
      return NextResponse.json({ message: "Cannot change recruiter owner (clerkId)" }, { status: 403 })
    }

    const updates = {}
    const allowedFields = [
      'logo', 'name', 'industry', 'size', 'status', 'overview', 'website', 'headquarters', 'founded', 'companyType', 'primaryRoles', 'contactEmail', 'contactPhone'
    ]
    allowedFields.forEach((f) => {
      if (body[f] !== undefined) updates[f] = body[f]
    })

    if (body.admin) {
      updates.admin = {
        avatar: body.admin.avatar ?? existing.admin.avatar,
        name: body.admin.name ?? existing.admin.name,
        role: body.admin.role ?? existing.admin.role,
        email: body.admin.email ?? existing.admin.email,
        phone: body.admin.phone ?? existing.admin.phone,
      }
    }

    const updated = await recruiterModel.findOneAndUpdate(
      { _id: existing._id },
      { $set: updates },
      { new: true, runValidators: true }
    )

    return NextResponse.json({ message: "Recruiter updated", recruiter: updated }, { status: 200 })
  } catch (error) {
    console.error("UPDATE_RECRUITER_ERROR:", error)
    return NextResponse.json({ message: "Failed to update recruiter" }, { status: 500 })
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