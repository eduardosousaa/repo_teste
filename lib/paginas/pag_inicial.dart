import 'dart:convert';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:evvia_appverificador_independente/config/conectividade.dart';
import 'package:evvia_appverificador_independente/model/execucao.dart';
import 'package:evvia_appverificador_independente/model/projeto.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:hive/hive.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../config/constantes.dart';
import '../config/variaveis.dart';
import '../helper/custom_snackbar.dart';
import '../model/fase.dart';
import '../model/rodovia.dart';
import '../telas/tela_login.dart';
import 'pag_cadastro_ocorrencia.dart';
import 'package:http/http.dart' as http;
import '../model/projeto.dart';

class PagInicial extends StatefulWidget {
  void Function(int) selecionarPag;
  PagInicial({Key? key, required this.selecionarPag}) : super(key: key);

  @override
  State<PagInicial> createState() => _PagInicialState();
}

class _PagInicialState extends State<PagInicial> {

  List<Projeto> _listaProjetos = [];
  List<Rodovia> _listaRodovias = [];
  List<Fase> _listaFases = [];
  List<Execucao> _listaExecucoes = [];

  DateFormat _dateFormat = DateFormat("dd/MM/yyyy", "pt-br");
  DateFormat _dateFormatApi = DateFormat("yyyy-MM-dd");

  Map<String,String> _mapaStatusExe = {
    "PENDENTE" : "Pendente",
    "EM_EXECUCAO" : "Em execução",
    "EM_ANDAMENTO" : "Em andamento",
    "ACEITO" : "Aceito"
  };

