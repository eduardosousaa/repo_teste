import 'dart:convert';

import 'package:evvia_appverificador_independente/config/constantes.dart';
import 'package:evvia_appverificador_independente/config/variaveis.dart';
import 'package:evvia_appverificador_independente/model/indicador.dart';
import 'package:evvia_appverificador_independente/model/ocorrencia.dart';
import 'package:evvia_appverificador_independente/model/rodovia.dart';
import 'package:evvia_appverificador_independente/telas/tela_visualizacao_imagens.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:hive/hive.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';

import '../config/conectividade.dart';
import '../helper/custom_snackbar.dart';
import '../helper/gerador_id.dart';
import '../model/data_image.dart';
import '../model/trecho.dart';
import 'pag_cadastro_ocorrencia.dart';

class PagListaOcorrencias extends StatefulWidget {
  void Function(int) selecionarPag;
  PagListaOcorrencias({Key? key, required this.selecionarPag}) : super(key: key);

  @override
  State<PagListaOcorrencias> createState() => _PagListaOcorrenciasState();
}

class _PagListaOcorrenciasState extends State<PagListaOcorrencias> {

  List<Indicador> _listaIndicadores = [];
  int? _idIndicadorSelecionado;
  List<Trecho> _listaTrechos = [];
  int? _idTrecho;
  List<Ocorrencia> _listaOcorrencias = [];

  bool _isModoTabela = true;
  
  DateFormat _dateFormat = DateFormat("dd/MM/yyyy");
  DateTime? _dataInicio, _dataFim;

  NumberFormat _nf = NumberFormat.decimalPatternDigits(locale: "pt_br", decimalDigits: 2);

