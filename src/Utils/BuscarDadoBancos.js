import Constantes from "../Constantes";
import { parseCookies } from "nookies";


export default function BuscarDadoBancos(){

  const { "token2": token2 } = parseCookies();

  /* return fetch("https://brasilapi.com.br/api/banks/v1", { */
  return fetch(Constantes.urlBackAdmin + "types/bank", {
              method: "GET",
              headers: {
                  "Accept": "application/json",
                  "Content-Type": "application/json",
                  "Module": "ADMINISTRATION",
                  "Authorization": token2
              },
          })
          .then((response) => response.json())
          .then((responseJSON) => {
              let array = [];
              responseJSON.forEach((data,_) => {
                let object = {};
                object.name = data.name;
                object.id = data.name;
                array.push(object);
              })

              let index = array.findIndex(a => a.name == "Banco Bradesco S.A."); 
              array = array_move(array,index,0);
              let index1 = array.findIndex(a => a.name == "Banco do Brasil S.A."); 
              array = array_move(array,index1,1);
              let index2 = array.findIndex(a => a.name == "Banco BTG Pactual S.A."); 
              array = array_move(array,index2,2);
              let index3 = array.findIndex(a => a.name ==  "BANCO COOPERATIVO SICOOB S.A. - BANCO SICOOB"); 
              array = array_move(array,index3,3); 
              let index4 = array.findIndex(a => a.name ==  "Banco Inter S.A."); 
              array = array_move(array,index4,4);
              let index5 = array.findIndex(a => a.name == "BANCO SANTANDER (BRASIL) S.A."); 
              array = array_move(array,index5,5);
              let index6 = array.findIndex(a => a.name == "CAIXA ECONOMICA FEDERAL"); 
              array = array_move(array,index6,6);
              let index7 = array.findIndex(a => a.name == "ITAÚ UNIBANCO S.A.");
              array = array_move(array,index7,7);
              let index8 = array.findIndex(a => a.name == "NU PAGAMENTOS S.A. - INSTITUIÇÃO DE PAGAMENTO");
              array = array_move(array,index8,8);
             
              return array;
           }) 
          .catch((error) => console.log(error))
  
}