//idProjeto, idRodovia, idFase, Periodo
//status, nome

import 'package:flutter/material.dart';
import 'package:hive/hive.dart';

class Execucao {
  late int id, idProjeto, idRodovia, idFase;
  late DateTimeRange periodo;
  late String idLocal, nome, status;
  String? descricao;
  Execucao();
  Execucao.fromJson(json){
    this.idLocal = json['idLocal'];
    this.id = json['id'];
    this.idProjeto = json['projectId'];
    this.idRodovia = json['highwayId'];
    this.idFase = json['stepId'];
    this.periodo = DateTimeRange(
      start: DateTime.parse(json['startDate']),
      end: DateTime.parse(json['endDate']),
    );
    this.nome = json['name'];
    this.status = json['status'];
    this.descricao = json['description'];
  }
  Map<String,dynamic> toJson() {
    Map<String,dynamic> json = {
      "idLocal" : this.idLocal,
      "id" : this.id,
      "projectId" : this.idProjeto,
      "highwayId" : this.idRodovia,
      "stepId" : this.idFase,
      "startDate" : this.periodo.start.toIso8601String(),
      "endDate" : this.periodo.end.toIso8601String(),
      "name" : this.nome,
      "status" : this.status,
      "description" : this.descricao
    };
    return json;
  }

  Future<void> salvarLocal() async {
    var box = await Hive.openBox("execucoes");
    box.put(this.idLocal, this.toJson());
  }
}