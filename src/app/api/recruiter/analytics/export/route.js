export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import jobModel from "@/models/jobModel";
import ApplicationModel from "@/models/applicationModel";
import { Interview } from "@/models/interviewModel";
import recruiterModel from "@/models/recruiterModel";
import { checkAuth } from "@/utils/checkAuth";

// ── CSV helpers ───────────────────────────────────────────────────────────────

function escapeCell(value) {
  const str = value == null ? "" : String(value);
  // Wrap in quotes if it contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(rows, headers) {
  const head = headers.map(escapeCell).join(",");
  const body = rows
    .map((row) => headers.map((h) => escapeCell(row[h])).join(","))
    .join("\n");
  return `${head}\n${body}`;
}

function csvResponse(csv, filename) {
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

// ── Date window helper ────────────────────────────────────────────────────────

function getStartDate(dateRange) {
  const now = new Date();
  switch (dateRange) {
    case "last-7-days":
      now.setDate(now.getDate() - 7);
      break;
    case "last-30-days":
      now.setDate(now.getDate() - 30);
      break;
    case "last-3-months":
      now.setMonth(now.getMonth() - 3);
      break;
    case "last-year":
      now.setFullYear(now.getFullYear() - 1);
      break;
    case "last-6-months":
    default:
      now.setMonth(now.getMonth() - 6);
      break;
  }
  return now;
}

/**
 * GET /api/recruiter/analytics/export
 *
 * Query params:
 *   reportType  – "full" | "funnel" | "recruiter" | "skills"
 *   dateRange   – same values as analytics endpoint
 *   department  – job title keyword (optional)
 *   location    – location keyword (optional)
 *
 * Returns a CSV file download.
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

    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get("reportType") ?? "full";
    const dateRange = searchParams.get("dateRange") ?? "last-6-months";
    const departmentFilter = searchParams.get("department") ?? "";
    const locationFilter = searchParams.get("location") ?? "";

    const startDate = getStartDate(dateRange);

    // ── Build filters ─────────────────────────────────────────────────────────
    const jobFilter = { recruiterId };
    if (departmentFilter && departmentFilter !== "all") {
      jobFilter.title = { $regex: departmentFilter, $options: "i" };
    }
    if (locationFilter && locationFilter !== "all") {
      jobFilter.location = { $regex: locationFilter, $options: "i" };
    }

    const recruiterJobs = await jobModel.find(jobFilter).lean();
    const jobIds = recruiterJobs.map((j) => j._id);

    const appFilter = {
      recruiterId,
      createdAt: { $gte: startDate },
      ...(jobIds.length ? { jobId: { $in: jobIds } } : {}),
    };

    // ── Build job title lookup map ─────────────────────────────────────────────
    const jobTitleMap = {};
    recruiterJobs.forEach((j) => {
      jobTitleMap[j._id.toString()] = j.title;
    });

    // ── Report: funnel ────────────────────────────────────────────────────────
    if (reportType === "funnel") {
      const statuses = ["applied", "shortlisted", "interview_scheduled", "hired", "rejected"];
      const counts = await Promise.all(
        statuses.map((s) =>
          ApplicationModel.countDocuments(
            s === "applied" ? appFilter : { ...appFilter, status: s }
          )
        )
      );
      const total = counts[0] || 1;
      const rows = statuses.map((stage, i) => ({
        Stage: stage.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase()),
        Count: counts[i],
        "Conversion Rate (%)": ((counts[i] / total) * 100).toFixed(1),
      }));
      return csvResponse(
        toCSV(rows, ["Stage", "Count", "Conversion Rate (%)"]),
        "hiring-funnel.csv"
      );
    }

    // ── Report: recruiter / job performance ───────────────────────────────────
    if (reportType === "recruiter") {
      const jobPerf = await ApplicationModel.aggregate([
        { $match: appFilter },
        {
          $group: {
            _id: "$jobId",
            totalApps: { $sum: 1 },
            hired: { $sum: { $cond: [{ $eq: ["$status", "hired"] }, 1, 0] } },
            avgScore: { $avg: "$eligibility.matchScore" },
          },
        },
        { $sort: { totalApps: -1 } },
      ]);

      const rows = jobPerf.map((jp) => ({
        "Job Title": jobTitleMap[jp._id?.toString()] ?? "Unknown",
        "Total Applications": jp.totalApps,
        Hired: jp.hired,
        "Avg AI Score": jp.avgScore ? jp.avgScore.toFixed(1) : "0",
        "Conversion Rate (%)":
          jp.totalApps > 0 ? ((jp.hired / jp.totalApps) * 100).toFixed(1) : "0",
      }));

      return csvResponse(
        toCSV(rows, [
          "Job Title",
          "Total Applications",
          "Hired",
          "Avg AI Score",
          "Conversion Rate (%)",
        ]),
        "job-performance.csv"
      );
    }

    // ── Report: skills ────────────────────────────────────────────────────────
    if (reportType === "skills") {
      const allApps = await ApplicationModel.find(appFilter, { skills: 1 }).lean();
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

      const rows = Object.entries(skillCountMap)
        .sort((a, b) => b[1] - a[1])
        .map(([skill, required]) => {
          const available = skillApplicantMap[skill] ?? 0;
          const gap = Math.max(0, required - available);
          return {
            Skill: skill,
            Required: required,
            Available: available,
            Gap: gap,
            "Fill Rate (%)":
              required > 0
                ? ((Math.min(available, required) / required) * 100).toFixed(0)
                : "100",
            Priority: gap > 12 ? "Critical" : gap > 5 ? "High" : "Medium",
          };
        });

      return csvResponse(
        toCSV(rows, ["Skill", "Required", "Available", "Gap", "Fill Rate (%)", "Priority"]),
        "skill-gap-analysis.csv"
      );
    }

    // ── Report: full (default) ────────────────────────────────────────────────
    // Combines applications with job title, status, AI score
    const applications = await ApplicationModel.find(appFilter, {
      fullName: 1,
      email: 1,
      status: 1,
      jobId: 1,
      createdAt: 1,
      updatedAt: 1,
      "eligibility.matchScore": 1,
      "eligibility.isEligible": 1,
    })
      .sort({ createdAt: -1 })
      .lean();

    const rows = applications.map((app) => {
      const appliedDate = new Date(app.createdAt).toLocaleDateString("en-GB");
      const updatedDate = new Date(app.updatedAt).toLocaleDateString("en-GB");
      const daysToProcess =
        app.status === "hired"
          ? Math.round(
              (new Date(app.updatedAt) - new Date(app.createdAt)) /
                (1000 * 60 * 60 * 24)
            )
          : "";
      return {
        Name: app.fullName ?? "",
        Email: app.email ?? "",
        "Job Title": jobTitleMap[app.jobId?.toString()] ?? "Unknown",
        Status: app.status ?? "",
        "AI Match Score": app?.eligibility?.matchScore ?? "",
        Eligible: app?.eligibility?.isEligible ? "Yes" : "No",
        "Applied Date": appliedDate,
        "Last Updated": updatedDate,
        "Days to Process": daysToProcess,
      };
    });

    return csvResponse(
      toCSV(rows, [
        "Name",
        "Email",
        "Job Title",
        "Status",
        "AI Match Score",
        "Eligible",
        "Applied Date",
        "Last Updated",
        "Days to Process",
      ]),
      "full-analytics-report.csv"
    );
  } catch (error) {
    console.error("RECRUITER_ANALYTICS_EXPORT_ERROR:", error);
    return NextResponse.json(
      { message: "Failed to generate export" },
      { status: 500 }
    );
  }
}
