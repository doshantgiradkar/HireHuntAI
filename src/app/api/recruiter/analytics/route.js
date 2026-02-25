export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import jobModel from "@/models/jobModel";
import ApplicationModel from "@/models/applicationModel";
import { Interview } from "@/models/interviewModel";
import recruiterModel from "@/models/recruiterModel";
import { checkAuth } from "@/utils/checkAuth";

/**
 * GET /api/recruiter/analytics
 *
 * Query params:
 *   dateRange   – "last-7-days" | "last-30-days" | "last-3-months" | "last-6-months" | "last-year"  (default: "last-6-months")
 *   department  – job title keyword filter (optional)
 *   location    – location keyword filter (optional)
 *
 * Returns a single object with all analytics data:
 *   - keyMetrics
 *   - hiringFunnel
 *   - candidateFlowTrend  (weekly for dateRange window)
 *   - timeToHire          (monthly avg days)
 *   - sourcePerformance
 *   - aiScoreDistribution
 *   - interviewSuccessRate
 *   - recruiterPerformance  (per-job stats proxied as recruiter performance)
 *   - skillGap
 *   - topJobs
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

    const recruiter = await recruiterModel.findOne({ clerkId: recruiterClerkId });
    if (!recruiter) {
      return NextResponse.json({ message: "Recruiter not found" }, { status: 404 });
    }
    const recruiterId = recruiter._id;

    // ── Parse query params ────────────────────────────────────────────────────
    const { searchParams } = new URL(req.url);
    const dateRange = searchParams.get("dateRange") ?? "last-6-months";
    const departmentFilter = searchParams.get("department") ?? "";
    const locationFilter = searchParams.get("location") ?? "";

    // Compute date window
    const now = new Date();
    let startDate = new Date();
    switch (dateRange) {
      case "last-7-days":
        startDate.setDate(now.getDate() - 7);
        break;
      case "last-30-days":
        startDate.setDate(now.getDate() - 30);
        break;
      case "last-3-months":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "last-year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case "last-6-months":
      default:
        startDate.setMonth(now.getMonth() - 6);
        break;
    }

    // ── Base job filter ───────────────────────────────────────────────────────
    const jobFilter = { recruiterId };
    if (departmentFilter && departmentFilter !== "all") {
      jobFilter.title = { $regex: departmentFilter, $options: "i" };
    }
    if (locationFilter && locationFilter !== "all") {
      jobFilter.location = { $regex: locationFilter, $options: "i" };
    }

    const recruiterJobs = await jobModel.find(jobFilter).lean();
    const jobIds = recruiterJobs.map((j) => j._id);

    // ── Base application filter ────────────────────────────────────────────────
    const appFilter = {
      recruiterId,
      createdAt: { $gte: startDate },
      ...(jobIds.length ? { jobId: { $in: jobIds } } : {}),
    };

    // ── 1. Key Metrics ────────────────────────────────────────────────────────
    const [
      totalCandidates,
      activeJobsCount,
      hiredInPeriod,
      totalInPeriod,
    ] = await Promise.all([
      ApplicationModel.countDocuments(appFilter),
      jobModel.countDocuments({ recruiterId, status: "Open" }),
      ApplicationModel.countDocuments({ ...appFilter, status: "hired" }),
      ApplicationModel.countDocuments(appFilter),
    ]);

    const conversionRate =
      totalInPeriod > 0
        ? parseFloat(((hiredInPeriod / totalInPeriod) * 100).toFixed(1))
        : 0;

    // Avg time to hire (createdAt → updatedAt for "hired" apps)
    const hiredApps = await ApplicationModel.find(
      { ...appFilter, status: "hired" },
      { createdAt: 1, updatedAt: 1 }
    ).lean();

    let avgTimeToHire = 0;
    if (hiredApps.length > 0) {
      const totalDays = hiredApps.reduce((sum, app) => {
        const diff =
          (new Date(app.updatedAt) - new Date(app.createdAt)) /
          (1000 * 60 * 60 * 24);
        return sum + diff;
      }, 0);
      avgTimeToHire = Math.round(totalDays / hiredApps.length);
    }

    // ── 2. Hiring Funnel ──────────────────────────────────────────────────────
    const [
      applied,
      shortlisted,
      interviewScheduled,
      hired,
      rejected,
    ] = await Promise.all([
      ApplicationModel.countDocuments(appFilter),
      ApplicationModel.countDocuments({ ...appFilter, status: "shortlisted" }),
      ApplicationModel.countDocuments({ ...appFilter, status: "interview_scheduled" }),
      ApplicationModel.countDocuments({ ...appFilter, status: "hired" }),
      ApplicationModel.countDocuments({ ...appFilter, status: "rejected" }),
    ]);

    const hiringFunnel = [
      { stage: "Applied", count: applied, conversion: 100 },
      {
        stage: "Shortlisted",
        count: shortlisted,
        conversion: applied > 0 ? parseFloat(((shortlisted / applied) * 100).toFixed(1)) : 0,
      },
      {
        stage: "Interview",
        count: interviewScheduled,
        conversion: applied > 0 ? parseFloat(((interviewScheduled / applied) * 100).toFixed(1)) : 0,
      },
      {
        stage: "Hired",
        count: hired,
        conversion: applied > 0 ? parseFloat(((hired / applied) * 100).toFixed(1)) : 0,
      },
      {
        stage: "Rejected",
        count: rejected,
        conversion: applied > 0 ? parseFloat(((rejected / applied) * 100).toFixed(1)) : 0,
      },
    ];

    // ── 3. Candidate Flow Trend (weekly buckets) ───────────────────────────────
    const candidateFlowRaw = await ApplicationModel.aggregate([
      { $match: appFilter },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: "$createdAt" },
            week: { $isoWeek: "$createdAt" },
          },
          applied: { $sum: 1 },
          shortlisted: {
            $sum: { $cond: [{ $eq: ["$status", "shortlisted"] }, 1, 0] },
          },
          interviewed: {
            $sum: {
              $cond: [{ $eq: ["$status", "interview_scheduled"] }, 1, 0],
            },
          },
          hired: {
            $sum: { $cond: [{ $eq: ["$status", "hired"] }, 1, 0] },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } },
    ]);

    const candidateFlowTrend = candidateFlowRaw.map((w, i) => ({
      week: `Week ${i + 1}`,
      applied: w.applied,
      shortlisted: w.shortlisted,
      interviewed: w.interviewed,
      hired: w.hired,
    }));

    // ── 4. Time-to-Hire Trend (monthly) ──────────────────────────────────────
    const timeToHireRaw = await ApplicationModel.aggregate([
      { $match: { ...appFilter, status: "hired" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          avgDays: {
            $avg: {
              $divide: [
                { $subtract: ["$updatedAt", "$createdAt"] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const timeToHireData = timeToHireRaw.map((m) => ({
      month: MONTH_NAMES[m._id.month - 1],
      avgDays: Math.round(m.avgDays),
      count: m.count,
      target: 30,
    }));

    // ── 5. Source Performance (workMode as proxy for source) ─────────────────
    // Real sources could come from UTM params; here we aggregate by workMode
    const sourceRaw = await ApplicationModel.aggregate([
      { $match: appFilter },
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "job",
        },
      },
      { $unwind: { path: "$job", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ["$job.workMode", "Unknown"] },
          candidates: { $sum: 1 },
          hired: {
            $sum: { $cond: [{ $eq: ["$status", "hired"] }, 1, 0] },
          },
        },
      },
      { $sort: { candidates: -1 } },
    ]);

    const sourcePerformance = sourceRaw.map((s) => ({
      name: s._id,
      candidates: s.candidates,
      hired: s.hired,
      conversionRate:
        s.candidates > 0
          ? parseFloat(((s.hired / s.candidates) * 100).toFixed(1))
          : 0,
    }));

    // ── 6. AI Score Distribution (eligibility.matchScore buckets) ────────────
    const allApps = await ApplicationModel.find(appFilter, {
      "eligibility.matchScore": 1,
    }).lean();

    const scoreBuckets = {
      "90-100": 0,
      "80-89": 0,
      "70-79": 0,
      "60-69": 0,
      "50-59": 0,
      "0-49": 0,
    };
    allApps.forEach((app) => {
      const score = app?.eligibility?.matchScore ?? 0;
      if (score >= 90) scoreBuckets["90-100"]++;
      else if (score >= 80) scoreBuckets["80-89"]++;
      else if (score >= 70) scoreBuckets["70-79"]++;
      else if (score >= 60) scoreBuckets["60-69"]++;
      else if (score >= 50) scoreBuckets["50-59"]++;
      else scoreBuckets["0-49"]++;
    });

    const aiScoreDistribution = Object.entries(scoreBuckets).map(([range, count]) => ({
      range,
      count,
    }));

    const totalScored = allApps.length;
    const avgScore =
      totalScored > 0
        ? parseFloat(
            (
              allApps.reduce((s, a) => s + (a?.eligibility?.matchScore ?? 0), 0) /
              totalScored
            ).toFixed(1)
          )
        : 0;

    // ── 7. Interview Success Rate ─────────────────────────────────────────────
    const interviewDocs = await Interview.find(
      { jobId: { $in: jobIds } },
      { candidates: 1 }
    ).lean();

    let aiPassed = 0, aiTotal = 0;
    interviewDocs.forEach((iv) => {
      iv.candidates?.forEach((c) => {
        aiTotal++;
        if (c.status === "completed") aiPassed++;
      });
    });

    const interviewSuccessRate = [
      {
        type: "AI Interview",
        passed: aiPassed,
        failed: aiTotal - aiPassed,
        pending: 0,
      },
      {
        type: "Shortlisted",
        passed: shortlisted,
        failed: applied - shortlisted,
        pending: 0,
      },
      {
        type: "Final (Hired)",
        passed: hired,
        failed: interviewScheduled - hired,
        pending: 0,
      },
    ];

    // ── 8. Job Performance (as recruiter performance proxy) ──────────────────
    const jobPerformance = await ApplicationModel.aggregate([
      { $match: appFilter },
      {
        $group: {
          _id: "$jobId",
          totalApps: { $sum: 1 },
          hired: {
            $sum: { $cond: [{ $eq: ["$status", "hired"] }, 1, 0] },
          },
          avgScore: { $avg: "$eligibility.matchScore" },
        },
      },
      { $sort: { totalApps: -1 } },
      { $limit: 10 },
    ]);

    // Attach job titles
    const jobIdToTitle = {};
    recruiterJobs.forEach((j) => {
      jobIdToTitle[j._id.toString()] = j.title;
    });

    const recruiterPerformance = jobPerformance.map((jp) => ({
      jobTitle: jobIdToTitle[jp._id?.toString()] ?? "Unknown",
      totalApps: jp.totalApps,
      hired: jp.hired,
      avgScore: jp.avgScore ? parseFloat(jp.avgScore.toFixed(1)) : 0,
      conversionRate:
        jp.totalApps > 0
          ? parseFloat(((jp.hired / jp.totalApps) * 100).toFixed(1))
          : 0,
    }));

    // ── 9. Skill Gap (most-required skills vs applications) ───────────────────
    const skillCountMap = {};
    recruiterJobs.forEach((job) => {
      (job.skills ?? []).forEach((skill) => {
        skillCountMap[skill] = (skillCountMap[skill] ?? 0) + 1;
      });
    });

    const skillApplicantMap = {};
    allApps.forEach((app) => {
      (app.skills ?? []).forEach((skill) => {
        skillApplicantMap[skill] = (skillApplicantMap[skill] ?? 0) + 1;
      });
    });

    const skillGap = Object.entries(skillCountMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([skill, required]) => {
        const available = skillApplicantMap[skill] ?? 0;
        return {
          skill,
          required,
          available,
          gap: Math.max(0, required - available),
          fillRate:
            required > 0
              ? parseFloat(((Math.min(available, required) / required) * 100).toFixed(0))
              : 100,
        };
      });

    // ── 10. Top Jobs ──────────────────────────────────────────────────────────
    const topJobs = await jobModel
      .find({ recruiterId })
      .sort({ applicationsCount: -1 })
      .limit(5)
      .select("title status applicationsCount hiredCount openings location workMode")
      .lean();

    return NextResponse.json(
      {
        keyMetrics: {
          totalCandidates,
          activeJobs: activeJobsCount,
          avgTimeToHire,
          conversionRate,
          hiredInPeriod,
          totalApplications: totalInPeriod,
          avgAiScore: avgScore,
          totalInterviewCandidates: aiTotal,
          aiPassRate:
            aiTotal > 0 ? parseFloat(((aiPassed / aiTotal) * 100).toFixed(1)) : 0,
        },
        hiringFunnel,
        candidateFlowTrend,
        timeToHireData,
        sourcePerformance,
        aiScoreDistribution,
        interviewSuccessRate,
        recruiterPerformance,
        skillGap,
        topJobs,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("RECRUITER_ANALYTICS_GET_ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
