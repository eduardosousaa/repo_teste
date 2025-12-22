import 'package:hive/hive.dart';

class Rodovia {
  late int id, idProjeto;
  late String codigo;
  Rodovia.fromJson(json){
    this.id = json['id'];
    this.idProjeto = json['projectId'];
    this.codigo = json['code'];
  }
  Map<String,dynamic> toJson() {
    Map<String,dynamic> json = {
      "id" : this.id,
      "projectId" : this.idProjeto,
      "code" : this.codigo
    };
    return json;
  }
  Future<void> salvarLocal() async {
    var box = await Hive.openBox("rodovias");
    box.put(this.id, this.toJson());
  }
}