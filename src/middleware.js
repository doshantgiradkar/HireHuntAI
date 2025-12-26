// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// ✅ ROUTE MATCHERS (NO API HERE)
const isPublicRoute = createRouteMatcher([
  '/',
  '/login',
  '/sign-in',
  '/sign-up',
]);

const isSelectRoleRoute = createRouteMatcher(['/select-role']);
const isCandidateRoute = createRouteMatcher(['/candidate(.*)']);
const isRecruiterRoute = createRouteMatcher(['/recruiter(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  const role = sessionClaims?.metadata?.role;
  
  const { pathname } = req.nextUrl;

  // 🔥 1. ALWAYS allow API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 🔐 2. Not signed in
  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // 🔐 3. Signed in users
  if (userId) {

    // a) No role yet → force role selection
    if (!role && !isSelectRoleRoute(req)) {
      return NextResponse.redirect(new URL('/select-role', req.url));
    }

    // b) Role users cannot visit select-role
    if (role && isSelectRoleRoute(req)) {
      return NextResponse.redirect(
        new URL(`/${role}/dashboard`, req.url)
      );
    }

    // c) Role-based protection
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
