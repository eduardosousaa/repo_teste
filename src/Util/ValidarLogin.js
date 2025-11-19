import Constantes from "../Constantes/Constantes";
import {parseCookies} from "nookies";


export default class ValidarLogin {
  static hasToken() {
    const { [Constantes.nome_token]: token } = parseCookies();
    return !!token;
  }
}