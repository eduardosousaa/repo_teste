import 'dart:convert';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:evvia_appverificador_independente/config/conectividade.dart';
import 'package:evvia_appverificador_independente/config/constantes.dart';
import 'package:evvia_appverificador_independente/helper/custom_dialog.dart';
import 'package:evvia_appverificador_independente/helper/gerador_id.dart';
import 'package:evvia_appverificador_independente/model/data_image.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:hive/hive.dart';

import '../config/variaveis.dart';

class PagGaleria extends StatefulWidget {
  PagGaleria({Key? key}) : super(key: key);

  @override
  State<PagGaleria> createState() => _PagGaleriaState();
}

class _PagGaleriaState extends State<PagGaleria> {

  List<DataImage> _listaImagens = [];
  bool _sincronizando = false;
  double _percentualSincronizacao = 0;

  @override
  void initState() {
    super.initState();
    WidgetsFlutterBinding.ensureInitialized().addPostFrameCallback((timeStamp) async {
      if(await Conectividade.isConectado()){
        await _buscarImagensNuvem();
      }
      await _carregarImagensSalvas();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Expanded(
            child: Container(
              margin: EdgeInsets.only(left: 12, right: 12),
              child: GridView.builder(
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 1,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                ),
                itemCount: _listaImagens.length,
                itemBuilder: (context, idx) {
                  DataImage dataImage = _listaImagens[idx];
                  return Card(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Stack(
                      children: [
                        _getImage(dataImage),
                        Align(
                          alignment: Alignment.bottomRight,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 32,
                                height: 32,
                                margin: EdgeInsets.only(bottom: 4, right: 4),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(32/2),
                                  color: Cores.COR_VERMELHO,
                                ),
                                child: IconButton(
                                  onPressed: () async {
                                    _mostrarDialogExclusao(dataImage, idx);
                                  },
                                  color: Cores.COR_BRANCO,
                                  iconSize: 16,
                                  icon: Icon(Icons.delete_forever),
                                ),
                              ),
                              Visibility(
                                visible: dataImage.idServidor == null,
                                child: Container(
                                  width: 32,
                                  height: 32,
                                  margin: EdgeInsets.only(bottom: 4, right: 4),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(32/2),
                                    color: Cores.COR_VERDE,
                                  ),
                                  child: IconButton(
                                    onPressed: () async {
                                      List<Map<String,dynamic>> dadosImagemServidor = await _enviarImagemNuvem(dataImage);
                                      if(dadosImagemServidor.isNotEmpty){
                                        dataImage.idServidor = dadosImagemServidor.first['id'];
                                        dataImage.url = "${Api.getUrlBase()}/api/v1/projetos/${Variaveis.idProjetoSelecionado}/imagens-avulsas/${dadosImagemServidor.first['id']}";
                                        _listaImagens[idx] = dataImage;
                                        await _atualizarImagemBanco(dataImage);
                                        setState(() {});
                                      }
                                    },
                                    color: Cores.COR_BRANCO,
                                    iconSize: 16,
                                    icon: Icon(Icons.cloud_upload),
                                  ),
                                ),
                              )
                            ],
                          ),
                        )
                      ],
                    ),
                  );
                },
              ),
            ),
          ),
          Visibility(
            visible: _sincronizando,
            child: Container(
              margin: EdgeInsets.only(left: 12, right: 12, top: 12,),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    child: Text("Sincronizando..."),
                  ),
                  Container(
                    margin: EdgeInsets.only(top: 4),
                    child: LinearProgressIndicator(
                      minHeight: 28,
                      borderRadius: BorderRadius.circular(8),
                      backgroundColor: Cores.COR_CINZA,
                      color: Cores.COR_VERDE,
                      value: _percentualSincronizacao,
                    ),
                  ),
                ],
              ),
            ),
          ),
          Container(
            margin: EdgeInsets.all(12),
            height: 45,
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _listaImagens.where((i) => i.idServidor == null).isNotEmpty ? () async {
                List<DataImage> imagensNaoEnviadas = _listaImagens.where((i) => i.idServidor == null).toList();
                setState(() {
                  _sincronizando = true;
                  _percentualSincronizacao = 0;
                });
                for(int i = 0; i < imagensNaoEnviadas.length; i++){
                  DataImage img = imagensNaoEnviadas[i];
                  List<Map<String,dynamic>> dadosImagemServidor = await _enviarImagemNuvem(img);
                  if(dadosImagemServidor.isNotEmpty){
                    img.idServidor = dadosImagemServidor.first['id'];
                    img.url = "${Api.getUrlBase()}/api/v1/projetos/${Variaveis.idProjetoSelecionado}/imagens-avulsas/${dadosImagemServidor.first['id']}";
                    int idx = _listaImagens.indexWhere((i) => i.idLocal == img.idLocal);
                    await _atualizarImagemBanco(img);
                    _listaImagens[idx] = img;
                    setState(() {
                      _percentualSincronizacao = (i+1)/imagensNaoEnviadas.length;
                    });
                  }
                }
                setState(() {
                  _sincronizando = false;
                });
              } : null,
              label: Text("Sincronizar tudo"),
              icon: Icon(Icons.cloud_upload),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _carregarImagensSalvas() async {
    var boxImagens = await Hive.openBox("imagens_avulsas");
    List<DataImage> imagensBanco = boxImagens.values.map((e) => DataImage.fromJson(e)).toList();
    imagensBanco.removeWhere((i) => _listaImagens.any((imgNuvem) => imgNuvem.idServidor == i.idServidor));
    setState(() {
      _listaImagens.addAll(imagensBanco);
    });
  }

  Future<void> _buscarImagensNuvem() async {
    Map<String,String> cabecalho = {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer ${Api.tokenAcesso}"
    };
    Uri uri = Uri.parse("${Api.getUrlBase()}/api/v1/projetos/${Variaveis.idProjetoSelecionado}/imagens-avulsas");
    try{
      http.Response response = await http.get(uri, headers: cabecalho);
      if(response.statusCode == 200){
        Map<String,dynamic> dados = jsonDecode(response.body);
        print("... Listando imagens ...");
        print(dados);
        DateTime data = DateTime.now();
        List<int> _idsImagensServidor = [];
        for(Map<String,dynamic> image in dados['content']){
          DataImage dataImage = DataImage();
          dataImage.idLocal = GeradorId.gerarIdBaseadoEmItens([Variaveis.idProjetoSelecionado!.toString(), image['id'].toString(), data.millisecondsSinceEpoch.toString()]);
          dataImage.idProjeto = Variaveis.idProjetoSelecionado!;
          dataImage.idServidor = image['id'];
          dataImage.url = "${Api.getUrlBase()}/api/v1/projetos/${Variaveis.idProjetoSelecionado}/imagens-avulsas/${image['id']}";
          dataImage.idOcorrencia = image['occurrenceId'];

          _idsImagensServidor.add(image['id']);
          if(!_listaImagens.any((img) => img.idServidor == dataImage.idServidor)){
            await _atualizarImagemBanco(dataImage);
            _listaImagens.add(dataImage);
          }
        }
        //Remover as imagens que não estão mais na núvem
        for(DataImage imagem in _listaImagens){
          if(imagem.idServidor != null && !_idsImagensServidor.contains(imagem.idServidor)){
            await _removerImagemLocal(imagem.idLocal);
            _listaImagens.removeWhere((img) => img.idLocal == imagem.idLocal);
          }
        }
        setState(() {});
      }else{
        print(response.body);
      }
    }catch(e){
      print(e.toString());
    }
  }

  Future<List<Map<String,dynamic>>> _enviarImagemNuvem(DataImage dataImage) async {
    Uri uri = Uri.parse("${Api.getUrlBase()}/api/v1/projetos/${Variaveis.idProjetoSelecionado}/imagens-avulsas");
    // Cria a requisição multipart
    var request = http.MultipartRequest("POST", uri);
    // Headers com autenticação
    request.headers.addAll({
      "Authorization" : "Bearer ${Api.tokenAcesso}",
      "Content-Type": "multipart/form-data", // geralmente opcional, ele seta automático
    });

    request.files.add(
      http.MultipartFile.fromBytes(
        "imagens",
        dataImage.bytes!,
        filename: "${dataImage.idLocal}.png",
        contentType: MediaType('image', 'png')
      )
    );
    try{
      // Envia a requisição
      var response = await request.send();
      // Lê o corpo da resposta
      var dados = await response.stream.bytesToString();
      if (response.statusCode == 201) {
        return List.castFrom<dynamic,Map<String,dynamic>>(jsonDecode(dados));
      } else {
        print('Erro no upload: ${response.statusCode}');
        print('Resposta: $dados');
      }
    }catch(e){
      print(e.toString());
    }
    return [];
  }

  Future<void> _atualizarImagemBanco(DataImage dataImage) async {
    var boxImagens = await Hive.openBox("imagens_avulsas");
    await boxImagens.put(dataImage.idLocal, dataImage.toJson());
  }

  Future<bool> _removerImagemLocal(String idImagemLocal) async {
    var boxImagens = await Hive.openBox("imagens_avulsas");
    await boxImagens.delete(idImagemLocal);
    return true;
  }
  Future<bool> _removerImagemNuvem(int idImagemServidor) async {
    Map<String,String> cabecalho = {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer ${Api.tokenAcesso}"
    };
    Map<String,dynamic> dados = {
      "imageIds" : [idImagemServidor]
    };
    Uri uri = Uri.parse("${Api.getUrlBase()}/api/v1/projetos/${Variaveis.idProjetoSelecionado}/imagens-avulsas");
    try{
      http.Response response = await http.delete(uri, headers: cabecalho, body: jsonEncode(dados));
      if(response.statusCode == 200){
        return true;
      }else{
        print(response.body);
      }
    }catch(e){
      print(e.toString());
    }
    return false;
  }

  Widget _getImage(DataImage dataImage){
    if(dataImage.bytes != null){
      return Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          image: DecorationImage(
            fit: BoxFit.cover,
            image: MemoryImage(dataImage.bytes!),
          ),
        ),
      );
    }else if(dataImage.url != null){
      return Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          image: DecorationImage(
            fit: BoxFit.cover,
            image: CachedNetworkImageProvider(
              dataImage.url!,
              headers: {
                "Authorization" : "Bearer ${Api.tokenAcesso}"
              }
            ),
          ),
        ),
      );
    }else{
      return Container();
    }
  }

  Future<void> _mostrarDialogExclusao(DataImage dataImage, int idx) async {
    showDialog(
      context: context,
      builder: (ctx){
        return AlertDialog(
          title: Text("Atenção"),
          content: Container(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  child: Text("Esta ação é irreverssível, deseja realmente continuar?"),
                ),
                Visibility(
                  visible: dataImage.idServidor != null,
                  child: Container(
                    margin: EdgeInsets.only(top: 4),
                    child: Text("Esta imagem também será deletada do servidor caso esteja conectado a internet."),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: (){
                Navigator.of(context).pop();
              },
              child: Text("Cancelar"),
            ),
            TextButton(
              onPressed: () async {
                await _removerImagemLocal(dataImage.idLocal);
                if(dataImage.idServidor != null){
                  await _removerImagemNuvem(dataImage.idServidor!);
                }
                setState(() {
                  _listaImagens.removeAt(idx);
                });
                Navigator.of(context).pop();
              },
              child: Text("Sim"),
            ),
          ],
        );
      }
    );
  }


}
