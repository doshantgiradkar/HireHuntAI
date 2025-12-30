// middleware.js
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ✅ PUBLIC ROUTES (no auth required)
const isPublicRoute = createRouteMatcher([
  "/",
  "/login",
  "/sign-in",
  "/sign-up",
]);

// ROLE / FLOW ROUTES
const isSelectRoleRoute = createRouteMatcher(["/select-role"]);

const isCandidateRoot = createRouteMatcher(["/candidate"]);
const isCandidateUploadResume = createRouteMatcher(["/candidate/resume"]);
const isCandidateEditProfile = createRouteMatcher(["/candidate/edit-profile"]);
const isCandidateRoute = createRouteMatcher(["/candidate(.*)"]);
const isRecruiterRoot = createRouteMatcher(["/recruiter"]);
const isRecruiterEditProfile = createRouteMatcher(["/recruiter/edit-profile"]);
const isRecruiterRoute = createRouteMatcher(["/recruiter(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const { pathname } = req.nextUrl;

  const role = sessionClaims?.metadata?.role;
  const isProfileComplete = sessionClaims?.metadata?.isProfileComplete ?? false;
  const hasResume = sessionClaims?.metadata?.hasResume ?? false;

  // ALWAYS allow API routes
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Not authenticated → redirect to home
  if (!userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Authenticated but role not selected → select role
  if (userId && !role && !isSelectRoleRoute(req)) {
    return NextResponse.redirect(new URL("/select-role", req.url));
  }

  // Prevent role-selected users from visiting select-role again
  if (userId && role && isSelectRoleRoute(req)) {
    return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url));
  }

  // Candidate flow
  if (userId && role === "candidate") {
    // Resume NOT uploaded → upload resume
    if (!hasResume && !isCandidateUploadResume(req)) {
      console.log(sessionClaims.metadata.hasResume);
      return NextResponse.redirect(new URL("/candidate/resume", req.url));
    }

    // Resume uploaded but profile NOT complete → edit profile
    if (hasResume && !isProfileComplete && !isCandidateEditProfile(req)) {
      return NextResponse.redirect(new URL("/candidate/edit-profile", req.url));
    }

    // Resume uploaded + profile complete → dashboard
    if (hasResume && isProfileComplete && !isCandidateRoute(req)) {
      return NextResponse.redirect(new URL("/candidate/dashboard", req.url));
    }

    // Prevent candidate from accessing recruiter routes
    if (!isCandidateRoute(req) || isCandidateRoot(req)) {
      return NextResponse.redirect(new URL("/candidate/dashboard", req.url));
    }
  }

  // Recruiter flow
  if (userId && role === "recruiter") {
    // Profile NOT complete → edit profile
    if (!isProfileComplete && !isRecruiterEditProfile(req)) {
      return NextResponse.redirect(new URL("/recruiter/edit-profile", req.url));
    }

    // Profile complete → dashboard
    if (isProfileComplete && !isRecruiterRoute(req)) {
      return NextResponse.redirect(new URL("/recruiter/dashboard", req.url));
    }

    // Prevent recruiter from accessing candidate routes
    if (!isRecruiterRoute(req) || isRecruiterRoot(req)) {
      return NextResponse.redirect(new URL("/recruiter/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*|favicon.ico).*)"],
};
