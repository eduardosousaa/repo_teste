import 'dart:convert';

import 'package:camera/camera.dart';
import 'package:dotted_border/dotted_border.dart';
import 'package:evvia_appverificador_independente/config/conectividade.dart';
import 'package:evvia_appverificador_independente/helper/custom_snackbar.dart';
import 'package:evvia_appverificador_independente/helper/gerador_id.dart';
import 'package:evvia_appverificador_independente/model/caracterizacao.dart';
import 'package:evvia_appverificador_independente/model/data_image.dart';
import 'package:evvia_appverificador_independente/model/grupo.dart';
import 'package:evvia_appverificador_independente/model/indicador.dart';
import 'package:evvia_appverificador_independente/model/ocorrencia.dart';
import 'package:evvia_appverificador_independente/model/posicao.dart';
import 'package:evvia_appverificador_independente/model/trecho.dart';
import 'package:evvia_appverificador_independente/telas/tela_camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:geolocator/geolocator.dart';
import 'package:hive/hive.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:http_parser/http_parser.dart';

import '../config/constantes.dart';
import '../config/variaveis.dart';
import '../model/fase.dart';

class PagCadastroOcorrencia extends StatefulWidget {
  void Function(int) selecionarPag;
  PagCadastroOcorrencia({Key? key, required this.selecionarPag}) : super(key: key);

  @override
  State<PagCadastroOcorrencia> createState() => _PagCadastroOcorrenciaState();
}

class _PagCadastroOcorrenciaState extends State<PagCadastroOcorrencia> {

  DateTime _data = DateTime.now();
  List<Grupo> _listaGrupos = [];
  int? _idGrupoSelecionado;
  List<Indicador> _listaIndicadores = [];
  int? _idIndicadorSelecionado;
  List<Caracterizacao> _caracterizacoes = [];
  List<Trecho> _listaTrechos = [];
  int? _idTrecho;

  List<DataImage> _fotosCapturadas = [];

  Map<String,String> _mapaPistas = {
    "FT01" : "Pista simples",
    "FT01/FT02" : "Pista simples com 3ª faixa",
    "FT02" : "Pista dupla",
    "FD" : "Faixa de domínio",
    "CC" : "Canteiro central",
    "AC" : "Acostamento"
  };

  Map<String,String> _mapaSentidos = {
    "CRESCENTE" : "Crescente",
    "DECRESCENTE" : "Decrescente",
  };

  Map<String,String> _mapaTipoOco = {
    "INDICADOR" : "Indicador",
    "ANOTACAO_CAMPO" : "Anotação de campo",
    "PONTO_NOTAVEL" : "Ponto notável"
  };

  String? _pista, _sentido, _tipoOco;

  late CameraController controller;

  Posicao? _posIni, _posFinal;

  TextEditingController _tecDesc = TextEditingController();
  TextEditingController _tecKmIni = TextEditingController();
  TextEditingController _tecKmFim = TextEditingController();

  DateFormat _dateFormat = DateFormat("dd/MM/yyyy");

