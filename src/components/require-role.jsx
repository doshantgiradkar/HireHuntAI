"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RequireRole({ allowedRoles, children }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      const role = user?.publicMetadata?.role;

      if (!allowedRoles.includes(role)) {
        router.push("/unauthorized");
      }
    }
  }, [isLoaded, user]);

  if (!isLoaded) return <div>Loading...</div>;

  return <>{children}</>;
}
