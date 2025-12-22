import 'dart:convert';
import 'dart:math';

class GeradorId {
  static String _numeros = "0123456789";
  static String _letras = "ABCDEFGHIJKLMNOPQRSTUVXYZ";

  static String gerarId(int tamanho, {bool somenteNumeros = false}){
    String codigo = "";
    Random random = new Random();
    for (int i = 0; i < tamanho; i++){
      bool numOuLetra = random.nextBool();
      if(somenteNumeros){
        numOuLetra = false;
      }
      //Se numOuLetra = false -> Dígito
      //Se numOuLetra = true -> Letra
      if(numOuLetra){
        bool minusculoMaiusculo = random.nextBool();
        //Se minusculoMaiusculo = false -> minusculo
        //Se minusculoMaiusculo = true -> maiusculo
        String caractere = _letras[random.nextInt(_letras.length)];
        if(minusculoMaiusculo){
          codigo += caractere.toUpperCase();
        }else{
          codigo += caractere.toLowerCase();
        }
      }else{
        codigo += _numeros[random.nextInt(_numeros.length)];
      }
    }
    return codigo;
  }

  static String gerarIdBaseadoEmData(){
    String data = DateTime.now().toIso8601String();
    String dataCodificada = base64Encode(data.codeUnits);
    int tamCodExtra = max(64 - dataCodificada.length, 0);
    if(tamCodExtra > 0){
      return "${gerarId(tamCodExtra)}${dataCodificada}";
    }
    return dataCodificada;
  }

  static String gerarIdBaseadoEmItens(List<String> itens) {
    String mensagem = "";
    for(String item in itens){
      mensagem += item;
    }
    return base64Encode(mensagem.codeUnits);
  }
}