  @override
  void initState() {
    super.initState();
    _carregarDadosIniciais();
    WidgetsFlutterBinding.ensureInitialized().addPostFrameCallback((timeStamp) async {
      if(Variaveis.ocorrenciaEdicao != null){
        if(await Conectividade.isConectado()){
          await _listarTrechosNuvem();
          await _listarIndicadoresNuvem(Variaveis.idProjetoSelecionado!, Variaveis.ocorrenciaEdicao!.idGrupo!, Variaveis.idFase!);
          await _listarCaracterizacoesNuvem();
        }else{
          await _listarTrechosLocal(Variaveis.idProjetoSelecionado!, Variaveis.idRodovia!);
          await _listarIndicadoresLocal(Variaveis.idProjetoSelecionado!, Variaveis.ocorrenciaEdicao!.idGrupo!, Variaveis.idFase!);
          //await _listarCaracterizacoesLocal();
        }
        _data = Variaveis.ocorrenciaEdicao!.data;
        _tecKmIni.text = Variaveis.ocorrenciaEdicao!.kmInicial.toString();
        _posIni = Posicao(Variaveis.ocorrenciaEdicao!.latInicial, Variaveis.ocorrenciaEdicao!.longInicial);
        _tecKmFim.text = Variaveis.ocorrenciaEdicao!.kmFinal != null ? Variaveis.ocorrenciaEdicao!.kmFinal.toString() : "";
        _posFinal = Variaveis.ocorrenciaEdicao!.latFinal != null && Variaveis.ocorrenciaEdicao!.longFinal != null ? Posicao(Variaveis.ocorrenciaEdicao!.latFinal!, Variaveis.ocorrenciaEdicao!.longFinal!) : null;
        _idTrecho = Variaveis.ocorrenciaEdicao!.idTrecho;
        _tipoOco = Variaveis.ocorrenciaEdicao!.tipo;
        _idGrupoSelecionado = Variaveis.ocorrenciaEdicao!.idGrupo;
        _idIndicadorSelecionado = Variaveis.ocorrenciaEdicao!.idIndicador;
        _pista = Variaveis.ocorrenciaEdicao!.pista;
        _sentido = Variaveis.ocorrenciaEdicao!.sentido;
        _tecDesc.text = Variaveis.ocorrenciaEdicao!.descricao;
        setState(() {});
      }else{

      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        padding: EdgeInsets.all(24),
        child: Column(
          children: [
            Container(
              alignment: Alignment.centerLeft,
              child: Text("Data", style: TextStyle(fontWeight: FontWeight.bold),),
            ),
            Container(
              child: TextField(
                controller: TextEditingController(text: _data != null ? _dateFormat.format(_data) : ""),
                readOnly: true,
                onTap: () async {
                  DateTime? data = await showDatePicker(
                    context: context,
                    initialDate: _data,
                    firstDate: DateTime(1900),
                    lastDate: DateTime(2200),
                  );
                  if(data != null){
                    setState(() {
                      _data = data;
                    });
                  }
                },
                decoration: InputDecoration(
                  suffixIcon: Icon(Icons.arrow_drop_down_sharp),
                ),
              ),
            ),

            Container(
              margin: EdgeInsets.only(top: 12,),
              child: Row(
                spacing: 12,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          margin: EdgeInsets.only(top: 4),
                          child: Text("km inicial", style: TextStyle(fontWeight: FontWeight.bold),),
                        ),
                        Container(
                          child: TextField(
                            controller: _tecKmIni,
                            keyboardType: TextInputType.number,
                            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                          ),
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("Coordenada inicial", style: TextStyle(fontWeight: FontWeight.bold),),
                        Container(
                          margin: EdgeInsets.only(top: 4),
                          child: TextField(
                            controller: TextEditingController(text: _posIni != null ? "(${_posIni!.latitude},${_posIni!.longitude})" : ""),
                            readOnly: true,
                          ),
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),
            Container(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                onPressed: () async {
                  Position? local = await _determinePosition();
                  if(local != null){
                    _buscarSegmentoMaisProx(local.latitude, local.longitude);
                  }
                },
                style: TextButton.styleFrom(
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)
                  ),
                  backgroundColor: Cores.COR_VERDE.withAlpha(40),
                  foregroundColor: Cores.COR_VERDE,
                  iconColor: Cores.COR_VERDE,
                ),
                icon: Icon(Icons.gps_fixed),
                label: Text("Capturar"),
              ),
            ),

            Container(
              margin: EdgeInsets.only(top: 12),
              child: Row(
                spacing: 12,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          child: Text("km final", style: TextStyle(fontWeight: FontWeight.bold),),
                        ),
                        Container(
                          margin: EdgeInsets.only(top: 4),
                          child: TextField(
                            controller: _tecKmFim,
                            keyboardType: TextInputType.number,
                            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                          ),
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("Coordenada final", style: TextStyle(fontWeight: FontWeight.bold),),
                        Container(
                          margin: EdgeInsets.only(top: 4),
                          child: TextField(
                            controller: TextEditingController(text: _posFinal != null ? "(${_posFinal!.latitude},${_posFinal!.longitude})" : ""),
                            readOnly: true,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            Container(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                onPressed: () async {
                  Position? local = await _determinePosition();
                  if(local != null){
                    setState(() {
                      _posFinal = Posicao(local.latitude, local.longitude);
                    });
                  }
                },
                style: TextButton.styleFrom(
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)
                  ),
                  backgroundColor: Cores.COR_VERDE.withAlpha(40),
                  foregroundColor: Cores.COR_VERDE,
                  iconColor: Cores.COR_VERDE,
                ),
                icon: Icon(Icons.gps_fixed),
                label: Text("Capturar"),
              ),
            ),

            Container(
              margin: EdgeInsets.only(top: 12,),
              child: Row(
                spacing: 12,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          alignment: Alignment.centerLeft,
                          margin: EdgeInsets.only(top: 12,),
                          child: Text("Segmento homogêneo", style: TextStyle(fontWeight: FontWeight.bold,),),
                        ),
                        Container(
                          margin: EdgeInsets.only(top: 4),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Cores.COR_CINZA, width: 2,),
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton(
                              value: _idTrecho,
                              items: _listaTrechos.map((t) {
                                return DropdownMenuItem<int>(
                                  value: t.id,
                                  child: Text("${t.nome}"),
                                );
                              }).toList(),
                              isExpanded: true,
                              padding: EdgeInsets.only(left: 12, right: 8),
                              borderRadius: BorderRadius.circular(8),
                              hint: Text("Selecione o segmento"),
                              onChanged: _idTrecho == null ? (value){
                                setState(() {
                                  //_idTrecho = value;
                                });
                              } : null,

                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            Container(
              alignment: Alignment.centerLeft,
              margin: EdgeInsets.only(top: 12,),
              child: Text("Tipo de ocorrência", style: TextStyle(fontWeight: FontWeight.bold,),),
            ),
            Align(
              alignment: Alignment.centerLeft,
              child: Container(
                margin: EdgeInsets.only(top: 4),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Cores.COR_CINZA, width: 2,),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton(
                    value: _tipoOco,
                    borderRadius: BorderRadius.circular(8),
                    items: _mapaTipoOco.keys.map((e) {
                      return DropdownMenuItem<String>(value: e, child: Text("${_mapaTipoOco[e]}"));
                    }).toList(),
                    isExpanded: true,
                    padding: EdgeInsets.only(left: 12, right: 8),
                    hint: Text("Selecione o tipo de ocorrência"),
                    onChanged: (value){
                      setState(() {
                        _tipoOco = value!;
                      });
                    },
                  ),
                ),
              ),
            ),

            Container(
              alignment: Alignment.centerLeft,
              margin: EdgeInsets.only(top: 12,),
              child: Text("Grupo de indicadores", style: TextStyle(fontWeight: FontWeight.bold,),),
            ),
            Align(
              alignment: Alignment.centerLeft,
              child: Container(
                margin: EdgeInsets.only(top: 4),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Cores.COR_CINZA, width: 2,),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton(
                    value: _idGrupoSelecionado,
                    borderRadius: BorderRadius.circular(8),
                    items: _listaGrupos.map((g) {
                      return DropdownMenuItem<int>(
                        value: g.id,
                        child: Text(g.nome),
                      );
                    }).toList(),
                    isExpanded: true,
                    padding: EdgeInsets.only(left: 12, right: 8),
                    hint: Text("Selecione o grupo"),
                    onChanged: (value) async {
                      setState(() {
                        _idGrupoSelecionado = value;
                      });
                      if(await Conectividade.isConectado()){
                        _listarIndicadoresNuvem(Variaveis.idProjetoSelecionado!, _idGrupoSelecionado!, Variaveis.idFase!);
                      }else{
                        _listarIndicadoresLocal(Variaveis.idProjetoSelecionado!, _idGrupoSelecionado!, Variaveis.idFase!);
                      }
                    },
                  ),
                ),
              ),
            ),

            Container(
              alignment: Alignment.centerLeft,
              margin: EdgeInsets.only(top: 12,),
              child: Text("Indicador", style: TextStyle(fontWeight: FontWeight.bold,),),
            ),
            Align(
              alignment: Alignment.centerLeft,
              child: Container(
                margin: EdgeInsets.only(top: 4),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Cores.COR_CINZA, width: 2,),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<int>(
                    value: _idIndicadorSelecionado,
                    isExpanded: true,
                    hint: Text("Selecione o indicador"),
                    borderRadius: BorderRadius.circular(12),
                    padding: EdgeInsets.only(left: 12),
                    items: _listaIndicadores.map((i) {
                      return DropdownMenuItem<int>(
                        value: i.id,
                        child: Text(
                          i.nome,
                          softWrap: true,
                          maxLines: 4,
                          overflow: TextOverflow.visible,
                        ),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() {
                        _idIndicadorSelecionado = value;
                      });
                      _listarCaracterizacoesNuvem();
                    },
                  ),
                ),
              ),
            ),

            Container(
              alignment: Alignment.centerLeft,
              margin: EdgeInsets.only(top: 12,),
              child: Text("Caracterização", style: TextStyle(fontWeight: FontWeight.bold,),),
            ),
            Container(
              alignment: Alignment.centerLeft,
              child: Text(_caracterizacoes.isNotEmpty ? _caracterizacoes.first.descricao : ""),
            ),

            Container(
              alignment: Alignment.centerLeft,
              margin: EdgeInsets.only(top: 12),
              child: Text("Ocorrência", style: TextStyle(fontWeight: FontWeight.bold,),),
            ),
            Container(
              child: TextField(
                controller: _tecDesc,
                maxLines: 3,
              ),
            ),


            Container(
              alignment: Alignment.centerLeft,
              margin: EdgeInsets.only(top: 12,),
              child: Text("Pista/Faixa de tráfego", style: TextStyle(fontWeight: FontWeight.bold,),),
            ),
            Align(
              alignment: Alignment.centerLeft,
              child: Container(
                margin: EdgeInsets.only(top: 4),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Cores.COR_CINZA, width: 2,),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton(
                    value: _pista,
                    items: _mapaPistas.keys.map((key) {
                      return DropdownMenuItem(value: key, child: Text("${_mapaPistas[key]}"));
                    }).toList(),
                    isExpanded: true,
                    borderRadius: BorderRadius.circular(12),
                    padding: EdgeInsets.only(left: 12, right: 8),
                    hint: Text("Selecione a pista"),
                    onChanged: (value){
                      setState(() {
                        _pista = value;
                      });
                    },
                  ),
                ),
              ),
            ),
            
            Container(
              alignment: Alignment.centerLeft,
              margin: EdgeInsets.only(top: 12),
              child: Text("Sentido", style: TextStyle(fontWeight: FontWeight.bold,),),
            ),
            Container(
              margin: EdgeInsets.only(top: 4),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Cores.COR_CINZA, width: 2,),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton(
                  value: _sentido,
                  items: _mapaSentidos.keys.map((key) {
                    return DropdownMenuItem(value: key, child: Text("${_mapaSentidos[key]}"));
                  }).toList(),
                  isExpanded: true,
                  borderRadius: BorderRadius.circular(12),
                  padding: EdgeInsets.only(left: 12, right: 8),
                  hint: Text("Selecione o sentido"),
                  onChanged: (value){
                    setState(() {
                      _sentido = value;
                    });
                  },
                ),
              ),
            ),


            Container(
              alignment: Alignment.centerLeft,
              margin: EdgeInsets.only(top: 12,),
              child: Text("Anexar Fotos", style: TextStyle(fontWeight: FontWeight.bold,),),
            ),

            Container(
              margin: EdgeInsets.only(top: 8),
              child: DottedBorder(
                radius: Radius.circular(12),
                borderType: BorderType.RRect,
                strokeWidth: 2,
                dashPattern: [4],
                color: Cores.COR_CINZA,
                child: Container(
                  width: double.infinity,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Container(
                        margin: EdgeInsets.only(top: 24),
                        child: Icon(Icons.camera_alt, color: Cores.COR_CINZA_ESCURO,),
                      ),
                      Container(
                        child: Text("Toque para adicionar fotos", style: TextStyle(color: Cores.COR_CINZA_ESCURO),),
                      ),
                      Container(
                        margin: EdgeInsets.only(bottom: 24),
                        child: ElevatedButton.icon(
                          onPressed: () async {
                            bool permissaoLocalizacaoConcedida = await _verificarPermissaoLocalizacao();
                            if(permissaoLocalizacaoConcedida){
                              final ByteData data = await rootBundle.load("imagens/logo_evvia.png");
                              Uint8List bytesMDagua = data.buffer.asUint8List();
                              List<DataImage>? novasImagens = await Navigator.push(context, MaterialPageRoute(builder: (context) => TelaCamera(bytesMarcaDagua: bytesMDagua)));
                              if(novasImagens != null){
                                setState(() {
                                  _fotosCapturadas.addAll(novasImagens);
                                });
                              }
                            }
                          },
                          label: Text("Adicionar Foto"),
                        ),
                      )
                    ],
                  ),
                ),
              ),
            ),

            Container(
              height: 100,
              margin: EdgeInsets.only(top: 12),
              child: ListView.builder(
                itemCount: _fotosCapturadas.length,
                scrollDirection: Axis.horizontal,
                shrinkWrap: true,
                itemBuilder: (ctx, idx){
                  return Container(
                    width: 100,
                    height: 100,
                    margin: EdgeInsets.only(left: 6, right: 6),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(width: 2, color: Cores.COR_CINZA,),
                    ),
                    child: Stack(
                      children: [
                        Container(
                          alignment: Alignment.center,
                          child: Icon(Icons.photo, color: Cores.COR_CINZA,),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12),
                            image: DecorationImage(
                              fit: BoxFit.cover,
                              image: MemoryImage(_fotosCapturadas[idx].bytes!),
                            )
                          ),
                        ),
                        Align(
                          alignment: Alignment.topRight,
                          child: Container(
                            width: 32,
                            height: 32,
                            margin: EdgeInsets.only(right: 4, top: 2),
                            child: IconButton.filled(
                              onPressed: (){
                                setState(() {
                                  _fotosCapturadas.removeAt(idx);
                                });
                              },
                              icon: Icon(Icons.close_rounded, size: 16,),
                              style: IconButton.styleFrom(
                                backgroundColor: Cores.COR_VERMELHO,
                              ),
                            ),
                          ),
                        )
                      ],
                    ),
                  );
                },
              ),
            ),

            Container(
              width: double.infinity,
              height: 45,
              margin: EdgeInsets.only(top: 12),
              child: ElevatedButton.icon(
                onPressed: () async {
                  if(_tipoOco == null){
                    CustomSnackbar.mostrarMensagem(context, "Selecione o tipo de ocorrência", CustomSnackbar.TIPO_ALERTA);
                  }else if(_tecDesc.text.isEmpty){
                    CustomSnackbar.mostrarMensagem(context, "Descreva a ocorrência", CustomSnackbar.TIPO_ALERTA);
                  }else if(_posIni == null){
                    CustomSnackbar.mostrarMensagem(context, "Localização inicial não definida", CustomSnackbar.TIPO_ALERTA);
                  }else if(_tecKmIni.text.isEmpty){
                    CustomSnackbar.mostrarMensagem(context, "Informe o km inicial", CustomSnackbar.TIPO_ALERTA);
                  }else{
                    Ocorrencia ocorrencia = Ocorrencia();
                    ocorrencia.idOcorrenciaLocal = GeradorId.gerarIdBaseadoEmItens([Variaveis.idProjetoSelecionado!.toString(), _data.millisecondsSinceEpoch.toString()]);
                    ocorrencia.idOcorrenciaServidor = Variaveis.ocorrenciaEdicao?.idOcorrenciaServidor;
                    ocorrencia.idExecucao = Variaveis.execucao!.id;
                    ocorrencia.idProjeto = Variaveis.idProjetoSelecionado!;
                    ocorrencia.idFase = Variaveis.idFase!;
                    ocorrencia.tipo = _tipoOco!;
                    ocorrencia.descricao = _tecDesc.text;
                    ocorrencia.latInicial = _posIni!.latitude;
                    ocorrencia.longInicial = _posIni!.longitude;
                    ocorrencia.kmInicial = double.parse(_tecKmIni.text);
                    ocorrencia.data = _data;
                    if(_pista != null){
                      ocorrencia.pista = _pista;
                    }
                    if(_sentido != null){
                      ocorrencia.sentido = _sentido;
                    }
                    if(_idTrecho != null){
                      ocorrencia.idTrecho = _idTrecho;
                    }
                    if(_tecKmFim.text.isNotEmpty){
                      ocorrencia.kmFinal = double.parse(_tecKmFim.text);
                    }
                    if(_posFinal != null){
                      ocorrencia.latFinal = _posFinal!.latitude;
                      ocorrencia.longFinal = _posFinal!.longitude;
                    }
                    if(_idIndicadorSelecionado != null){
                      ocorrencia.idIndicador = _idIndicadorSelecionado;
                    }
                    ocorrencia.listaImagens.addAll(_fotosCapturadas);
                    if(await Conectividade.isConectado()){
                      bool sucesso = ocorrencia.idOcorrenciaServidor != null ? await _atualizarOcorrenciaNuvem(ocorrencia) : await _registrarUmaOcorrenciaNuvem(ocorrencia);
                      if(sucesso){
                        if(_fotosCapturadas.isNotEmpty){
                          bool sucessoEnvioImg = await _enviarImagensNuvem(ocorrencia);
                          CustomSnackbar.mostrarMensagem(context, sucessoEnvioImg ? "Ocorrência enviada para núvem." : "Ocorrência enviada para núvem, mas falhou ao enviar as imagens.", CustomSnackbar.TIPO_SUCESSO).then((value) {
                            widget.selecionarPag(0);
                          });
                        }else{
                          CustomSnackbar.mostrarMensagem(context, "Ocorrência enviada para núvem.", CustomSnackbar.TIPO_SUCESSO).then((value) {
                            widget.selecionarPag(0);
                          });
                        }
                      }
                    }else{
                      await ocorrencia.salvarLocal();
                      CustomSnackbar.mostrarMensagem(context, "Ocorrência salva localmente.", CustomSnackbar.TIPO_SUCESSO).then((value) {
                        widget.selecionarPag(0);
                      });
                    }
                  }
                },
                label: Text("${Variaveis.ocorrenciaEdicao != null ? "Atualizar" : "Registrar"} Ocorrência"),
                icon: Icon(Icons.check),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _carregarDadosIniciais() async {
    if(await Conectividade.isConectado()){
      _listarGruposNuvem(Variaveis.idProjetoSelecionado!, Variaveis.idFase!);
    }else{
      _listarGruposLocal(Variaveis.idProjetoSelecionado!, Variaveis.idFase!);
    }

    if(Variaveis.ocorrenciaEdicao == null){
      Position? localAtual = await _determinePosition();
      if(localAtual != null){
        _buscarSegmentoMaisProx(localAtual.latitude, localAtual.longitude);
      }
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
  Future<Position?> _determinePosition() async {
    bool _permissaoConcedida = await _verificarPermissaoLocalizacao();
    if(_permissaoConcedida){
      // When we reach here, permissions are granted and we can
      // continue accessing the position of the device.
      return await Geolocator.getCurrentPosition();
    }
  }

  Future<void> _listarIndicadoresNuvem(int idProjeto, int idGrupo, int fase) async {
    Map<String,String> cabecalho = {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer ${Api.tokenAcesso}"
    };
    Uri uri = Uri.parse("${Api.getUrlBase()}/api/v1/projetos/${idProjeto}/grupos/${idGrupo}/indicadores?fases=${fase}&instrumentais=false");
    try{
      http.Response response = await http.get(uri, headers: cabecalho);
      if(response.statusCode == 200){
        Map<String,dynamic> dados = jsonDecode(response.body);
        setState(() {
          _listaIndicadores = List.from(dados['content'] ?? []).map((e){
            e['projectId'] = Variaveis.idProjetoSelecionado!;
            e['fase'] = fase;
            return Indicador.fromJson(e);
          }).toList();
        });
        for(Indicador indicador in _listaIndicadores){
          await indicador.salvarLocal();
        }
      }else{
        Map<String,dynamic> dados = jsonDecode(response.body);
        CustomSnackbar.mostrarMensagem(context, "${dados['message']}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
      }
    }catch(e){
      CustomSnackbar.mostrarMensagem(context, "${e.toString()}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
    }
  }
  Future<void> _listarIndicadoresLocal(int idProjeto, int idGrupo, int fase) async {
    var box = await Hive.openBox("indicadores");
    setState(() {
      _listaIndicadores = box.values.map((e) => Indicador.fromJson(e)).where((f) => f.idProjeto == Variaveis.idProjetoSelecionado && f.idGrupo == idGrupo && f.idFase == fase).toList();
    });
  }

  Future<void> _listarTrechosNuvem() async {
    Map<String,String> cabecalho = {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer ${Api.tokenAcesso}"
    };
    Uri uri = Uri.parse("${Api.getUrlBase()}/api/v1/trechos?projeto=${Variaveis.idProjetoSelecionado}&rodovia=${Variaveis.idRodovia}");
    try{
      http.Response response = await http.get(uri, headers: cabecalho);
      if(response.statusCode == 200){
        Map<String,dynamic> dados = jsonDecode(response.body);
        setState(() {
          _listaTrechos = List.from(dados['content'] ?? []).map((e){
            e['idRodovia'] = Variaveis.idRodovia;
            return Trecho.fromJson(e);
          }).where((t) => t.idProjeto == Variaveis.idProjetoSelecionado && t.idRodovia == Variaveis.idRodovia).toList();
        });
        for(Trecho trecho in _listaTrechos){
          await trecho.salvarLocal();
        }
      }else{
        Map<String,dynamic> dados = jsonDecode(response.body);
        CustomSnackbar.mostrarMensagem(context, "${dados['message']}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
      }
    }catch(e){
      CustomSnackbar.mostrarMensagem(context, "${e.toString()}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
    }
  }
  Future<void> _listarTrechosLocal(int idProjeto, int idRodovia) async {
    var box = await Hive.openBox("trechos");
    setState(() {
      _listaTrechos = box.values.map((e) => Trecho.fromJson(e)).where((t) => t.idProjeto == Variaveis.idProjetoSelecionado && t.idRodovia == idRodovia).toList();
    });
  }

  Future<void> _listarGruposNuvem(int idProjeto, int fase) async {
    Map<String,String> cabecalho = {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer ${Api.tokenAcesso}"
    };
    Uri uri = Uri.parse("${Api.getUrlBase()}/api/v1/projetos/${idProjeto}/grupos?fases=${fase}");
    try{
      http.Response response = await http.get(uri, headers: cabecalho);
      if(response.statusCode == 200){
        Map<String,dynamic> dados = jsonDecode(response.body);
        setState(() {
          _listaGrupos = List.from(dados['content'] ?? []).map((e){
            e['fase'] = fase;
            return Grupo.fromJson(e);
          }).where((g) => g.idProjeto == idProjeto && g.fase == fase).toList();
        });
        for(Grupo grupo in _listaGrupos){
          await grupo.salvarLocal();
        }
      }else{
        Map<String,dynamic> dados = jsonDecode(response.body);
        CustomSnackbar.mostrarMensagem(context, "${dados['message']}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
      }
    }catch(e){
      CustomSnackbar.mostrarMensagem(context, "${e.toString()}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
    }
  }
  Future<void> _listarGruposLocal(int idProjeto, int fase) async {
    var box = await Hive.openBox("grupos");
    setState(() {
      _listaGrupos = box.values.map((e) => Grupo.fromJson(e)).where((g) => g.idProjeto == Variaveis.idProjetoSelecionado && g.fase == fase).toList();
    });
  }

  Future<bool> _registrarUmaOcorrenciaNuvem(Ocorrencia oco) async {
    Uri uri = Uri.parse("${Api.getUrlBase()}/api/v1/ocorrencias");
    try{
      // Cria a requisição multipart
      var request = http.MultipartRequest("POST", uri);
      // Headers com autenticação
      request.headers.addAll({
        "Authorization" : "Bearer ${Api.tokenAcesso}",
      });

      request.files.add(
        http.MultipartFile.fromString(
          "ocorrencia",
          jsonEncode(oco.toJsonNuvem()),
          contentType: MediaType("application", "json")
        )
      );

      for(DataImage dataImage in oco.listaImagens){
        request.files.add(
            http.MultipartFile.fromBytes(
                "imagens",
                dataImage.bytes!,
                filename: "${dataImage.idLocal}.png",
                contentType: MediaType('image', 'png')
            )
        );
      }

      var response = await request.send();

      if (response.statusCode == 200 || response.statusCode == 201) {
        Map<String,dynamic> dados = jsonDecode(await response.stream.bytesToString());
        oco.idOcorrenciaServidor = dados['id'];
        await oco.salvarLocal();
        return true;
      } else {
        Map<String,dynamic> dados = jsonDecode(await response.stream.bytesToString());
        print("Erro: ${response.statusCode}");
        CustomSnackbar.mostrarMensagem(context, "${dados['message']}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
      }
    }catch(e){
      CustomSnackbar.mostrarMensagem(context, "${e.toString()}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
    }
    return false;
  }

  Future<bool> _atualizarOcorrenciaNuvem(Ocorrencia oco) async {
    Map<String,String> cabecalho = {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer ${Api.tokenAcesso}"
    };
    Uri uri = Uri.parse("${Api.getUrlBase()}/api/v1/ocorrencias/${oco.idOcorrenciaServidor}");
    http.Response response = await http.put(uri, headers: cabecalho, body: jsonEncode(oco.toJsonNuvem()));
    try{
      if(response.statusCode == 200){
        await oco.salvarLocal();
        return true;
      } else {
        Map<String,dynamic> dados = jsonDecode(response.body);
        print("Erro: ${response.statusCode}");
        CustomSnackbar.mostrarMensagem(context, "${dados['message']}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
      }
    }catch(e){
      CustomSnackbar.mostrarMensagem(context, "${e.toString()}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
    }
    return false;
  }

  Future<bool> _enviarImagensNuvem(Ocorrencia oco) async {
    Uri uri = Uri.parse("${Api.getUrlBase()}/api/v1/ocorrencias/${oco.idOcorrenciaServidor}/imagens");
    try{
      // Cria a requisição multipart
      var request = http.MultipartRequest("POST", uri);
      // Headers com autenticação
      request.headers.addAll({
        "Authorization" : "Bearer ${Api.tokenAcesso}",
      });
      for(DataImage dataImage in oco.listaImagens.where((i) => i.idServidor == null)){
        request.files.add(
            http.MultipartFile.fromBytes(
                "imagens",
                dataImage.bytes!,
                filename: "${dataImage.idLocal}.png",
                contentType: MediaType('image', 'png')
            )
        );
      }
      var response = await request.send();
      print(response.statusCode);
      if (response.statusCode == 201) {
        await oco.salvarLocal();
        print("Imagens enviadas com sucesso.");
        return true;
      } else {
        Map<String,dynamic> dados = jsonDecode(await response.stream.bytesToString());
        print("Erro: ${response.statusCode}");
        CustomSnackbar.mostrarMensagem(context, "${dados['message']}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
      }
    }catch(e){
      CustomSnackbar.mostrarMensagem(context, "${e.toString()}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
    }
    return false;
  }

  Future<void> _buscarSegmentoMaisProx(double lat, double long) async {
    Map<String,String> cabecalho = {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer ${Api.tokenAcesso}"
    };
    Uri uri = Uri.parse("${Api.getUrlBase()}/api/v1/projetos/${Variaveis.idProjetoSelecionado}/segmentos/mais-proximo?latitude=${lat}&longitude=${long}");
    try{
      http.Response response = await http.get(uri, headers: cabecalho);
      if(response.statusCode == 200){
        Map<String,dynamic> dados = jsonDecode(response.body);
        setState(() {
          _idTrecho = dados['id'];
          _tecKmIni.text = dados['nearestStake']['km'].toString();
          _posIni = Posicao.fromJson(dados['nearestStake']['coordinate']);
        });
        await _listarTrechosNuvem();
      }else{
        Map<String,dynamic> dados = jsonDecode(response.body);

        CustomSnackbar.mostrarMensagem(context, "${dados['message']}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
      }
    }catch(e){
      CustomSnackbar.mostrarMensagem(context, "${e.toString()}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
    }
  }

  Future<void> _listarCaracterizacoesNuvem() async {
    Map<String,String> cabecalho = {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer ${Api.tokenAcesso}"
    };

    String url = "${Api.getUrlBase()}/api/v1/projetos/${Variaveis.idProjetoSelecionado}/caracterizacoes?fase=${Variaveis.idFase}";
    String queries = "";
    if(_idGrupoSelecionado != null){
      queries += "&grupo=${_idGrupoSelecionado}";
    }
    if(_idIndicadorSelecionado != null){
      queries += "&indicador=${_idIndicadorSelecionado}";
    }

    Uri uri = Uri.parse(url+queries);
    try{
      http.Response response = await http.get(uri, headers: cabecalho);
      if(response.statusCode == 200){
        Map<String,dynamic> dados = jsonDecode(response.body);
        List dadosCaracterizacoes = dados['content'];
        setState(() {
          _caracterizacoes = dadosCaracterizacoes.map((e) => Caracterizacao.fromJson(e)).toList();
        });
      }else{
        Map<String,dynamic> dados = jsonDecode(response.body);
        CustomSnackbar.mostrarMensagem(context, "${dados['message']}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
      }
    }catch(e){
      CustomSnackbar.mostrarMensagem(context, "${e.toString()}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
    }
  }
}
