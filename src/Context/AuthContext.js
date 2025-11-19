import { createContext, useState, useEffect } from "react";
import { setCookie, parseCookies, destroyCookie } from "nookies";
import { jwtDecode } from "jwt-decode";
import Constantes from "../Constantes/Constantes";
import { useRouter } from "next/router";
import { toastError, toastSuccess } from "../Util/toast";
import { id } from "date-fns/locale";

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const router = useRouter();
	useEffect(() => {
		const { [Constantes.nome_token]: token } = parseCookies();
		if (token) {
			try {
				const payload = jwtDecode(token);
				setUser({
					authority: payload.authority,
					cpf: payload.sub,
					name: payload.name,
					id: payload.id,
					unidadeId: payload.unidade,
				});
			} catch {
				console.log("Erro! Sem token fornecido.");
			}
		}
	}, []);

	async function signIn({ cpf, senha }) {
		const res = await fetch(`${Constantes.url}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ cpf: cpf?.trim(), senha: senha }),
		});

		if (!res.ok) {
			let payload;
			try {
				payload = await res.json();
			} catch {
				payload = { message: await res.text() };
			}
			const err = {
				status: res.status,
				message: payload?.message || "Erro ao fazer login",
				fieldErrors: payload?.fieldErrors || {},
			};

			toastError(err.message || "Erro ao fazer login");
			throw err;
		}

		const { accessToken, refreshToken } = await res.json();

		setCookie(undefined, Constantes.nome_token, accessToken, {
			maxAge: 60 * 60 * 24 * 1,
			path: "/",
		});
		setCookie(undefined, Constantes.nome_refresh_token, refreshToken, {
			maxAge: 60 * 60 * 24 * 7,
			path: "/",
		});

		const payload = jwtDecode(accessToken);
		setUser({
			authority: payload.authority,
			cpf: payload.sub,
			name: payload.name,
			id: payload.id,
			unidadeId: payload.unidade,
		});
		toastSuccess("Login efetuado com sucesso!");

		router.push("/processos");
	}

	function logout() {
		destroyCookie(undefined, Constantes.nome_token, { path: "/" });
		destroyCookie(undefined, Constantes.nome_refresh_token, { path: "/" });
		setUser(null);

		router.push("/");
	}

	return (
		<AuthContext.Provider value={{ user, signIn, logout }}>
			{children}
		</AuthContext.Provider>
	);
}
