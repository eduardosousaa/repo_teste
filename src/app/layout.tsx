import type { Metadata } from "next";
import "./globals.css";
import ProtectedRoute from "@/sharedComponents/auth/ProtectedRoute";
import { AuthProvider } from "@/sharedComponents/auth/AuthProvider";
import type { AuthReactConfig } from "@asgardeo/auth-react";

export const metadata: Metadata = {
	title: "Sistema de Petições",
	description: "Módulo de Petições do Gedai",
};

export const authConfig: AuthReactConfig = {
  signInRedirectURL: process.env.NEXT_PUBLIC_AUTH_SIGN_IN_REDIRECT!,
  signOutRedirectURL: process.env.NEXT_PUBLIC_AUTH_SIGN_OUT_REDIRECT!,
  clientID: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID!,
  baseUrl: process.env.NEXT_PUBLIC_AUTH_BASE_URL!,
  scope: process.env.NEXT_PUBLIC_AUTH_SCOPE?.split(","),
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="pt-BR">
			<body>
				<AuthProvider config={authConfig}>
					<ProtectedRoute>{children}</ProtectedRoute>
				</AuthProvider>
			</body>
		</html>
	);
}
