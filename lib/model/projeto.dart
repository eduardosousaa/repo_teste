import 'package:hive/hive.dart';

class Projeto {
  late int id;
  late String nome;
  Projeto.fromJson(json){
    this.id = json['id'];
    this.nome = json['name'];
  }
  Map<String,dynamic> toJson() {
    Map<String,dynamic> json = {
      "id" : this.id,
      "name" : this.nome,
    };
    return json;
  }
  Future<void> salvarLocal() async {
    var box = await Hive.openBox("projetos");
    box.put(this.id, this.toJson());
  }
}