"use client";

import { useAuth } from "@/sharedComponents/auth/AuthProvider";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();

  if (!state.isAuthenticated) {
    if (typeof window !== "undefined") {
      window.location.href = "/petitions/login";
    }
    return null;
  }

  return <>{children}</>;
}
