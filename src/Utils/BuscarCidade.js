export async function BuscarCidade(city, street = '', state = '') { 
    if (!city || city.trim() === '') {
        console.warn("Nome da cidade não fornecido para BuscarCidade.");
        return null;
    }

    const query = encodeURIComponent(`${street ? `${street}, ` : ''}${city}${state ? `, ${state}` : ''}, Brasil`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&addressdetails=1`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`Erro na requisição Nominatim: ${res.status} ${res.statusText}`);
            return null;
        }
        const data = await res.json();

        if (data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            const address = data[0].address;

            return {
                lat,
                lng,
                address: {
                    road: address.road || '',
                    suburb: address.suburb || address.neighbourhood || address.road || '',
                    city: address.city || address.town || address.village || '',
                    state: address.state || '',
                    postcode: address.postcode || '',
                    house_number: address.house_number || '',
                    house_name: address.house_name || '', 
                    county: address.county || '', 
                }
            };
        } else {
            console.log(`Nenhuma coordenada encontrada para a cidade: ${cidade}` + (rua ? ` e rua: ${rua}` : ''));
            return null;
        }
    } catch (err) {
        console.error("Erro ao buscar cidade por Nominatim:", err);
        return null;
    }
}
