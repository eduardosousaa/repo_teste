import 'dart:ui';

import 'package:flutter/material.dart';

class CustomDialog {
  BuildContext context;
  String titulo, descricao;
  String? textoBotaoOK, textoBotaoCancel;
  Color? corTitulo, corDescricao, corBtOK, corBtCancel;
  bool visivel = false;
  Function? onPressButtonOK, onPressButtonCancel;
  double? width;
  bool isDismissible;
  CustomDialog({required this.context, required this.titulo, required this.descricao, this.corTitulo, this.corDescricao, this.textoBotaoOK, this.textoBotaoCancel, this.onPressButtonOK, this.onPressButtonCancel, this.width, this.corBtOK, this.corBtCancel, this.isDismissible = true});

  void mostrar(){
    showDialog(
      context: context,
      barrierDismissible: this.isDismissible,
      builder: (context){
        visivel = true;
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          title: Text("${this.titulo}", style: TextStyle(color: this.corTitulo ?? Colors.black)),
          content: Container(
            width: this.width,
            child: Text("${this.descricao}", style: TextStyle(color: this.corDescricao ?? Colors.black)),
          ),
          actions: [
            Visibility(
              visible: this.onPressButtonCancel != null,
              child: TextButton(
                onPressed: (){
                  Navigator.of(context).pop();
                  this.onPressButtonCancel?.call();
                },
                style: TextButton.styleFrom(
                    foregroundColor: this.corBtCancel
                ),
                child: Text(textoBotaoCancel ?? "Cancelar"),
              ),
            ),
            TextButton(
              onPressed: (){
                Navigator.of(context).pop();
                this.onPressButtonOK?.call();
              },
              style: TextButton.styleFrom(
                foregroundColor: this.corBtOK,
              ),
              child: Text("${textoBotaoOK ?? "OK"}"),
            ),
          ],
        );
      },
    ).then((value){
      visivel = false;
    });
  }

  void fechar(){
    if(visivel){
      Navigator.of(context).pop();
    }
  }
}