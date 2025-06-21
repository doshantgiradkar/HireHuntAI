import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  publicRoutes: ["/", "/login", "/signup", "/unauthorized"],
  // Prevent Clerk from redirecting to its own sign-in/up pages
  signInUrl: "/login",
  signUpUrl: "/signup",
});

export const config = {
  matcher: [
    '/((?!_next|.*\\..*).*)',
    '/(api|trpc)(.*)',
  ],
};
