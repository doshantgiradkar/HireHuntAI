import { NextResponse } from "next/server"
import { connect } from "@/lib/db"
import recruiterModel from "@/models/recruiterModel"

/* =========================
   CREATE RECRUITER (POST)
   ========================= */
export async function POST(req) {
  try {
    await connect()

    const body = await req.json()

    const {
      logo,
      name,
      industry,
      size,
      status,
      overview,
      website,
      headquarters,
      founded,
      companyType,
      primaryRoles,
      contactEmail,
      contactPhone,
      admin,
    } = body

    // Basic validation
    if (
      !name ||
      !industry ||
      !size ||
      !overview ||
      !website ||
      !headquarters ||
      !founded ||
      !companyType ||
      !contactEmail ||
      !contactPhone ||
      !admin?.name ||
      !admin?.role ||
      !admin?.email ||
      !admin?.phone
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    const recruiter = await recruiterModel.create({
      logo,
      name,
      industry,
      size,
      status,
      overview,
      website,
      headquarters,
      founded,
      companyType,
      primaryRoles,
      contactEmail,
      contactPhone,
      admin: {
        avatar: admin.avatar,
        name: admin.name,
        role: admin.role,
        email: admin.email,
        phone: admin.phone,
      },
    })

    return NextResponse.json(
      {
        message: "Recruiter profile created successfully",
        recruiter,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("CREATE_RECRUITER_ERROR:", error)

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

/* =========================
   GET ALL RECRUITERS (GET)
   ========================= */
export async function GET() {
  try {
    await connect()

    const recruiters = await recruiterModel
      .find()
      .sort({ createdAt: -1 }) // latest first (optional)

    return NextResponse.json(
      {
        recruiters,
        count: recruiters.length,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("GET_RECRUITERS_ERROR:", error)

    return NextResponse.json(
      { message: "Failed to fetch recruiters" },
      { status: 500 }
    )
  }
}
