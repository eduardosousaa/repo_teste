import 'package:hive/hive.dart';

class Trecho {
  late int id, idProjeto, idRodovia;
  late String nome;
  Trecho.fromJson(json){
    this.id = json['id'];
    this.idProjeto = json['projectId'];
    this.idRodovia = json['highway']['id'];
    this.nome = json['segmentName'];
  }
  Map<String,dynamic> toJson() {
    Map<String,dynamic> json = {
      "id" : this.id,
      "projectId" : this.idProjeto,
      "highway" : {
        'id' : this.idRodovia,
      },
      "segmentName" : this.nome,
    };
    return json;
  }
  Future<void> salvarLocal() async {
    var box = await Hive.openBox("trechos");
    box.put(this.id, this.toJson());
  }
}