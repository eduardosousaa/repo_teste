import Constantes from "../Constantes/Constantes";
import { parseCookies } from "nookies";
import { fetchJsonWithAuth } from "./AuthFetch";

export default function FetchDadoSelect(url, setDado, setLoading) {
	fetchJsonWithAuth(Constantes.url + url, { method: "GET" })
		.then((dado) => {
			setDado(dado); 
		})
		.catch((error) => {
			console.error("FetchDadoSelect error:", error);
		})
		.finally(() => {
			if (setLoading) setLoading(false);
		});
}
