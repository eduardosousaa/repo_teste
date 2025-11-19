import { parseCookies, setCookie, destroyCookie } from "nookies";
import Constantes from "../Constantes/Constantes";
import Router from "next/router";
import { toastError } from "./toast";

let refreshPromise = null;

async function renovarToken() {
	const { [Constantes.nome_refresh_token]: refreshToken } = parseCookies();

	if (!refreshToken) {
		return null;
	}

	if (!refreshPromise) {
		refreshPromise = (async () => {
			const res = await fetch(
				`${Constantes.url}/auth/renovar-token?refreshToken=${refreshToken}`,
				{ method: "POST" }
			);

			if (!res.ok) {
				return null;
			}

			const payload = await res.json();
			const { accessToken: newAccess, refreshToken: newRefresh } = payload;

			if (newAccess) {
				setCookie(undefined, Constantes.nome_token, newAccess, {
					maxAge: 60 * 60 * 24 * 1,
					path: "/",
				});
			}
			if (newRefresh) {
				setCookie(undefined, Constantes.nome_refresh_token, newRefresh, {
					maxAge: 60 * 60 * 24 * 7,
					path: "/",
				});
			}
			return newAccess || null;
		})();

		refreshPromise.finally(() => {
			refreshPromise = null;
		});
	}

	return refreshPromise;
}

export async function fetchWithAuth(input, init = {}) {
	const cookies = parseCookies();
	const token = cookies[Constantes.nome_token];
	const headers = {
		...init.headers,
		Accept: init.headers?.Accept || "application/json",
	};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	let res = await fetch(input, { ...init, headers });

	if (res.status === 403 || res.status === 401) {
		const novoToken = await renovarToken();

		if (!novoToken) {
			forceLogout("Sessão expirada. Faça login novamente.");
			return res;
		}

		const headers2 = {
			...headers,
			Authorization: `Bearer ${novoToken}`,
		};
		res = await fetch(input, { ...init, headers: headers2 });
	}

	return res;
}

export async function fetchJsonWithAuth(input, init = {}) {
	const res = await fetchWithAuth(input, init);
	return res.json();
}

let loggingOut = false;
function forceLogout(message = "Sessão expirada. Faça login novamente.") {
	if (loggingOut) return;
	loggingOut = true;

	destroyCookie(undefined, Constantes.nome_token, { path: "/" });
	destroyCookie(undefined, Constantes.nome_refresh_token, { path: "/" });

	if (typeof window !== "undefined") {
		toastError(message);
		Router.replace("/");
	}

	setTimeout(() => {
		loggingOut = false;
	}, 1500);
}