  @override
  void initState() {
    super.initState();
    WidgetsFlutterBinding.ensureInitialized().addPostFrameCallback((timeStamp) {
      _buscarProjetos();
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        padding: EdgeInsets.all(12),
        child: Column(
          children: [
            Container(
              height: 75,
              margin: EdgeInsets.only(top: 24),
              decoration: BoxDecoration(
                  image: DecorationImage(
                    image: AssetImage("imagens/logo_evvia.png"),
                  )
              ),
            ),
            Container(
              margin: EdgeInsets.only(bottom: 24),
              child: Text("Bem-vindo", style: TextStyle(color: Cores.COR_VERDE, fontSize: 36, fontWeight: FontWeight.bold),),
            ),
            Align(
              alignment: Alignment.centerLeft,
              child: Container(
                child: Text("Projeto Ativo"),
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
                    value: Variaveis.idProjetoSelecionado,
                    items: _listaProjetos.map((p) {
                      return DropdownMenuItem<int>(value: p.id, child: Text("${p.nome}"));
                    }).toList(),
                    isExpanded: true,
                    borderRadius: BorderRadius.circular(12),
                    padding: EdgeInsets.only(left: 12,),
                    hint: Text("Selecione o projeto"),
                    onChanged: (value) async {
                      if(Variaveis.idProjetoSelecionado != value){
                        setState(() {
                          Variaveis.idProjetoSelecionado = value;
                          Variaveis.idRodovia = null;
                          Variaveis.idFase = null;
                          Variaveis.periodo = null;
                          Variaveis.execucao = null;
                        });

                        if(await Conectividade.isConectado()){
                          await _listarRodoviasNuvem(value!);
                          await _listarFasesNuvem(value);
                        } else {
                          await _listarRodoviasLocal(value!);
                          await _listarFasesLocal(value);
                        }
                      }
                    },
                  ),
                ),
              ),
            ),
            Container(
              margin: EdgeInsets.only(top: 8),
              alignment: Alignment.centerLeft,
              child: Container(
                child: Text("Rodovia"),
              ),
            ),
            Container(
              margin: EdgeInsets.only(top: 4),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Cores.COR_CINZA, width: 2,),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton(
                  value: Variaveis.idRodovia,
                  items: _listaRodovias.map((r) {
                    return DropdownMenuItem<int>(
                      value: r.id,
                      child: Text("${r.codigo}"),
                    );
                  }).toList(),
                  isExpanded: true,
                  borderRadius: BorderRadius.circular(12),
                  padding: EdgeInsets.only(left: 12, right: 8),
                  hint: Text("Selecione a rodovia"),
                  onChanged: (value) async {
                    if(Variaveis.idRodovia != value){
                      setState(() {
                        Variaveis.idRodovia = value;
                        Variaveis.idFase = null;
                        Variaveis.periodo = null;
                        Variaveis.execucao = null;
                      });
                    }
                  },
                ),
              ),
            ),
            Container(
              alignment: Alignment.centerLeft,
              margin: EdgeInsets.only(top: 12,),
              child: Text("Fase", style: TextStyle(),),
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
                    value: Variaveis.idFase,
                    items: _listaFases.map((f) {
                      return DropdownMenuItem<int>(
                        value: f.id,
                        child: Text("${f.nome}"),
                      );
                    }).toList(),
                    isExpanded: true,
                    padding: EdgeInsets.only(left: 12, right: 8),
                    borderRadius: BorderRadius.circular(8),
                    hint: Text("Selecione a fase"),
                    onChanged: (value) async {
                      if(Variaveis.idFase != value){
                        setState(() {
                          Variaveis.idFase = value;
                          Variaveis.periodo = null;
                          Variaveis.execucao = null;
                        });
                      }
                    },
                  ),
                ),
              ),
            ),
            Container(
              alignment: Alignment.centerLeft,
              margin: EdgeInsets.only(top: 12,),
              child: Text("Período", style: TextStyle(),),
            ),
            InkWell(
              onTap: () async {
                DateTimeRange? range = await showDateRangePicker(
                  context: context,
                  firstDate: DateTime(1900),
                  lastDate: DateTime(2100),
                  initialDateRange: Variaveis.periodo,
                );
                if(range != null){
                  setState(() {
                    Variaveis.periodo = range;
                  });
                  if(await Conectividade.isConectado()){
                    _verificarExecucoesNuvem(Variaveis.idRodovia!, Variaveis.idFase!, Variaveis.periodo!.start, Variaveis.periodo!.end);
                  }else{
                    _verificarExecucoesLocal(Variaveis.idRodovia!, Variaveis.idFase!, Variaveis.periodo!.start, Variaveis.periodo!.end);
                  }
                }
              },
              borderRadius: BorderRadius.circular(8),
              child: Container(
                width: double.infinity,
                height: 50,
                alignment: Alignment.centerLeft,
                padding: EdgeInsets.only(left: 12, right: 8),
                child: Row(
                  children: [
                    Expanded(
                      child: Text("${Variaveis.periodo != null ? _formatarPeriodo(Variaveis.periodo!) : "Definir período"}", style: TextStyle(color: Variaveis.periodo != null ? null : Cores.COR_CINZA_ESCURO),),
                    ),
                    Container(
                      child: Icon(Icons.arrow_drop_down, color: Cores.COR_CINZA_ESCURO,),
                    )
                  ],
                ),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(width: 2, color: Cores.COR_CINZA,),
                ),
              ),
            ),

            Visibility(
              visible: Variaveis.execucao != null,
              child: Container(
                margin: EdgeInsets.only(top: 12),
                child: Card(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                    side: BorderSide(width: 2, color: Cores.COR_CINZA_ESCURO,),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            children: [
                              Container(
                                alignment: Alignment.centerLeft,
                                child: Text("Execução", style: TextStyle(fontWeight: FontWeight.bold,),),
                              ),
                              Container(
                                alignment: Alignment.centerLeft,
                                child: Text("${Variaveis.execucao != null ? Variaveis.execucao!.nome + " (${_mapaStatusExe[Variaveis.execucao!.status] ?? "Desconhecido"})" : ""}"),
                              ),
                              Visibility(
                                visible: Variaveis.execucao?.descricao != null,
                                child: Container(
                                  child: Text("${Variaveis.execucao?.descricao}"),
                                ),
                              )
                            ],
                          ),
                        ),
                        Container(
                          child: TextButton(
                            onPressed: Variaveis.execucao?.status != "EM_EXECUCAO" ? () async {
                              if(await Conectividade.isConectado()){
                                _finalizarExecucao();
                              }else{
                                CustomSnackbar.mostrarMensagem(context, "Para finalizar uma execução, conecte-se a internet.", CustomSnackbar.TIPO_INFO);
                              }

                            } : null,
                            style: TextButton.styleFrom(
                              foregroundColor: Cores.COR_VERMELHO,
                            ),
                            child: Text("Finalizar"),
                          ),
                        )
                      ],
                    ),
                  ),
                ),
              ),
            ),

            Container(
              height: 100,
              margin: EdgeInsets.only(top: 12),
              child: Card(
                color: Variaveis.execucao != null ? Cores.COR_VERDE : Cores.COR_CINZA,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: InkWell(
                  onTap: Variaveis.execucao != null ? () async {
                    widget.selecionarPag(3);
                  } : null,
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
                          child: Icon(Icons.add_rounded, color: Cores.COR_BRANCO,),
                        ),
                        Expanded(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                child: Text("Nova Ocorrência", style: TextStyle(fontWeight: FontWeight.bold, color: Cores.COR_BRANCO),),
                              ),
                              Container(
                                child: Text("Registrar uma nova ocorrência", style: TextStyle(color: Cores.COR_BRANCO),),
                              )
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                ),
              ),
            ),
            Container(
              height: 100,
              margin: EdgeInsets.only(top: 12),
              child: Card(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: Cores.COR_CINZA, width: 2,),
                ),
                color: Variaveis.execucao != null ? Cores.COR_BRANCO : Cores.COR_CINZA,
                child: InkWell(
                  onTap: Variaveis.execucao != null ? (){
                    widget.selecionarPag(4);
                  } : null,
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
                          child: Icon(Icons.list, color: Variaveis.execucao != null ? Cores.COR_VERDE : Cores.COR_BRANCO,),
                        ),
                        Expanded(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                child: Text("Listar Ocorrências", style: TextStyle(color: Variaveis.execucao != null ? Cores.COR_PRETO : Cores.COR_BRANCO, fontWeight: FontWeight.bold),),
                              ),
                              Container(
                                child: Text("Ver todas as ocorrências registradas", style: TextStyle(color: Variaveis.execucao != null ? Cores.COR_CINZA_ESCURO : Cores.COR_BRANCO,),),
                              )
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
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

  Future<void> _buscarProjetos() async {
    if(await Conectividade.isConectado()){
      await _buscarProjetosNuvem();
    }else{
      await _buscarProjetosLocais();
    }
    setState(() {});
  }

  Future<void> _buscarProjetosNuvem() async {
    Map<String,String> cabecalho = {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer ${Api.tokenAcesso}"
    };
    Uri uri = Uri.parse("${Api.getUrlBase()}/api/v1/projetos");
    try{
      http.Response response = await http.get(uri, headers: cabecalho);
      if(response.statusCode == 200 || response.statusCode == 201){
        Map<String,dynamic> dados = jsonDecode(response.body);
        _listaProjetos = List.from(dados['content'] ?? []).map((e) => Projeto.fromJson(e)).toList();
        var boxProjetos = await Hive.openBox("projetos");
        await boxProjetos.clear();
        for(Projeto projeto in _listaProjetos){
          await projeto.salvarLocal();
        }
        if(Variaveis.idProjetoSelecionado != null && !_listaProjetos.any((p) => p.id == Variaveis.idProjetoSelecionado)){
          setState((){
            Variaveis.idProjetoSelecionado = null;
          });
        }
      }else if(response.statusCode == 403){
        SharedPreferences prefs = await SharedPreferences.getInstance();
        bool sucesso = await prefs.remove("dados_login");
        if(sucesso){
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => TelaLogin()));
        }
      }else{
        Map<String,dynamic> dados = jsonDecode(response.body);
        CustomSnackbar.mostrarMensagem(context, "${dados['message']}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
      }
    }catch(e){
      CustomSnackbar.mostrarMensagem(context, "${e.toString()}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
    }
  }

  Future<void> _buscarProjetosLocais() async {
    var boxProjetos = await Hive.openBox("projetos");
    setState(() {
      _listaProjetos = boxProjetos.values.map((e) => Projeto.fromJson(e)).toList();
    });
  }

  Future<void> _listarRodoviasNuvem(int idProjeto) async {
    Map<String,String> cabecalho = {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer ${Api.tokenAcesso}"
    };
    Uri uri = Uri.parse("${Api.getUrlBase()}/api/v1/projetos/${idProjeto}/rodovias");
    try{
      http.Response response = await http.get(uri, headers: cabecalho);
      if(response.statusCode == 200){
        Map<String,dynamic> dados = jsonDecode(response.body);
        setState(() {
          _listaRodovias = List.from(dados['content'] ?? []).map((e){
            e['projectId'] = idProjeto;
            return Rodovia.fromJson(e);
          }).where((r) => r.idProjeto == idProjeto).toList();
        });
        for(Rodovia rodovia in _listaRodovias){
          await rodovia.salvarLocal();
        }
      }else{
        Map<String,dynamic> dados = jsonDecode(response.body);
        CustomSnackbar.mostrarMensagem(context, "${dados['message']}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
      }
    }catch(e){
      CustomSnackbar.mostrarMensagem(context, "${e.toString()}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
    }
  }
  Future<void> _listarRodoviasLocal(int idProjeto) async {
    var box = await Hive.openBox("rodovias");
    setState(() {
      _listaRodovias = box.values.map((e) => Rodovia.fromJson(e)).where((f) => f.idProjeto == idProjeto).toList();
    });
  }

  Future<void> _listarFasesNuvem(int idProjeto) async {
    Map<String,String> cabecalho = {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer ${Api.tokenAcesso}"
    };
    Uri uri = Uri.parse("${Api.getUrlBase()}/api/v1/projetos/${idProjeto}/fases");
    try{
      http.Response response = await http.get(uri, headers: cabecalho);
      if(response.statusCode == 200){
        Map<String,dynamic> dados = jsonDecode(response.body);
        setState(() {
          _listaFases = List.from(dados['content'] ?? []).map((e) => Fase.fromJson(e)).toList();
        });
        for(Fase fase in _listaFases){
          await fase.salvarLocal();
        }
      }else{
        Map<String,dynamic> dados = jsonDecode(response.body);
        CustomSnackbar.mostrarMensagem(context, "${dados['message']}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
      }
    }catch(e){
      CustomSnackbar.mostrarMensagem(context, "${e.toString()}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
    }
  }
  Future<void> _listarFasesLocal(int idProjeto) async {
    var box = await Hive.openBox("fases");
    setState(() {
      _listaFases = box.values.map((e) => Fase.fromJson(e)).where((f) => f.idProjeto == idProjeto).toList();
    });
  }

  String _formatarPeriodo(DateTimeRange range){
    return _dateFormat.format(range.start) + " à " + _dateFormat.format(range.end);
  }

  Future<void> _verificarExecucoesNuvem(int idRodovia, int idFase, DateTime dataIni, DateTime dataFim) async {
    Map<String,String> cabecalho = {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer ${Api.tokenAcesso}"
    };
    Map<String,dynamic> dados = {
      "highwayId" : idRodovia.toString(),
      "stepId" : idFase.toString(),
      "start" : _dateFormatApi.format(dataIni),
      "end" : _dateFormatApi.format(dataFim)
    };
    Uri uri = Uri.https(Api.getUrlBase().replaceAll("https://", ""), "/api/v1/execucoes-verificar", dados);
    try{
      http.Response response = await http.get(uri, headers: cabecalho);
      if(response.statusCode == 200){
        List<dynamic> dadosExecucoes = jsonDecode(response.body);
        print(dadosExecucoes);
        _listaExecucoes = dadosExecucoes.map((e){
          Execucao exe = Execucao();
          exe.idLocal = "${e['id']}_${e['stepId']}_${Variaveis.idRodovia!}";
          exe.id = e['id'];
          exe.idProjeto = Variaveis.idProjetoSelecionado!;
          exe.idRodovia = Variaveis.idRodovia!;
          exe.idFase = Variaveis.idFase!;
          exe.nome = e['name'];
          exe.periodo = DateTimeRange(
            start: DateTime.parse(e['startDate']),
            end: DateTime.parse(e['endDate']),
          );
          exe.status = e['status'];
          exe.descricao = e['description'];
          return exe;
        }).toList();
        for(Execucao execucao in _listaExecucoes){
          await execucao.salvarLocal();
        }
        if(_listaExecucoes.isNotEmpty){
          setState(() {
            Variaveis.execucao = _listaExecucoes.first;
          });
        }else{
          _mostrarDialogNovaExe();
        }
      }else{
        Map<String,dynamic> dados = jsonDecode(response.body);
        CustomSnackbar.mostrarMensagem(context, "${dados['message']}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
      }
    }catch(e){
      CustomSnackbar.mostrarMensagem(context, "${e.toString()}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
    }
  }
  Future<void> _verificarExecucoesLocal(int idRodovia, int idFase, DateTime dataIni, DateTime dataFim) async {
    var box = await Hive.openBox("execucoes");
    setState(() {
      _listaExecucoes = box.values.map((e) => Execucao.fromJson(e)).where((e){
        return e.idRodovia == idRodovia && e.idFase == idFase && _dateFormatApi.format(e.periodo.start) == _dateFormatApi.format(dataIni) && _dateFormatApi.format(e.periodo.end) == _dateFormatApi.format(dataFim);
      }).toList();
    });
  }

  Future<void> _finalizarExecucao() async {
    Map<String,String> cabecalho = {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer ${Api.tokenAcesso}"
    };
    String url = "${Api.getUrlBase()}/api/v1/execucoes/${Variaveis.execucao?.id}/encerrar-vistoria";
    try{
      http.Response response = await http.put(Uri.parse(url), headers: cabecalho);
      if(response.statusCode == 200){
        Map<String,dynamic> dadosExe = jsonDecode(response.body);
        Variaveis.execucao!.status = dadosExe['status'];
        await Variaveis.execucao!.salvarLocal();
        setState(() {});
      }else{
        Map<String,dynamic> dados = jsonDecode(response.body);
        CustomSnackbar.mostrarMensagem(context, "${dados['message']}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
      }
    }catch(e){
      CustomSnackbar.mostrarMensagem(context, "${e.toString()}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
    }
  }

  Future<void> _mostrarDialogNovaExe() async {
    TextEditingController tecNome = TextEditingController();
    TextEditingController tecDescricao = TextEditingController();
    await showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text("Atenção"),
          content: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                child: Text("Não foi encontrada nenhuma execução para os parâmetros informados, deseja criar uma nova execução?"),
              ),
              Container(
                margin: EdgeInsets.only(top: 12),
                child: Text("Nome"),
              ),
              Container(
                child: TextField(
                  controller: tecNome,
                ),
              ),
              Container(
                child: Text("Descrição"),
              ),
              Container(
                child: TextField(
                  controller: tecDescricao,
                ),
              )
            ],
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
                if(tecNome.text.isEmpty){
                  CustomSnackbar.mostrarMensagem(context, "Infome um nome para a execução.", CustomSnackbar.TIPO_ALERTA);
                }else if(tecDescricao.text.isEmpty){
                  CustomSnackbar.mostrarMensagem(context, "Infome uma descrição para a execução.", CustomSnackbar.TIPO_ALERTA);
                }else{
                  bool sucesso = await _criarExecucao(tecNome.text, tecDescricao.text);
                  if(sucesso){
                    Navigator.of(context).pop();
                  }
                }
              },
              child: Text("Sim"),
            ),

          ],
        );
      },
    );
  }

  Future<bool> _criarExecucao(String nome, String descricao) async {
    Map<String,String> cabecalho = {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer ${Api.tokenAcesso}"
    };
    Map<String,dynamic> parametros = {
      "name": nome,
      "stepId": Variaveis.idFase,
      "highwayId": Variaveis.idRodovia,
      "startDate": _dateFormatApi.format(Variaveis.periodo!.start),
      "endDate": _dateFormatApi.format(Variaveis.periodo!.end),
      "description": descricao
    }
    ;
    String url = "${Api.getUrlBase()}/api/v1/execucoes-criar-com-rodovia";
    try{
      http.Response response = await http.post(Uri.parse(url), headers: cabecalho, body: jsonEncode(parametros));
      if(response.statusCode == 200){
        Map<String,dynamic> dadosExe = jsonDecode(response.body);
        Execucao exe = Execucao();
        exe.idLocal = "${dadosExe['id']}_${dadosExe['stepId']}_${Variaveis.idRodovia!}";
        exe.id = dadosExe['id'];
        exe.idProjeto = Variaveis.idProjetoSelecionado!;
        exe.idRodovia = Variaveis.idRodovia!;
        exe.idFase = Variaveis.idFase!;
        exe.nome = dadosExe['name'];
        exe.periodo = DateTimeRange(
          start: DateTime.parse(dadosExe['startDate']),
          end: DateTime.parse(dadosExe['endDate']),
        );
        exe.status = dadosExe['status'];
        exe.descricao = descricao;
        await exe.salvarLocal();
        setState(() {
          Variaveis.execucao = exe;
        });
        return true;
      }else{
        Map<String,dynamic> dados = jsonDecode(response.body);
        CustomSnackbar.mostrarMensagem(context, "${dados['message']}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
      }
    }catch(e){
      CustomSnackbar.mostrarMensagem(context, "${e.toString()}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
    }
    return false;
  }
}
