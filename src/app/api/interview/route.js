import { Interview } from "@/models/interviewModel";
import { checkAuth } from "@/utils/checkAuth";
import { NextResponse } from "next/server";

export async function GET() {
  const authResult = await checkAuth({ allowedRoles: ["candidate"]})

  if (!authResult.authenticated) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.error === "Forbidden" ? 403 : 401 }
    );
  }

  try {
    const interviews = await Interview.aggregate([
      {
        $match: {
          "candidates.candidateId": authResult.userId,
        },
      },
      {
        $lookup: {
          from: "jobs",          // collection name (NOT model name)
          localField: "jobId",
          foreignField: "_id",
          as: "job",
        },
      },
      {
        $unwind: {
          path: "$job",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    console.log(interviews);
    return NextResponse.json(interviews);
  } catch (error) {
    console.error("Error in Interview API:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
