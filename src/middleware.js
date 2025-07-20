// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/login', '/sign-in','/sign-in(.*)',"/"]);
const isSelectRoleRoute = createRouteMatcher(['/select-role']);
const isCandidateRoute = createRouteMatcher(['/candidate', '/candidate/(.*)']);
const isRecruiterRoute = createRouteMatcher(['/recruiter', '/recruiter/(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  const role = sessionClaims?.metadata?.role;

  console.log('sessionClaims.metadata:', sessionClaims?.metadata);

  // 1. Not signed in → send to sign-in
  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // 2. Signed-in users
  if (userId) {

    // a) Users without a role → send to /select-role
    if (!role && !isSelectRoleRoute(req)) {
      return NextResponse.redirect(new URL('/select-role', req.url));
    }

    // After selecting a role, redirect to the respective dashboard
    if (!role && isSelectRoleRoute(req)) {
      // Wait for role to be set, then redirect
      // This block will be triggered after role is set in the session
      // You may need to reload session or check for role in the next request
      // For immediate redirect, check if the request is a POST and role is present in the body
      // But for GET, just let the frontend handle the redirect after role selection
      return NextResponse.next();
    }

    // b) Prevent users *with* a role from visiting /select-role
    if (role && isSelectRoleRoute(req)) {
      if (role === 'candidate') {
        return NextResponse.redirect(new URL('/candidate/dashboard', req.url));
      }
      if (role === 'recruiter') {
        return NextResponse.redirect(new URL('/recruiter/dashboard', req.url));
      }
    }

    // c) Role-based redirect to dashboards
    if (role === 'candidate' && !isCandidateRoute(req)) {
      return NextResponse.redirect(new URL('/candidate/dashboard', req.url));
    }
    if (role === 'recruiter' && !isRecruiterRoute(req)) {
      return NextResponse.redirect(new URL('/recruiter/dashboard', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next|.*\\..*|favicon.ico).*)'],
};
