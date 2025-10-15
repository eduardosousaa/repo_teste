"use client";

import { useEffect } from "react";
import { useAuth } from "@/sharedComponents/auth/AuthProvider";
import styles from "./login.module.css";
export default function LoginPage() {
	const { state, signIn } = useAuth();

	useEffect(() => {
		if (!state.isAuthenticated && !state.isLoading) {
			signIn();
		}
	}, [state, signIn]);

	return (
		<div className={styles.container}>
			<div className={styles.spinner}></div>
		</div>
	);
}