  @override
  void initState() {
    super.initState();
    WidgetsFlutterBinding.ensureInitialized().addPostFrameCallback((timeStamp) {
      _dataInicio = Variaveis.periodo?.start;
      _dataFim = Variaveis.periodo?.end;
      _listarIndicadores(Variaveis.idProjetoSelecionado!);
      _listarTrechos(Variaveis.idProjetoSelecionado!, Variaveis.idRodovia!);
    });

  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        padding: EdgeInsets.all(18),
        child: Column(
          children: [
            Card(
              shape: RoundedRectangleBorder(
                side: BorderSide(width: 2, color: Cores.COR_CINZA,),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Column(
                  children: [
                    Container(
                      child: Row(
                        spacing: 4,
                        children: [
                          Container(
                            child: Icon(Icons.show_chart, color: Cores.COR_VERDE,),
                          ),
                          Container(
                            alignment: Alignment.centerLeft,
                            child: Text("Indicador", style: TextStyle(fontWeight: FontWeight.bold,),),
                          ),
                        ],
                      ),
                    ),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Container(
                        margin: EdgeInsets.only(top: 4),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Cores.COR_CINZA, width: 2,),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton(
                            value: _idIndicadorSelecionado,
                            borderRadius: BorderRadius.circular(12),
                            items: _listaIndicadores.map((e) {
                              return DropdownMenuItem<int>(value: e.id, child: Text(e.nome));
                            }).toList(),
                            isExpanded: true,
                            padding: EdgeInsets.only(left: 12,),
                            hint: Text("Selecione o indicador"),
                            onChanged: (value){
                              setState(() {
                                _idIndicadorSelecionado = value;
                              });
                            },
                          ),
                        ),
                      ),
                    ),
                    Container(
                      margin: EdgeInsets.only(top: 12),
                      child: Row(
                        spacing: 4,
                        children: [
                          Container(
                            child: Icon(Icons.linear_scale, color: Cores.COR_VERDE,),
                          ),
                          Container(
                            alignment: Alignment.centerLeft,
                            child: Text("Segmento", style: TextStyle(fontWeight: FontWeight.bold,),),
                          ),
                        ],
                      ),
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
                            value: _idTrecho,
                            items: _listaTrechos.map((e) {
                              return DropdownMenuItem<int>(value: e.id, child: Text("${e.nome}"));
                            }).toList(),
                            isExpanded: true,
                            padding: EdgeInsets.only(left: 12,),
                            borderRadius: BorderRadius.circular(8),
                            hint: Text("Selecione o segmento"),
                            onChanged: (value){
                              setState(() {
                                _idTrecho = value;
                              });
                            },
                            
                          ),
                        ),
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
                                  child: Row(
                                    spacing: 4,
                                    children: [
                                      Container(
                                        child: Icon(Icons.calendar_month, color: Cores.COR_VERDE,),
                                      ),
                                      Text("Data início", style: TextStyle(fontWeight: FontWeight.bold),),
                                    ],
                                  ),
                                ),
                                Container(
                                  margin: EdgeInsets.only(top: 4),
                                  child: TextField(
                                    controller: TextEditingController(text: _dataInicio != null ? _dateFormat.format(_dataInicio!) : ""),
                                    readOnly: true,
                                    onTap: () async {
                                      DateTime? data = await showDatePicker(
                                        context: context,
                                        initialDate: _dataInicio,
                                        firstDate: Variaveis.periodo!.start,
                                        lastDate: Variaveis.periodo!.end,
                                      );
                                      if(data != null){
                                        setState(() {
                                          _dataInicio = data;
                                        });
                                      }
                                    },
                                    decoration: InputDecoration(
                                      suffixIcon: Visibility(
                                        visible: _dataInicio != null,
                                        child: IconButton(
                                          onPressed: (){
                                            setState(() {
                                              _dataInicio = null;
                                            });
                                          },
                                          iconSize: 18,
                                          icon: Icon(Icons.clear_rounded, ),
                                        ),
                                      )
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  child: Row(
                                    spacing: 4,
                                    children: [
                                      Container(
                                        child: Icon(Icons.calendar_month, color: Cores.COR_VERDE,),
                                      ),
                                      Text("Data fim", style: TextStyle(fontWeight: FontWeight.bold),),
                                    ],
                                  ),
                                ),
                                Container(
                                  margin: EdgeInsets.only(top: 4),
                                  child: TextField(
                                    controller: TextEditingController(text: _dataFim != null ? _dateFormat.format(_dataFim!) : ""),
                                    readOnly: true,
                                    onTap: () async {
                                      DateTime? data = await showDatePicker(
                                        context: context,
                                        initialDate: _dataFim,
                                        firstDate: Variaveis.periodo!.start,
                                        lastDate: Variaveis.periodo!.end,
                                      );
                                      if(data != null){
                                        setState(() {
                                          _dataFim = data;
                                        });
                                      }
                                    },
                                    decoration: InputDecoration(
                                        suffixIcon: Visibility(
                                          visible: _dataFim != null,
                                          child: IconButton(
                                            onPressed: (){
                                              setState(() {
                                                _dataFim = null;
                                              });
                                            },
                                            iconSize: 18,
                                            icon: Icon(Icons.clear_rounded, ),
                                          ),
                                        )
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Container(
              width: double.infinity,
              margin: EdgeInsets.only(top: 12),
              child: ElevatedButton.icon(
                onPressed: () async {
                  if(await Conectividade.isConectado()){
                    _listarOcorrenciasNuvem();
                  }else{
                    _listarOcorrenciasLocal();
                  }
                },
                label: Text("Listar ocorrências"),
                icon: Icon(Icons.list),
              ),
            ),
            Container(
              margin: EdgeInsets.only(top: 12, bottom: 12),
              child: Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        alignment: Alignment.centerLeft,
                        child: Text("Resultados", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),),
                      ),
                      Container(
                        alignment: Alignment.centerLeft,
                        child: Text("${_listaOcorrencias.length} ocorrências encontradas", style: TextStyle(color: Cores.COR_CINZA_ESCURO),),
                      ),
                    ],
                  ),
                  Expanded(child: Container()),
                  Container(
                    height: 35,
                    width: 100,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(width: 2, color: Cores.COR_CINZA)
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: InkWell(
                            onTap: (){
                              setState(() {
                                _isModoTabela = false;
                              });
                            },
                            borderRadius: BorderRadius.only(topLeft: Radius.circular(24), bottomLeft: Radius.circular(24),),
                            child: Container(
                              height: 35,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.only(topLeft: Radius.circular(24), bottomLeft: Radius.circular(24),),
                                color: !_isModoTabela ? Cores.COR_VERDE : Cores.COR_BRANCO,
                              ),
                              child: Icon(Icons.featured_play_list_outlined, color: !_isModoTabela ? Cores.COR_BRANCO : Cores.COR_CINZA_ESCURO),
                            ),
                          ),
                        ),
                        Container(width: 1, color: Cores.COR_CINZA,),
                        Expanded(
                          child: InkWell(
                            onTap: (){
                              setState(() {
                                _isModoTabela = true;
                              });
                            },
                            borderRadius: BorderRadius.only(topRight: Radius.circular(24), bottomRight: Radius.circular(24),),
                            child: Container(
                              height: 35,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.only(topRight: Radius.circular(24), bottomRight: Radius.circular(24),),
                                color: _isModoTabela ? Cores.COR_VERDE : Cores.COR_BRANCO,
                              ),
                              child: Icon(Icons.view_list_sharp, color: _isModoTabela ? Cores.COR_BRANCO : Cores.COR_CINZA_ESCURO),
                            ),
                          ),
                        ),
                      ],
                    ),
                  )
                ],
              ),
            ),


            Visibility(
              visible: _isModoTabela,
              child: Column(
                children: [
                  Container(
                    margin: EdgeInsets.only(top: 12),
                    child: Row(
                      children: [
                        Expanded(flex: 1, child: Container(child: Text("Indicador", style: TextStyle(fontWeight: FontWeight.bold),),)),
                        Expanded(flex: 2, child: Container(child: Text("Ocorrência", style: TextStyle(fontWeight: FontWeight.bold),),)),
                        Expanded(flex: 1, child: Container(child: Text("km\nInicial/Final", textAlign: TextAlign.center, style: TextStyle(fontWeight: FontWeight.bold),),)),
                      ],
                    ),
                  ),
                  Container(
                    width: double.infinity,
                    height: 2,
                    color: Cores.COR_CINZA,
                  ),
                  Container(
                    child: ListView.builder(
                      itemCount: _listaOcorrencias.length,
                      shrinkWrap: true,
                      physics: NeverScrollableScrollPhysics(),
                      itemBuilder: (ctx,idx){
                        Ocorrencia oco = _listaOcorrencias[idx];
                        return InkWell(
                          onTap: (){
                            _mostrarDialogEdicao(oco);
                          },
                          child: Column(
                            children: [
                              Padding(
                                padding: const EdgeInsets.only(top: 4, bottom: 4),
                                child: Row(
                                  spacing: 8,
                                  children: [
                                    Expanded(
                                      flex: 1,
                                      child: Container(
                                        child: Text(oco.nomeIndicador != null ? oco.nomeIndicador! : "-"),
                                      ),
                                    ),
                                    Expanded(
                                      flex: 2,
                                      child: Container(
                                        child: Text("${oco.descricao}", maxLines: 2, overflow: TextOverflow.ellipsis,),
                                      ),
                                    ),
                                    Expanded(
                                      flex: 1,
                                      child: Container(
                                        child: Text("${_nf.format(oco.kmInicial)}/${oco.kmFinal != null ? _nf.format(oco.kmFinal) : "-"}"),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Container(
                                height: 1,
                                color: Cores.COR_CINZA,
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
              replacement: Container(
                child: ListView.builder(
                  itemCount: _listaOcorrencias.length,
                  shrinkWrap: true,
                  physics: NeverScrollableScrollPhysics(),
                  itemBuilder: (ctx,idx){
                    Ocorrencia oco = _listaOcorrencias[idx];
                    return Card(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: BorderSide(width: 2, color: Cores.COR_CINZA,),
                      ),
                      child: InkWell(
                        onTap: (){
                          _mostrarDialogEdicao(oco);
                        },
                        child: Padding(
                          padding: const EdgeInsets.all(12.0),
                          child: Column(
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Text("${oco.nomeIndicador}", style: TextStyle(fontWeight: FontWeight.bold,),),
                                  ),
                                  Container(
                                    child: Text("${_dateFormat.format(oco.data)}"),
                                  )
                                ],
                              ),
                              Container(
                                margin: EdgeInsets.only(top: 12, bottom: 12),
                                alignment: Alignment.centerLeft,
                                child: Text("${oco.descricao}", style: TextStyle(color: Cores.COR_CINZA_ESCURO,),),
                              ),
                              Row(
                                children: [
                                  Expanded(
                                    child: Container(
                                      alignment: Alignment.centerLeft,
                                      child: Text("KM inicial: ${_nf.format(oco.kmInicial)}"),
                                    ),
                                  ),
                                  Expanded(
                                    child: Container(
                                      alignment: Alignment.centerLeft,
                                      child: Text("KM final: ${oco.kmFinal != null ? _nf.format(oco.kmFinal) : "-"}"),
                                    ),
                                  ),
                                ],
                              )
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            )
          ],
        ),
      ),
    );
  }


  Future<void> _listarIndicadores(int idProjeto) async {
    Map<String,String> cabecalho = {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer ${Api.tokenAcesso}"
    };
    Uri uri = Uri.parse("${Api.getUrlBase()}/api/v1/projetos/${idProjeto}/indicadores");
    try{
      http.Response response = await http.get(uri, headers: cabecalho);
      if(response.statusCode == 200){
        Map<String,dynamic> dados = jsonDecode(response.body);
        setState(() {
          _listaIndicadores = List.from(dados['content'] ?? []).map((e){
            e['projectId'] = Variaveis.idProjetoSelecionado;
            return Indicador.fromJson(e);
          }).toList();
        });
      }else{
        Map<String,dynamic> dados = jsonDecode(response.body);
        CustomSnackbar.mostrarMensagem(context, "${dados['message']}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
      }
    }catch(e){
      print('Erro em indicadores');
      CustomSnackbar.mostrarMensagem(context, "${e.toString()}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
    }
  }

  Future<void> _listarTrechos(int idProjeto, int idRodovia) async {
    Map<String,String> cabecalho = {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer ${Api.tokenAcesso}"
    };
    Uri uri = Uri.parse("${Api.getUrlBase()}/api/v1/trechos?projeto=${idProjeto}&rodovia=${idRodovia}");
    try{
      http.Response response = await http.get(uri, headers: cabecalho);
      if(response.statusCode == 200){
        Map<String,dynamic> dados = jsonDecode(response.body);
        setState(() {
          _listaTrechos = List.from(dados['content'] ?? []).map((e) => Trecho.fromJson(e)).toList();
        });
      }else{
        Map<String,dynamic> dados = jsonDecode(response.body);
        CustomSnackbar.mostrarMensagem(context, "${dados['message']}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
      }
    }catch(e){
      print('Erro em trechos');
      CustomSnackbar.mostrarMensagem(context, "${e.toString()}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
    }
  }

  Future<void> _listarOcorrenciasNuvem() async {
    Map<String,String> cabecalho = {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer ${Api.tokenAcesso}",
    };
    String url = "${Api.getUrlBase()}/api/v1/ocorrencias?tipoDeFiltro=and&projeto=${Variaveis.idProjetoSelecionado}&executionId=${Variaveis.execucao!.id}&fases=${Variaveis.idFase}";
    String queries = "";
    if(_idIndicadorSelecionado != null){
      queries += "&indicador=${_idIndicadorSelecionado}";
    }
    if(_idTrecho != null){
      queries += "&segmento=${_idTrecho}";
    }
    DateFormat formatterFiltro = DateFormat("yyyy-MM-dd");
    if(_dataInicio != null){
      queries += "&dataInicial=${formatterFiltro.format(_dataInicio!)}";
    }
    if(_dataFim != null){
      queries += "&dataFinal=${formatterFiltro.format(_dataFim!)}";
    }

    Uri uri = Uri.parse(url+queries);
    try{
      http.Response response = await http.get(uri, headers: cabecalho);
      if(response.statusCode == 200){
        Map<String,dynamic> dados = jsonDecode(response.body);
        List dadosOcorrencias = dados['content'];
        dadosOcorrencias.removeWhere((oco) => oco['indicator']['instrumental'] ?? false);
        setState(() {
          _listaOcorrencias = dadosOcorrencias.map((e){
            e['idProjeto'] = Variaveis.idProjetoSelecionado;
            return Ocorrencia.fromJson(e);
          }).toList();
        });
      }else{
        Map<String,dynamic> dados = jsonDecode(response.body);
        CustomSnackbar.mostrarMensagem(context, "${dados['message']}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
      }
    }catch(e){
      CustomSnackbar.mostrarMensagem(context, "${e.toString()}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
    }
  }
  Future<void> _listarOcorrenciasLocal() async {
    var box = await Hive.openBox("ocorrencias");
    setState(() {
      _listaOcorrencias = box.values.map((e) => Ocorrencia.fromJson(e)).where((o){
        List<bool> resultadoTestes = [
          o.idProjeto == Variaveis.idProjetoSelecionado!,
        ];
        if(_idIndicadorSelecionado != null){
          resultadoTestes.add(o.idIndicador == _idIndicadorSelecionado);
        }
        if(_idTrecho != null){
          resultadoTestes.add(o.idTrecho == _idTrecho);
        }
        if(_dataInicio != null){
          resultadoTestes.add(_isDepoisOuIgual(o.data, _dataInicio!));
        }
        if(_dataFim != null){
          resultadoTestes.add(_isAntesOuIgual(o.data, _dataFim!));
        }
        return resultadoTestes.every((condicao) => condicao);
      }).toList();
    });
  }

  bool _isAntesOuIgual(DateTime data, DateTime dataRef){
    return DateTime(data.year, data.month, data.day).millisecondsSinceEpoch <= DateTime(dataRef.year, dataRef.month, dataRef.day).millisecondsSinceEpoch;
  }

  bool _isDepoisOuIgual(DateTime data, DateTime dataRef){
    return DateTime(data.year, data.month, data.day).millisecondsSinceEpoch >= DateTime(dataRef.year, dataRef.month, dataRef.day).millisecondsSinceEpoch;
  }

  Future<void> _mostrarDialogEdicao(Ocorrencia oco) async {
    return await showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Card(
                color: Cores.COR_VERDE,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: InkWell(
                  onTap: () async {
                    Navigator.of(context).pop();
                    Variaveis.ocorrenciaEdicao = oco;
                    widget.selecionarPag(3);
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: Row(
                      spacing: 12,
                      children: [
                        Container(
                          width: 42,
                          height: 42,
                          decoration: BoxDecoration(
                            color: Cores.COR_CINZA_CLARO.withAlpha(100),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(Icons.edit, color: Cores.COR_BRANCO,),
                        ),
                        Expanded(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                child: Text("Editar Ocorrência", style: TextStyle(fontWeight: FontWeight.bold, color: Cores.COR_BRANCO),),
                              ),
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                ),
              ),
              Card(
                color: Cores.COR_VERDE,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: InkWell(
                  onTap: () async {
                    if(oco.idOcorrenciaServidor != null){
                      List<DataImage> imagens = [];
                      if(await Conectividade.isConectado()){
                        imagens = await _listarImagensOcorrenciaNuvem(oco.idOcorrenciaServidor!);
                      }else{
                        imagens = await _listarImagensOcorrenciaLocal(oco);
                      }
                      if(imagens.isNotEmpty){
                        Navigator.push(context, MaterialPageRoute(builder: (context) => TelaVisualizacaoImagens(imagens: imagens,)));
                      }else{
                        CustomSnackbar.mostrarMensagem(context, "Nenhuma imagem foi capturada.", CustomSnackbar.TIPO_ALERTA);
                      }
                    }else{

                    }
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: Row(
                      spacing: 12,
                      children: [
                        Container(
                          width: 42,
                          height: 42,
                          decoration: BoxDecoration(
                            color: Cores.COR_CINZA_CLARO.withAlpha(100),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(Icons.image, color: Cores.COR_BRANCO,),
                        ),
                        Expanded(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                child: Text("Ver imagens", style: TextStyle(fontWeight: FontWeight.bold, color: Cores.COR_BRANCO),),
                              ),
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                ),
              ),
              Card(
                color: Cores.COR_VERMELHO,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: InkWell(
                  onTap: () async {
                    Navigator.of(context).pop();
                    if(oco.idOcorrenciaServidor != null){
                      bool sucesso = await _deletarOcorrencia(oco);
                      if(sucesso){
                        var box = await Hive.openBox("ocorrencias");
                        bool estaEmBancoLocal = await box.containsKey(oco.idOcorrenciaLocal);
                        if(estaEmBancoLocal){
                          await box.delete(oco.idOcorrenciaLocal);
                        }
                        setState(() {
                          _listaOcorrencias.removeWhere((o) => o.idOcorrenciaLocal == oco.idOcorrenciaLocal || o.idOcorrenciaServidor == oco.idOcorrenciaServidor);
                        });
                      }
                    }else if(oco.idOcorrenciaLocal != null){
                      var box = await Hive.openBox("ocorrencias");
                      await box.delete(oco.idOcorrenciaLocal);
                      setState(() {
                        _listaOcorrencias.removeWhere((o) => o.idOcorrenciaLocal == oco.idOcorrenciaLocal || o.idOcorrenciaServidor == oco.idOcorrenciaServidor);
                      });
                    }
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: Row(
                      spacing: 12,
                      children: [
                        Container(
                          width: 42,
                          height: 42,
                          decoration: BoxDecoration(
                            color: Cores.COR_CINZA_CLARO.withAlpha(100),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Icon(Icons.delete_forever, color: Cores.COR_BRANCO,),
                        ),
                        Expanded(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                child: Text("Remover Ocorrência", style: TextStyle(fontWeight: FontWeight.bold, color: Cores.COR_BRANCO),),
                              ),
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                ),
              )
            ],
          ),
          actions: [
            TextButton(
              onPressed: (){
                Navigator.of(context).pop();
              },
              child: Text("Fechar"),
            )
          ],
        );
      },
    );
  }

  Future<bool> _deletarOcorrencia(Ocorrencia oco) async {
    Map<String,String> cabecalho = {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer ${Api.tokenAcesso}"
    };
    Uri uri = Uri.parse("${Api.getUrlBase()}/api/v1/ocorrencias/${oco.idOcorrenciaServidor}");
    try{
      http.Response response = await http.delete(uri, headers: cabecalho);
      if(response.statusCode == 204){
        return true;
      }else{
        Map<String,dynamic> dados = jsonDecode(response.body);
        CustomSnackbar.mostrarMensagem(context, "${dados['message']}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
        return false;
      }
    }catch(e){
      CustomSnackbar.mostrarMensagem(context, "${e.toString()}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
      return false;
    }
  }

  Future<List<DataImage>> _listarImagensOcorrenciaNuvem(int idOco) async {
    Map<String,String> cabecalho = {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer ${Api.tokenAcesso}"
    };
    Uri uri = Uri.parse("${Api.getUrlBase()}/api/v1/ocorrencias/${idOco}/imagens");
    try{
      http.Response response = await http.get(uri, headers: cabecalho);
      if(response.statusCode == 200){
        Map<String,dynamic> dados = jsonDecode(response.body);
        DateTime data = DateTime.now();
        List<DataImage> imagens = List.from(dados['content']).map((e) {
          DataImage dataImage = DataImage();
          dataImage.idLocal = GeradorId.gerarIdBaseadoEmItens([Variaveis.idProjetoSelecionado!.toString(), e['id'].toString(), data.millisecondsSinceEpoch.toString()]);
          dataImage.idProjeto = Variaveis.idProjetoSelecionado!;
          dataImage.idServidor = e['id'];
          dataImage.url = "${Api.getUrlBase()}/api/v1/projetos/${Variaveis.idProjetoSelecionado}/imagens-avulsas/${e['id']}";
          dataImage.idOcorrencia = e['occurrenceId'];
          return dataImage;
        }).toList();
        return imagens;
      }else{
        Map<String,dynamic> dados = jsonDecode(response.body);
        CustomSnackbar.mostrarMensagem(context, "${dados['message']}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
        return [];
      }
    }catch(e){
      CustomSnackbar.mostrarMensagem(context, "${e.toString()}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
      return [];
    }
  }
  Future<List<DataImage>> _listarImagensOcorrenciaLocal(Ocorrencia oco) async {
    return oco.listaImagens.where((e) => e.bytes != null).toList();
  }
}
