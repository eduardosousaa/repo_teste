"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/sharedComponents/auth/AuthProvider";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const publicRoutes = ["/login", "/callback"];

  useEffect(() => {
    if (!publicRoutes.includes(pathname) && state && !state.isLoading && !state.isAuthenticated) {
      router.push("/login");
    }
  }, [pathname, state, router]);

  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  if (state?.isLoading) {
    return <div></div>;
  }

  if (state?.isAuthenticated) {
    return <>{children}</>;
  }

  return null;
}
