import 'dart:convert';

import 'package:evvia_appverificador_independente/helper/custom_snackbar.dart';
import 'package:evvia_appverificador_independente/telas/tela_principal.dart';
import 'package:flutter/material.dart';
import 'package:mask_text_input_formatter/mask_text_input_formatter.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../config/constantes.dart';

import 'package:http/http.dart' as http;

class TelaLogin extends StatefulWidget {
  const TelaLogin({Key? key}) : super(key: key);

  @override
  State<TelaLogin> createState() => _TelaLoginState();
}

class _TelaLoginState extends State<TelaLogin> {

  //TextEditingController _tecCPF = TextEditingController(text: "627.680.190-97");
  //TextEditingController _tecSenha = TextEditingController(text: "senha1234");
  TextEditingController _tecCPF = TextEditingController();
  TextEditingController _tecSenha = TextEditingController();

  bool _visibilidadeSenha = false, _logando = false;

  var _maskCpf = new MaskTextInputFormatter(
      mask: '###.###.###-##',
      filter: { "#": RegExp(r'[0-9]') },
      type: MaskAutoCompletionType.lazy
  );

  @override
  void initState() {
    super.initState();
    _verificarDadosLogin();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Container(
            width: MediaQuery.of(context).size.width,
            height: MediaQuery.of(context).size.height,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [Cores.COR_VERDE, Cores.COR_CIANO], begin: Alignment.topLeft, end: Alignment.bottomRight)
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  alignment: Alignment.center,
                  child: Text("Bem-vindo", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Cores.COR_BRANCO)),
                ),
                Container(
                  alignment: Alignment.center,
                  margin: EdgeInsets.only(top: 12),
                  child: Text("Acessar sua conta", style: TextStyle(fontSize: 18, color: Cores.COR_BRANCO)),
                ),

                Container(
                  margin: EdgeInsets.only(top: 24),
                  child: TextField(
                    controller: _tecCPF,
                    inputFormatters: [_maskCpf],
                    decoration: InputDecoration(
                      hintText: "Entre com o e-mail",
                      prefixIcon: Icon(Icons.email, color: Cores.COR_CINZA),
                      focusedErrorBorder: OutlineInputBorder(
                        borderSide: BorderSide(color: Colors.red, width: 2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      errorBorder: OutlineInputBorder(
                        borderSide: BorderSide(color: Colors.red, width: 2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      fillColor: Colors.white,
                      filled: true,
                    ),
                  ),
                ),

                Container(
                  margin: EdgeInsets.only(top: 12),
                  child: TextField(
                    controller: _tecSenha,
                    decoration: InputDecoration(
                      hintText: "Entre com a senha",
                      prefixIcon: Icon(Icons.lock, color: Cores.COR_CINZA),
                      focusedErrorBorder: OutlineInputBorder(
                        borderSide: BorderSide(color: Colors.red, width: 2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      errorBorder: OutlineInputBorder(
                        borderSide: BorderSide(color: Colors.red, width: 2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      fillColor: Colors.white,
                      filled: true,
                      suffixIcon: IconButton(
                        onPressed: (){
                          setState(() {
                            _visibilidadeSenha = !_visibilidadeSenha;
                          });
                        },
                        icon: Icon(_visibilidadeSenha ? Icons.visibility_rounded : Icons.visibility_off_rounded, color: Cores.COR_CINZA_ESCURO),
                      ),
                    ),
                  ),
                ),

                Container(
                  margin: EdgeInsets.only(top: 24),
                  child: ElevatedButton.icon(
                    onPressed: () async {
                      if(_tecCPF.text.isEmpty){
                        CustomSnackbar.mostrarMensagem(context, "Preencha o seu CPF", CustomSnackbar.TIPO_ALERTA, duracao: Duration(seconds: 5));
                      }else if(_tecSenha.text.isEmpty){
                        CustomSnackbar.mostrarMensagem(context, "Preencha a sua senha", CustomSnackbar.TIPO_ALERTA, duracao: Duration(seconds: 5));
                      }else{
                        setState(() {
                          _logando = true;
                        });
                        Map<String,dynamic> dadosLogin = await _fazerLogin();
                        setState(() {
                          _logando = false;
                        });
                        if(dadosLogin.isNotEmpty){
                          SharedPreferences prefs = await SharedPreferences.getInstance();
                          await prefs.setString("dados_login", jsonEncode(dadosLogin));
                          Api.tokenAcesso = dadosLogin['accessToken'];
                          Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => TelaPrincipal()));
                        }
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Cores.COR_VERDE,
                    ),
                    label: Text("Entrar"),
                    icon: _logando ? Container(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(),
                    ) : Icon(Icons.login),
                  ),
                )
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<Map<String,dynamic>> _fazerLogin() async {
    Map<String,String> cabecalho = {
      "Content-Type" : "application/json"
    };
    Map<String,dynamic> parametros = {
      "password": _tecSenha.text,
      "cpf": _maskCpf.unmaskText(_tecCPF.text)
    };
    Uri uri = Uri.parse("${Api.getUrlBase()}/api/v1/auth/login");
    try{
      http.Response response = await http.post(uri, headers: cabecalho,  body: jsonEncode(parametros));
      if(response.statusCode == 201){
        Map<String,dynamic> dados = jsonDecode(response.body);
        return dados;
      }else{
        Map<String,dynamic> dados = jsonDecode(response.body);
        CustomSnackbar.mostrarMensagem(context, "${dados['message']}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
      }
    }catch(e){
      print(e.toString());
      CustomSnackbar.mostrarMensagem(context, "${e.toString()}", CustomSnackbar.TIPO_ERRO, duracao: Duration(seconds: 5));
    }
    return Map();
  }

  Future<void> _verificarDadosLogin() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? dadosCodificados = prefs.getString("dados_login");
    if(dadosCodificados != null){
      Map<String,dynamic> dadosDecodificados = jsonDecode(dadosCodificados);
      Api.tokenAcesso = dadosDecodificados['accessToken'];
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => TelaPrincipal()));
    }
  }
}
