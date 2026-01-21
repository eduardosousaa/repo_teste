import Constantes from '../Constantes';
import { parseCookies } from 'nookies';


export const fetchData = async (
    route,
    module,
    params = {},
    dataMapper = (data) => data,
    options = {}
) => {
    const { token2 } = parseCookies();
    const { setLoading, showAlert } = options;

    if (setLoading) setLoading(true);
    try {
        const queryParams = new URLSearchParams(params).toString();
        const url = `${Constantes.urlBackAdmin}${route}${queryParams ? `?${queryParams}` : ''}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Module": module,
                "Authorization": token2
            }
        });

        console.log(`Resposta da requisição (status): ${response.status}`);

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`Erro ao buscar dados da rota '${route}':`, errorData);
            if (showAlert) {
                showAlert("danger", `Erro ao carregar dados: ${errorData.message || response.statusText}`);
            }
            return []; 
        }

        const bodyData = await response.json();
        console.log(`Dados recebidos do back-end da rota '${route}':`, bodyData);
        const mappedData = dataMapper(bodyData);
        console.log(`Dados formatados da rota '${route}':`, mappedData);
        return mappedData;

    } catch (error) {   
        console.error(`Erro na requisição para a rota '${route}':`, error);
        if (showAlert) {
            showAlert(`Erro de conexão ao carregar dados para '${route}'. Tente novamente.`);
        }
        return []; 
    } finally {
        if (setLoading) setLoading(false);
        console.log(`Requisição finalizada para a rota '${route}'.`);
    }
};