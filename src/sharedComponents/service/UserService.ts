"use client";
import { useAuth } from "../auth/AuthProvider";

export default function useUserService() {
	const { state, signIn, signOut,  getBasicUserInfo } =
		useAuth();

	const getUserInfo = async () => {
		if (!state?.isAuthenticated) {
			return null;
		}

		try {
			const userInfo = await getBasicUserInfo();
			return userInfo;
		} catch (err) {
			console.error("Erro ao obter userInfo:", err);
			return null;
		}
	};

	return {
		isAuthenticated: state?.isAuthenticated ?? false,
		isLoading: state?.isLoading ?? true,
		signIn,
		signOut,
		getUserInfo,
	};
}
