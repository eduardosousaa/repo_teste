import 'package:hive/hive.dart';

class Grupo {
  late int id, idProjeto, fase;
  late String nome;
  Grupo.fromJson(json){
    this.id = json['id'];
    this.idProjeto = json['projectId'];
    this.fase = json['fase'];
    this.nome = json['name'];
  }
  Map<String,dynamic> toJson() {
    Map<String,dynamic> json = {
      "id" : this.id,
      "projectId" : this.idProjeto,
      "fase" : this.fase,
      "name" : this.nome
    };
    return json;
  }
  Future<void> salvarLocal() async {
    var box = await Hive.openBox("grupos");
    box.put(this.id, this.toJson());
  }
}