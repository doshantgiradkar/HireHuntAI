import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import Application from "@/models/applicationModel";
import { checkAuth } from "@/utils/checkAuth";
import jobModel from "@/models/jobModel"

export async function GET(req) {
  const authResult = await checkAuth({ allowedRoles: ["candidate"] });

  if (!authResult.authenticated) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.error === "Forbidden" ? 403 : 401 },
    );
  }

  const userId = authResult.userId;
  try {
    await connect();

    const applications = await Application.find({
      candidateClerkId: userId,
    })
      .populate({
        path: "jobId",
        model: jobModel,
        select:
          "title companyName location salaryRange workMode employmentType",
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ applications }, { status: 200 });
  } catch (error) {
    console.error("APPLICATION_GET_ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
