import { NextResponse } from "next/server"
import { connect } from "@/lib/db"
import recruiterModel from "@/models/recruiterModel"
import mongoose from "mongoose"
import { auth } from "@clerk/nextjs/server"


export async function GET(req, { params }) {
  try {
    await connect()

    const id = params.id

    let recruiter = null
    // 1️⃣ If MongoDB ObjectId → fetch by _id
    if (mongoose.Types.ObjectId.isValid(id)) {
      recruiter = await recruiterModel.findById(id)
    }

    // 2️⃣ Else → treat as Clerk ID
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
  try {
    await connect()

    const id = params.id;
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

   

    // Prevent changing ownership: clerkId in payload must match existing clerkId (if provided)
    const payloadClerkId = body.clerkId || body?.admin?.clerkId || null
    if (payloadClerkId && payloadClerkId !== existing.clerkId) {
      return NextResponse.json({ message: "Cannot change recruiter owner (clerkId)" }, { status: 403 })
    }

    // prepare update object (only allow known fields)
    const updates = {}
    const allowedFields = [
      'logo', 'name', 'industry', 'size', 'status', 'overview', 'website', 'headquarters', 'founded', 'companyType', 'primaryRoles', 'contactEmail', 'contactPhone'
    ]
    allowedFields.forEach((f) => {
      if (body[f] !== undefined) updates[f] = body[f]
    })

    // admin updates
    if (body.admin) {
      updates.admin = {
        avatar: body.admin.avatar ?? existing.admin.avatar,
        name: body.admin.name ?? existing.admin.name,
        role: body.admin.role ?? existing.admin.role,
        email: body.admin.email ?? existing.admin.email,
        phone: body.admin.phone ?? existing.admin.phone,
        clerkId: existing.clerkId, // keep owner
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
