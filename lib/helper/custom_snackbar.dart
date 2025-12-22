import 'package:flutter/material.dart';

import '../config/constantes.dart';

class CustomSnackbar {
  static const int TIPO_SUCESSO = 1;
  static const int TIPO_ERRO = 2;
  static const int TIPO_ALERTA = 3;
  static const int TIPO_INFO = 4;
  static bool isVisible = false;
  static Future<void> mostrarMensagem(BuildContext context, String msg, int tipo, {double offsetTop = 0, Duration duracao = const Duration(seconds: 3)}) async {
    if(duracao != Duration.zero){
      Future.delayed(duracao, () {
        if(isVisible && context.mounted){
          Navigator.of(context).pop();
        }
      });
    }
    isVisible = true;
    await showDialog(
      context: context,
      builder: (context){
        return AlertDialog(
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(width: 1, color: _getCorTipo(tipo))
          ),
          contentPadding: EdgeInsets.only(left: 12),
          alignment: Alignment.topCenter,
          content: Container(
            width: MediaQuery.of(context).size.width,
            child: Row(
              children: [
                Container(
                  margin: EdgeInsets.only(right: 12),
                  child: Icon(_getIconeTipo(tipo), color: _getCorTipo(tipo)),
                ),
                Expanded(
                  child: Container(
                    padding: EdgeInsets.only(top: 8, bottom: 8),
                    child: Text(msg, style: TextStyle(color: _getCorTipo(tipo))),
                  ),
                ),
                Container(
                  child: IconButton(
                    onPressed: (){
                      Navigator.pop(context);
                    },
                    icon: Icon(Icons.close_rounded),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
    isVisible = false;
  }

  static Color _getCorTipo(int tipo){
    switch(tipo){
      case TIPO_SUCESSO:
        return Colors.green;
      case TIPO_ERRO:
        return Colors.red;
      case TIPO_ALERTA:
        return Colors.orange;
      case TIPO_INFO:
        return Colors.blue;
      default:
        return Colors.black;
    }
  }

  static IconData _getIconeTipo(int tipo){
    switch(tipo){
      case TIPO_SUCESSO:
        return Icons.check_circle;
      case TIPO_ERRO:
        return Icons.dangerous;
      case TIPO_ALERTA:
        return Icons.warning;
      case TIPO_INFO:
        return Icons.info;
      default:
        return Icons.circle;
    }
  }
}