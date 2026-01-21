import Constantes from "Constantes/Constantes";
import { parseCookies } from "nookies";

export default function BuscarDadoPaises(){
  
  const { "token2": token2 } = parseCookies();

  return fetch(Constantes.urlBackAdmin + "api/pais", {
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
                /* if(array.length == 0 || data.nome.abreviado != array[array.length - 1].name){
                  let object = {};
                  object.name = data.nome.abreviado;
                  object.id = data.id['ISO-3166-1-ALPHA-2'];
                  array.push(object);
                } */
                  let object = {};
                  object.name = data.name;
                  object.id = data.name;
                  array.push(object);
              })

              array = array.sort(function (a, b) {
                if (a.name < b.name) {
                  return -1;
                }
                if (a.name > b.name) {
                  return 1;
                }
                return 0;
              });
    
              return array;
           }) 
          .catch((error) => console.log(error))
  
}