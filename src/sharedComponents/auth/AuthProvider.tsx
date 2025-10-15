
"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { AuthReactConfig } from "@asgardeo/auth-react";

const AsgardeoProvider = dynamic(
  () => import("@asgardeo/auth-react").then((mod) => mod.AuthProvider),
  { ssr: false }
);

export function AuthProvider({
  children,
  config,
}: {
  children: React.ReactNode;
  config: AuthReactConfig;
}) {
  return <AsgardeoProvider config={config}>{children}</AsgardeoProvider>;
}

export function useAuth() {
  // Desativa APENAS a regra '@typescript-eslint/no-require-imports' para a próxima linha.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useAuthContext } = require("@asgardeo/auth-react");
  return useAuthContext();
}