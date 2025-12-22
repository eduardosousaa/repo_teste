import 'package:hive/hive.dart';

class Fase {
  late int id, idProjeto;
  late String nome;
  DateTime? dataInicio, dataFim;
  Fase.fromJson(json){
    this.id = json['id'];
    this.idProjeto = json['projectId'];
    this.nome = json['name'];
    this.dataInicio = json['startDate'] != null ? DateTime.parse(json['startDate']) : null;
    this.dataFim = json['endDate'] != null ? DateTime.parse(json['endDate']) : null;
  }
  Map<String,dynamic> toJson() {
    Map<String,dynamic> json = {
      "id" : this.id,
      "projectId" : this.idProjeto,
      "name" : this.nome,
      "dataInicio" : this.dataInicio?.toIso8601String(),
      "endDate" : this.dataFim?.toIso8601String(),
    };
    return json;
  }
  Future<void> salvarLocal() async {
    var box = await Hive.openBox("fases");
    box.put(this.id, this.toJson());
  }
}