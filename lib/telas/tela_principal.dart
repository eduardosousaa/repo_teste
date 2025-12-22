import 'dart:convert';

import 'package:evvia_appverificador_independente/config/constantes.dart';
import 'package:evvia_appverificador_independente/config/variaveis.dart';
import 'package:evvia_appverificador_independente/model/data_image.dart';
import 'package:evvia_appverificador_independente/paginas/pag_cadastro_ocorrencia.dart';
import 'package:evvia_appverificador_independente/paginas/pag_inicial.dart';
import 'package:evvia_appverificador_independente/telas/tela_camera.dart';
import 'package:evvia_appverificador_independente/paginas/pag_lista_ocorrencias.dart';
import 'package:evvia_appverificador_independente/paginas/pag_galeria.dart';
import 'package:evvia_appverificador_independente/telas/tela_login.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:geolocator/geolocator.dart';
import 'package:hive/hive.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../helper/custom_snackbar.dart';

class TelaPrincipal extends StatefulWidget {
  TelaPrincipal({Key? key}) : super(key: key);

  @override
  State<TelaPrincipal> createState() => _TelaPrincipalState();
}

class _TelaPrincipalState extends State<TelaPrincipal> with AutomaticKeepAliveClientMixin {

  int _pagAtual = 0;

  @override
  void initState() {
    super.initState();
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 1,
        toolbarHeight: 60,
        title: Row(
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            Container(
              height: 32,
              width: 32,
              decoration: BoxDecoration(
                color: Cores.COR_VERDE,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.paste, color: Cores.COR_BRANCO,),
            ),
            Container(
              margin: EdgeInsets.only(left: 12),
              child: Text(_getTitlePag(_pagAtual)),
            )
          ],
        ),
        actions: [
          IconButton(
            onPressed: () async {
              SharedPreferences prefs = await SharedPreferences.getInstance();
              bool sucesso = await prefs.remove("dados_login");
              if(sucesso){
                Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => TelaLogin()));
              }
            },
            icon: Icon(Icons.logout),
          )
        ],
      ),
      body: IndexedStack(
        index: _pagAtual,
        children: [
          PagInicial(selecionarPag: _selecionarPag),
          Container(),
          Variaveis.execucao != null ? PagGaleria(
            key: ValueKey(UniqueKey().toString()),
          ) : Container(),
          Variaveis.execucao != null ? PagCadastroOcorrencia(
            key: ValueKey(UniqueKey().toString()),
            selecionarPag: _selecionarPag,
          ) : Container(),
          Variaveis.execucao != null ? PagListaOcorrencias(
            key: ValueKey(UniqueKey().toString()),
            selecionarPag: _selecionarPag,
          ) : Container(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _pagAtual > 2 ? 0 : _pagAtual,
        onTap: (pag) async {
          if(Variaveis.execucao == null){
            CustomSnackbar.mostrarMensagem(context, "Nenhuma execução selecionada", CustomSnackbar.TIPO_INFO);
          } else if(pag == 1){
            bool permissaoLocalizacaoConcedida = await _verificarPermissaoLocalizacao();
            if(permissaoLocalizacaoConcedida){
              final ByteData data = await rootBundle.load("imagens/logo_evvia.png");
              Uint8List bytesMDagua = data.buffer.asUint8List();
              List<DataImage>? imagens = await Navigator.push(context, MaterialPageRoute(builder: (context) => TelaCamera(bytesMarcaDagua: bytesMDagua)));
              if(imagens != null){
                var boxImagens = await Hive.openBox("imagens_avulsas");
                for(DataImage imagem in imagens){
                  await boxImagens.put(imagem.idLocal, imagem.toJson());
                }
                setState(() {
                  _pagAtual = 0;
                });
              }
            }
          }else{
            _selecionarPag(pag);
          }
        },
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_rounded),
            label: "Home",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.camera_alt_outlined),
            label: "Câmera",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.photo_library),
            label: "Galeria",
          ),
        ],
      ),
    );
  }

  void _selecionarPag(int pag){
    if(_pagAtual != pag){
      setState(() {
        if(_pagAtual != 4){
          Variaveis.ocorrenciaEdicao = null;
        }
        _pagAtual = pag;
      });
    }
  }
  
  String _getTitlePag(int pag){
    switch(pag){
      case 0:
        return "Ocorrências";
      case 1:
        return "Câmera";
      case 2:
        return "Galeria";
      case 3:
        return "Nova ocorrências";
      case 4:
        return "Listagem";
      default:
        return "";
    }
  }

  Future<bool> _verificarPermissaoLocalizacao() async {
    bool serviceEnabled;
    LocationPermission permission;

    // Test if location services are enabled.
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      // Location services are not enabled don't continue
      // accessing the position and request users of the
      // App to enable the location services.
      CustomSnackbar.mostrarMensagem(context, 'O serviço de localização não está ativado.', CustomSnackbar.TIPO_ERRO);
      return false;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        // Permissions are denied, next time you could try
        // requesting permissions again (this is also where
        // Android's shouldShowRequestPermissionRationale
        // returned true. According to Android guidelines
        // your App should show an explanatory UI now.
        CustomSnackbar.mostrarMensagem(context, 'A permissão de localização foi negada.', CustomSnackbar.TIPO_ERRO);
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      // Permissions are denied forever, handle appropriately.
      CustomSnackbar.mostrarMensagem(context, 'As permissões de localização foram negadas permanentemente, não podemos solicitar permissões.', CustomSnackbar.TIPO_ERRO);
      return false;
    }
    return true;
  }

  @override
  // TODO: implement wantKeepAlive
  bool get wantKeepAlive => true;
}
