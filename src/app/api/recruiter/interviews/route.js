import { connect } from "@/lib/db";
import { Interview } from "@/models/interviewModel";
import jobModel from "@/models/jobModel";
import { checkAuth } from "@/utils/checkAuth";
import { NextResponse } from "next/server";

export async function GET() {
  const authResult = await checkAuth({ allowedRoles: ["recruiter"] });
  await connect();

  if (!authResult.authenticated) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.error === "Forbidden" ? 403 : 401 }
    );
  }

  const recruiterClerkId = authResult.userId;

  try {
    // 1. Get all jobs posted by this recruiter
    const recruiterJobs = await jobModel.find({ recruiterClerkId }).select("_id");
    const jobIds = recruiterJobs.map((job) => job._id);

    // 2. Fetch interviews with job details, application info, and metrics
    const interviews = await Interview.aggregate([
      {
        $match: {
          jobId: { $in: jobIds },
        },
      },
      // Join job details
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "jobDetails",
        },
      },
      {
        $unwind: {
          path: "$jobDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Join application info for each candidate
      {
        $lookup: {
          from: "applications",
          let: { jobId: "$jobId", candidateIds: "$candidates.candidateId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$jobId", "$$jobId"] },
                    { $in: ["$candidateClerkId", "$$candidateIds"] },
                  ],
                },
              },
            },
            {
              $project: {
                fullName: 1,
                email: 1,
                candidateClerkId: 1,
                resumeUrl: 1,
                "eligibility.matchScore": 1,
              },
            },
          ],
          as: "applicationInfo",
        },
      },
      // Merge application info into candidates array
      {
        $addFields: {
          candidates: {
            $map: {
              input: "$candidates",
              as: "c",
              in: {
                $mergeObjects: [
                  "$$c",
                  {
                    $ifNull: [
                      {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$applicationInfo",
                              as: "a",
                              cond: {
                                $eq: [
                                  "$$a.candidateClerkId",
                                  "$$c.candidateId",
                                ],
                              },
                            },
                          },
                          0,
                        ],
                      },
                      {},
                    ],
                  },
                ],
              },
            },
          },
          // Session-level metrics
          totalCandidates: { $size: "$candidates" },
          completedCount: {
            $size: {
              $filter: {
                input: "$candidates",
                as: "c",
                cond: { $eq: ["$$c.status", "completed"] },
              },
            },
          },
          inProgressCount: {
            $size: {
              $filter: {
                input: "$candidates",
                as: "c",
                cond: { $eq: ["$$c.status", "in-progress"] },
              },
            },
          },
        },
      },
      // Remove the temporary applicationInfo field
      {
        $unset: ["applicationInfo"],
      },
      {
        $project: {
          _id: 1,
          jobId: 1,
          candidates: 1,
          startAt: 1,
          endAt: 1,
          duration: 1,
          jobDetails: 1,
          totalCandidates: 1,
          completedCount: 1,
          inProgressCount: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return NextResponse.json(interviews);
  } catch (error) {
    console.error("Error in Recruiter Interview API:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
