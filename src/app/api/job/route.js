import { connect } from "@/lib/db";
import jobModel from "@/models/jobModel";
import recruiterModel from "@/models/recruiterModel";
import { checkAuth } from "@/utils/checkAuth";
import { NextResponse } from "next/server";

export async function POST(req) {
  const authResult = await checkAuth({ allowedRoles: ["recruiter"] });

  if (!authResult.authenticated) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.error === "Forbidden" ? 403 : 401 }
    );
  }

  const userId = authResult.userId;

  try {
    await connect();

    const body = await req.json();
    const {
      title,
      description,
      location,
      workMode,
      employmentType,
    } = body;

    if (
      !title ||
      !description ||
      !location ||
      !workMode ||
      !employmentType
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const recruiter = await recruiterModel.findOne({
      clerkId: authResult.userId,
      clerkId: userId,
    });

    if (!recruiter) {
      return NextResponse.json(
        { message: "Recruiter not found" },
        { status: 404 }
      );
    }

    const job = await jobModel.create({
      ...body,
      recruiterId: recruiter._id,
      recruiterClerkId: recruiter.clerkId,
      companyName: recruiter.name,
      companyLogo: recruiter.logo,
      postedAt: body.status === "Open" ? new Date() : null,
    });

    return NextResponse.json(
      { message: "Job created successfully", job },
      { status: 201 }
    );
  } catch (error) {
    console.error("JOB_POST_ERROR:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create job" },
      { status: 500 }
    );
  }
}


// /api/job/route.js
export async function GET(req) {
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

    const { searchParams } = new URL(req.url);
    const page_no = parseInt(searchParams.get('page_no')) || 1;
    const page_size = parseInt(searchParams.get('page_size')) || 9;
    const search = searchParams.get('search') || '';

    // Build search query
    let query = {};
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { skills: { $in: [new RegExp(search, 'i')] } }
        ]
      };
    }

    // Get total count for pagination
    const totalCount = await jobModel.countDocuments(query);

    // Get paginated jobs
    const { searchParams } = new URL(req.url);
    const page_no = parseInt(searchParams.get('page_no')) || 1;
    const page_size = parseInt(searchParams.get('page_size')) || 9;
    const search = searchParams.get('search') || '';

    // Build search query
    let query = {};
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { skills: { $in: [new RegExp(search, 'i')] } }
        ]
      };
    }

    // Get total count for pagination
    const totalCount = await jobModel.countDocuments(query);

    // Get paginated jobs
    const jobs = await jobModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page_no - 1) * page_size)
      .limit(page_size);
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page_no - 1) * page_size)
      .limit(page_size);

    return NextResponse.json(
      { jobs, count: totalCount },
      { jobs, count: totalCount },
      { status: 200 }
    );
  } catch (error) {
    console.error("JOB_GET_ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

