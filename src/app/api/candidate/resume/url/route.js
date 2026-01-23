import { connect } from "@/lib/db";
import Candidate from "@/models/candidateModel";
import { checkAuth } from "@/utils/checkAuth";
import { NextResponse } from "next/server";

export async function GET(req) {
  connect();
  const authResult = await checkAuth({ allowedRoles: ["candidate"] });

  if (!authResult.authenticated) {
    return NextResponse.json(
      {
        message: authResult.error,
      },
      { status: authResult.error === "Forbidden" ? 403 : 401 },
    );
  }

  const resumeUrl = await Candidate.findOne({ clerkId: authResult.userId }).select({ 'resume.resumeUrl': 1 }).lean();
  if (!resumeUrl) {
    return NextResponse.json({ success: false, message: "Resume URL Not Found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, resumeUrl: resumeUrl.resume.resumeUrl }, { status: 200 });
}
