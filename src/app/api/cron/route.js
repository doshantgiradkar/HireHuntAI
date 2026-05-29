/**
 * Cron Status & Control API
 * 
 * GET /api/cron/status - Get cron job status
 * POST /api/cron/trigger - Manually trigger shortlisting (admin/testing only)
 */

import { NextResponse } from "next/server";
import { getCronStatus, manualTriggerShortlisting } from "@/lib/cronJobs";
import { checkAuth } from "@/utils/checkAuth";
import { connect } from "@/lib/db";

/**
 * GET - Retrieve cron job status
 */
export async function GET(request) {
  try {
    // Optional: Check authentication - uncomment if you want to restrict access
    // const authResult = await checkAuth({ allowedRoles: ["recruiter", "admin"] });
    // if (!authResult.authenticated) {
    //   return NextResponse.json(
    //     { message: authResult.error },
    //     { status: authResult.error === "Forbidden" ? 403 : 401 }
    //   );
    // }

    const status = getCronStatus();
    return NextResponse.json({
      status: "success",
      cronJobs: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error in GET /api/cron/status:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST - Manually trigger shortlisting process (for testing/admin)
 */
export async function POST(request) {
  try {
    await connect();

    // Optional: Check authentication - for testing, you might want to allow without auth
    // For production, uncomment and restrict to admin/recruiter
    // const authResult = await checkAuth({ allowedRoles: ["admin"] });
    // if (!authResult.authenticated) {
    //   return NextResponse.json(
    //     { message: authResult.error },
    //     { status: authResult.error === "Forbidden" ? 403 : 401 }
    //   );
    // }

    const requestBody = await request.json().catch(() => ({}));
    const { force } = requestBody;

    console.log("[API] Manual trigger for shortlisting called");
    
    // Trigger the shortlisting process
    await manualTriggerShortlisting();

    return NextResponse.json({
      status: "success",
      message: "Shortlisting process triggered successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error in POST /api/cron/trigger:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
