import { auth } from "@clerk/nextjs/server";


export async function checkAuth(options = {}) {
  const { redirect = false, allowedRoles = [] } = options;

  const { userId, sessionClaims, redirectToSignIn } = await auth();

  if (!userId) {
    if (redirect) {
      return redirectToSignIn();
    }

    return {
      authenticated: false,
      userId: null,
      role: null,
      error: "Unauthorized",
    };
  }

  const role =
    sessionClaims?.publicMetadata?.role ||
    sessionClaims?.metadata?.role ||
    null;


  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return {
      authenticated: false,
      userId,
      role,
      error: "Forbidden",
    };
  }

  return {
    authenticated: true,
    userId,
    role,
    sessionClaims,
  };
}
