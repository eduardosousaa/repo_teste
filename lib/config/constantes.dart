import 'dart:ui';

class Cores {
  static const Color COR_BRANCO = Color.fromARGB(255, 255, 255, 255);
  static const Color COR_BRANCO_GELO = Color.fromARGB(255, 229, 231, 235);
  static const Color COR_PRETO = Color.fromARGB(255, 0, 0, 0);
  static const Color COR_CINZA = Color.fromARGB(255, 199, 200, 201);
  static const Color COR_CINZA_CLARO = Color.fromARGB(255, 229, 229, 229);
  static const Color COR_CINZA_ESCURO = Color.fromARGB(255, 114, 115, 119);
  static const Color COR_VERDE = Color.fromARGB(255, 43, 149, 147);
  static const Color COR_CIANO = Color.fromARGB(255, 58, 151, 195);
  static const Color COR_LARANJA = Color.fromARGB(255, 234, 113, 62);
  static const Color COR_VERMELHO = Color.fromARGB(255, 217, 0, 30);
}

class Api {
  static String _ambiente = "H";
  static String? tokenAcesso;
  static String getUrlBase() {
    if(_ambiente == "H"){
      return "https://evvia-dev.smartdatasolutions.com.br";
    }else{
      return "";
    }
  }
}