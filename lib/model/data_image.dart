import 'dart:typed_data';

class DataImage {
  late int idProjeto;
  late String idLocal;
  int? idServidor, idOcorrencia;
  Uint8List? bytes;
  String? url;
  DateTime? data;
  DataImage();
  DataImage.fromJson(json){
    this.idLocal = json['idLocal'];
    this.idServidor = json['idServidor'];
    this.idProjeto = json['idProjeto'];
    this.bytes = json['bytes'];
    this.data = json['data'] != null ? DateTime.parse(json['data']) : null;
    this.url = json['url'];
    this.idOcorrencia = json['occurrenceId'];
  }
  Map<String,dynamic> toJson() {
    Map<String,dynamic> json = {
      "idLocal" : this.idLocal,
      "idServidor" : this.idServidor,
      "idProjeto" : this.idProjeto,
      "bytes" : this.bytes,
      "data" : this.data?.toIso8601String(),
      "url" : this.url,
      "occurrenceId" : this.idOcorrencia
    };
    return json;
  }
}