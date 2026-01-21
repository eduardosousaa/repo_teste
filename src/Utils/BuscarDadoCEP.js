
export default function BuscarDadoCEP(cep){

    if(cep.length >= 9){
      cep = cep.split('-')[0] + cep.split('-')[1];
      return fetch("https://viacep.com.br/ws/" + cep + "/json", {
                  method: "GET",
                  headers: {
                      "Accept": "application/json",
                      "Content-Type": "application/json",
                  },
              })
              .then((response) => response.json())
              .then((responseJSON) => { return responseJSON}) 
              .catch((error) => console.log(error))
    }else{
        return null;
    }


}