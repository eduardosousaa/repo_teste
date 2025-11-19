import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import Constantes from "../Constantes/Constantes";

export default function ValidarLoginPage({ children }) {
	const router = useRouter();
	const [allowed, setAllowed] = useState(false);

	useEffect(() => {
		const { [Constantes.nome_token]: token } = parseCookies();
		if (!token) {
			router.replace("/");
		} else {
			setAllowed(true);
		}
	}, [router]);

	if (!allowed) return null;
	return <>{children}</>;
}
