import Constantes from "../Constantes/Constantes";
import { fetchJsonWithAuth } from "./AuthFetch";

export default function fetchSelectPaged(
  url,
  setDado,
  setLoading,
  pagina = 0,
  qntd = 20,
  nome = ""
) {
  let queryParams = `?pagina=${pagina}&qntd=${qntd}`;
  if (nome && nome.trim() !== "") {
    queryParams += `&nome=${encodeURIComponent(nome)}`;
  }

  fetchJsonWithAuth(Constantes.url + url + queryParams, { method: "GET" })
    .then((dado) => {
      setDado((prev) => {
        if (pagina === 0) {
          return dado.content || [];
        }
        return [...(prev || []), ...(dado.content || [])];
      });
      if (setLoading) setLoading(false);
    })
    .catch((error) => {
      console.error(error);
      if (setLoading) setLoading(false);
    });
}
