"use client";
import { useEffect } from "react";
import { useAuth } from "@/sharedComponents/auth/AuthProvider";
import { useRouter } from "next/navigation";
import styles from "./callback.module.css";
import TokenService from "@/sharedComponents/service/TokenService";
export default function CallbackPage() {
	const { state, getAccessToken } = useAuth();
	const router = useRouter();
	const tokenService = TokenService();
	useEffect(() => {
		const handleCallback = async () => {
			if (!state?.isLoading && state?.isAuthenticated) {
				const token = await getAccessToken(); 
				if (token) {
					tokenService.setToken(token);
				}

				router.replace("/configuration/initial-params");
			}
		};

		handleCallback();
	}, [state, router, getAccessToken, tokenService]);

	return (
		<div className={styles.container}>
			<div className={styles.spinner}></div>
		</div>
	);
}
