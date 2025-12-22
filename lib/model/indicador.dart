import 'package:hive/hive.dart';

class Indicador {
  late int id, idProjeto, idGrupo;
  int? idFase;
  late String nome;

  Indicador.fromJson(json){
    this.id = json['id'];
    this.idProjeto = json['projectId'];
    this.idGrupo = json['groupId'];
    this.idFase = json['fase'];
    this.nome = json['name'];
  }
  Map<String,dynamic> toJson() {
    Map<String,dynamic> json = {
      "id" : this.id,
      "projectId" : this.idProjeto,
      "groupId" : this.idGrupo,
      "fase" : this.idFase,
      "name" : this.nome
    };
    return json;
  }
  Future<void> salvarLocal() async {
    var box = await Hive.openBox("indicadores");
    box.put(this.id, this.toJson());
  }
}