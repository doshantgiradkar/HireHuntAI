import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import jobModel from "@/models/jobModel";
import recruiterModel from "@/models/recruiterModel";
import { checkAuth } from "@/utils/checkAuth";

export async function GET(req) {
  const authResult = await checkAuth({ allowedRoles: ["recruiter","candidate"] });

  if (!authResult.authenticated) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.error === "Forbidden" ? 403 : 401 }
    );
  }

  try {
    await connect();
    const clerkId = authResult.userId;

    const { searchParams } = new URL(req.url);
    const page_no = Math.max(Number(searchParams.get("page_no")) || 1, 1);
    const page_size = Math.min(
      Math.max(Number(searchParams.get("page_size")) || 10, 1),
      50
    );
    const search = searchParams.get("search")?.trim() || "";

    const recruiter = await recruiterModel.findOne({ clerkId });
    if (!recruiter) {
      return NextResponse.json(
        { message: "Recruiter not found" },
        { status: 404 }
      );
    }

    // Query: by recruiterId or recruiterClerkId
    const query = {
      $and: [
        {
          $or: [{ recruiterId: recruiter._id }, { recruiterClerkId: clerkId }],
        },
        ...(search
          ? [
              {
                $or: [
                  { title: { $regex: search, $options: "i" } },
                  { companyName: { $regex: search, $options: "i" } },
                  { location: { $regex: search, $options: "i" } },
                  {
                    skills: {
                      $in: search
                        .split(",")
                        .map((s) => new RegExp(`^${s.trim()}$`, "i")),
                    },
                  },
                ],
              },
            ]
          : []),
      ],
    };

    const totalCount = await jobModel.countDocuments(query);
    const jobs = await jobModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page_no - 1) * page_size)
      .limit(page_size);

    return NextResponse.json({
      jobs,
      pagination: {
        page: page_no,
        pageSize: page_size,
        totalCount,
        totalPages: Math.ceil(totalCount / page_size),
      },
    });
  } catch (error) {
    console.error("JOB_MY_GET_ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch recruiter jobs" },
      { status: 500 }
    );
  }
}
