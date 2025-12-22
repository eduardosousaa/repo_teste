class Posicao {
  late double latitude, longitude;
  Posicao(this.latitude, this.longitude);
  Posicao.fromJson(json){
    this.latitude = json['latitude'];
    this.longitude = json['longitude'];
  }
  Map<String,dynamic> toJson(){
    Map<String,dynamic> json = {
      "latitude" : this.latitude,
      "longitude" : this.longitude,
    };
    return json;
  }
}