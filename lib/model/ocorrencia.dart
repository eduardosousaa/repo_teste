import 'package:evvia_appverificador_independente/model/data_image.dart';
import 'package:hive/hive.dart';

import '';

class Ocorrencia {
  late int idProjeto, idExecucao;
  late String tipo, descricao;
  int? idOcorrenciaServidor, idTrecho, idIndicador, idGrupo;
  late DateTime data;
  late int idFase;
  String? idOcorrenciaLocal, nomeTrecho, nomeIndicador, nomeGrupo, nomeFase, pista, sentido;
  late double kmInicial;
  late double latInicial, longInicial;
  double? kmFinal;
  double? latFinal, longFinal;

  List<DataImage> listaImagens = [];

  Ocorrencia();

  Ocorrencia.fromJson(json){
    this.idProjeto = json['idProjeto'];
    this.idExecucao = json['executionId'];
    this.idOcorrenciaLocal = json['idOcorrenciaLocal'];
    this.idOcorrenciaServidor = json['id'];
    this.idTrecho = json['roadSegment']?['id'];
    this.nomeTrecho = json['roadSegment']?['segmentName'];
    this.idIndicador = json['indicator']?['id'];
    this.nomeIndicador = json['indicator']?['name'];
    this.idGrupo = json['indicator']?['groupId'];
    this.nomeGrupo = json['indicator']?['groupName'];
    this.idFase = json['step']?['id'];
    this.nomeFase = json['step']?['name'];
    this.descricao = json['description'];
    this.kmInicial = json['startKm'];
    this.kmFinal = json['endKm'];
    this.latInicial = double.parse("${json['initialCoordinate']['latitude']}");
    this.longInicial = double.parse("${json['initialCoordinate']['longitude']}");
    this.latFinal = json['finalCoordinate'] != null ? double.parse("${json['finalCoordinate']['latitude']}") : null;
    this.longFinal = json['finalCoordinate'] != null ? double.parse("${json['finalCoordinate']['longitude']}") : null;
    this.tipo = json['type'];
    this.pista = json['carriageway'];
    this.sentido = json['lane'];
    this.data = DateTime.parse(json['appCreatedAt']);
    this.listaImagens = List.from(json['imagens'] ?? []).map((e) => DataImage.fromJson(e)).toList();
  }

  Map<String,dynamic> toJson() {
    Map<String,dynamic> json = {
      'idProjeto' : this.idProjeto,
      'executionId' : this.idExecucao,
      'idOcorrenciaLocal' : this.idOcorrenciaLocal,
      'id' : this.idOcorrenciaServidor,
      'roadSegment' : {
        'id' : this.idTrecho,
        'segmentName' : this.nomeTrecho,
      },
      'indicator' : {
        'id' : this.idIndicador,
        'name' :  this.nomeIndicador,
        'groupId' : this.idGrupo,
        'groupName' : this.nomeGrupo,
      },
      "step": {
        "id": this.idFase,
        "name": this.nomeFase,
      },
      'description' : this.descricao,
      "startKm": this.kmInicial,
      "endKm": this.latInicial,
      "initialCoordinate": {
        "longitude": this.longInicial,
        "latitude": this.latInicial,
      },
      "finalCoordinate": {
        "longitude": this.longFinal,
        "latitude": this.latFinal
      },
      'type' : this.tipo,
      'carriageway' : this.pista,
      'lane' : this.sentido,
      'appCreatedAt' : this.data.toIso8601String(),
      'imagens' : this.listaImagens.map((e) => e.toJson()).toList()
    };
    return json;
  }

  Map<String,dynamic> toJsonNuvem() {
    Map<String,dynamic> json = {
      'executionId' : this.idExecucao,
      "type" : this.tipo,
      "description" : this.descricao,
      "carriageway": this.pista,
      "lane": this.sentido,
      "roadSegment": this.idTrecho,
      "startKm": this.kmInicial,
      "endKm": this.kmFinal,
      "initialCoordinate": {
        "latitude": this.latInicial,
        "longitude": this.longInicial
      },
      "step": this.idFase,
      "indicator": this.idIndicador,
      "appCreatedAt": this.data.toIso8601String()
    };
    if(this.latFinal != null && this.longFinal != null){
      json['finalCoordinate'] = {
        "latitude": this.latFinal,
        "longitude": this.longFinal
      };
    }
    return json;
  }

  Future<void> salvarLocal() async {
    var box = await Hive.openBox("ocorrencias");
    box.put(this.idOcorrenciaLocal, this.toJson());
  }
}