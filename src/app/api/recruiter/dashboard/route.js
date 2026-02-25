export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import jobModel from "@/models/jobModel";
import ApplicationModel from "@/models/applicationModel";
import { Interview } from "@/models/interviewModel";
import recruiterModel from "@/models/recruiterModel";
import { checkAuth } from "@/utils/checkAuth";

/**
 * GET /api/recruiter/dashboard
 *
 * Returns all data needed for the recruiter dashboard:
 * - summaryCards: totalJobs, activeJobs, totalApplications, selectionRate
 * - applicationTrend: daily applications & hires for last 90 days (for chart)
 * - recentJobs: latest 10 jobs with application counts (for DataTable)
 */
export async function GET(req) {
  const authResult = await checkAuth({ allowedRoles: ["recruiter"] });

  if (!authResult.authenticated) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.error === "Forbidden" ? 403 : 401 }
    );
  }

  try {
    await connect();
    const recruiterClerkId = authResult.userId;

    // Get recruiter document for their MongoDB _id
    const recruiter = await recruiterModel.findOne({ clerkId: recruiterClerkId });
    if (!recruiter) {
      return NextResponse.json({ message: "Recruiter not found" }, { status: 404 });
    }

    const recruiterId = recruiter._id;

    // ── 1. Job counts ──────────────────────────────────────────────────────────
    const [totalJobs, activeJobs, draftJobs, pausedJobs, closedJobs] = await Promise.all([
      jobModel.countDocuments({ recruiterId }),
      jobModel.countDocuments({ recruiterId, status: "Open" }),
      jobModel.countDocuments({ recruiterId, status: "Draft" }),
      jobModel.countDocuments({ recruiterId, status: "Paused" }),
      jobModel.countDocuments({ recruiterId, status: "Closed" }),
    ]);

    // ── 2. Application counts ──────────────────────────────────────────────────
    const [totalApplications, hiredCount, shortlistedCount, rejectedCount, interviewScheduledCount] =
      await Promise.all([
        ApplicationModel.countDocuments({ recruiterId }),
        ApplicationModel.countDocuments({ recruiterId, status: "hired" }),
        ApplicationModel.countDocuments({ recruiterId, status: "shortlisted" }),
        ApplicationModel.countDocuments({ recruiterId, status: "rejected" }),
        ApplicationModel.countDocuments({ recruiterId, status: "interview_scheduled" }),
      ]);

    const selectionRate =
      totalApplications > 0
        ? parseFloat(((hiredCount / totalApplications) * 100).toFixed(1))
        : 0;

    // ── 3. Application trend (last 90 days grouped by date) ────────────────────
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const applicationTrendRaw = await ApplicationModel.aggregate([
      {
        $match: {
          recruiterId,
          createdAt: { $gte: ninetyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          applications: { $sum: 1 },
          hired: {
            $sum: { $cond: [{ $eq: ["$status", "hired"] }, 1, 0] },
          },
          shortlisted: {
            $sum: { $cond: [{ $eq: ["$status", "shortlisted"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing dates so the chart is continuous
    const trendMap = {};
    applicationTrendRaw.forEach((d) => {
      trendMap[d._id] = { applications: d.applications, hired: d.hired, shortlisted: d.shortlisted };
    });

    const applicationTrend = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      applicationTrend.push({
        date: key,
        applications: trendMap[key]?.applications ?? 0,
        hired: trendMap[key]?.hired ?? 0,
        shortlisted: trendMap[key]?.shortlisted ?? 0,
      });
    }

    // ── 4. Recent jobs (for DataTable) ────────────────────────────────────────
    const recentJobs = await jobModel
      .find({ recruiterId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // ── 5. Interview stats ────────────────────────────────────────────────────
    const recruiterJobIds = await jobModel
      .find({ recruiterId })
      .distinct("_id");

    const interviewStats = await Interview.aggregate([
      { $match: { jobId: { $in: recruiterJobIds } } },
      {
        $group: {
          _id: null,
          totalInterviews: { $sum: 1 },
          totalCandidatesInterviewed: { $sum: { $size: "$candidates" } },
          completed: {
            $sum: {
              $size: {
                $filter: {
                  input: "$candidates",
                  as: "c",
                  cond: { $eq: ["$$c.status", "completed"] },
                },
              },
            },
          },
        },
      },
    ]);

    const interviewData = interviewStats[0] ?? {
      totalInterviews: 0,
      totalCandidatesInterviewed: 0,
      completed: 0,
    };

    // ── 6. Top performing jobs ────────────────────────────────────────────────
    const topJobs = await jobModel
      .find({ recruiterId })
      .sort({ applicationsCount: -1 })
      .limit(5)
      .select("title status applicationsCount hiredCount shortlistedCount openings")
      .lean();

    return NextResponse.json(
      {
        summaryCards: {
          totalJobs,
          activeJobs,
          draftJobs,
          pausedJobs,
          closedJobs,
          totalApplications,
          hiredCount,
          shortlistedCount,
          rejectedCount,
          interviewScheduledCount,
          selectionRate,
        },
        applicationTrend,
        recentJobs,
        interviews: interviewData,
        topJobs,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("RECRUITER_DASHBOARD_GET_ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
