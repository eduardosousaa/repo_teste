class Caracterizacao {
  late int id;
  late String tipoRetorno, regulacao, descricao;
  bool instrumentalPlaceholder = false;
  Caracterizacao.fromJson(json){
    this.id = json['id'];
    this.tipoRetorno = json['returnType'];
    this.regulacao = json['regulation'];
    this.descricao = json['description'];
    this.instrumentalPlaceholder = json['instrumentalPlaceholder'];
  }
  Map<String,dynamic> toJson() {
    Map<String,dynamic> json = {
      "id" : this.id,
      "returnType" : this.tipoRetorno,
      "regulation" : this.regulacao,
      "description" : this.descricao,
      "instrumentalPlaceholder" : this.instrumentalPlaceholder,
    };
    return json;
  }
}