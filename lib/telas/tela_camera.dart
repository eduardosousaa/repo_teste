import 'dart:io';
import 'dart:typed_data';

import 'package:camera/camera.dart';
import 'package:evvia_appverificador_independente/config/constantes.dart';
import 'package:evvia_appverificador_independente/config/variaveis.dart';
import 'package:evvia_appverificador_independente/helper/custom_dialog.dart';
import 'package:evvia_appverificador_independente/helper/gerador_id.dart';
import 'package:evvia_appverificador_independente/model/data_image.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:hive/hive.dart';
import 'package:image/image.dart' as img;
import 'package:intl/intl.dart';

class TelaCamera extends StatefulWidget {
  Uint8List bytesMarcaDagua;
  TelaCamera({Key? key, required this.bytesMarcaDagua}) : super(key: key);

  @override
  State<TelaCamera> createState() => _TelaCameraState();
}

class _TelaCameraState extends State<TelaCamera> {

  List<DataImage> _fotosCapturadas = [];

  CameraController? _controller;
  DateFormat _dateFormat = DateFormat("dd/MM/yyyy HH:mm:ss");

  @override
  void initState() {
    super.initState();
    _inicializarCamera();
  }

  Future<void> _inicializarCamera() async {
    List<CameraDescription> _cameras = await availableCameras();
    _controller = CameraController(_cameras[0], ResolutionPreset.high);
    _controller?.initialize().then((_) {
      if (!mounted) {
        return;
      }
      setState(() {});
    }).catchError((Object e) {
      if (e is CameraException) {
        switch (e.code) {
          case 'CameraAccessDenied':
          // Handle access errors here.
            break;
          default:
          // Handle other errors here.
            break;
        }
      }
    });
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!(_controller?.value.isInitialized ?? false)) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      body: Stack(
        children: [
          Transform.scale(
            scale: MediaQuery.of(context).size.height/_controller!.value.previewSize!.height,
            child: LayoutBuilder(
              builder: (context, constraints) {
                return GestureDetector(
                  onTapDown: (details) => _onTapDown(details, constraints),
                  child: SizedBox.expand(
                    child: FittedBox(
                      fit: BoxFit.cover, // preenche sem distorcer
                      child: SizedBox(
                        width: _controller!.value.previewSize!.height,
                        height: _controller!.value.previewSize!.width,
                        child: CameraPreview(_controller!),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          Container(
            alignment: Alignment.bottomCenter,
            margin: EdgeInsets.only(bottom: 24),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              spacing: 12,
              children: [
                FloatingActionButton.extended(
                  label: Text("Capturar"),
                  icon: Icon(Icons.add_a_photo),
                  heroTag: 1,
                  onPressed: () async {

                    DateTime horario = DateTime.now();
                    Position posicao = await Geolocator.getCurrentPosition();

                    final arquivoImg = await _controller!.takePicture();
                    // 2. Carrega bytes da imagem
                    final bytes = await File(arquivoImg.path).readAsBytes();

                    img.Image imgOriginal = img.decodeImage(bytes)!;
                    final newImg = img.copyResize(
                      imgOriginal,
                      width: imgOriginal.width,
                      height: imgOriginal.height,
                    );

                    String texto = "Horario: ${_dateFormat.format(horario)}\nLatitude: ${posicao.latitude}\nLongitude: ${posicao.longitude}";

                    // 3. Desenha a marca d’água (texto simples)
                    img.drawString(
                      newImg,
                      texto,
                      font: img.arial24, // branco
                      //color: img.ColorInt16.rgba(255, 255, 255, 255),
                      x: 75,
                      y: imgOriginal.height - 100
                    );

                    // Carrega a marca d’água (de preferência PNG com transparência)
                    img.Image watermark = img.decodeImage(widget.bytesMarcaDagua)!;

                    // Redimensiona a marca d’água, se quiser
                    final resizedWatermark = img.copyResize(watermark, width: 150);

                    // Define a posição (exemplo: canto inferior direito)
                    final x = imgOriginal.width - resizedWatermark.width - 75;
                    final y = imgOriginal.height - resizedWatermark.height - 35;

                    // Copia a marca d’água para dentro da imagem principal
                    img.compositeImage(
                      newImg,
                      resizedWatermark,
                      dstX: x,
                      dstY: y,
                      blend: img.BlendMode.alpha, // respeita transparência
                    );

                    final modifiedImageBytes = img.encodeJpg(newImg);

                    _mostrarDialogConfirmacao(modifiedImageBytes);
                  },
                ),
                FloatingActionButton.extended(
                  heroTag: 2,
                  onPressed: _fotosCapturadas.isNotEmpty ? () async {
                    Navigator.of(context).pop(_fotosCapturadas);
                  } : null,
                  backgroundColor: _fotosCapturadas.isNotEmpty ? Cores.COR_VERDE : Cores.COR_CINZA,
                  label: Text("Concluir"),
                  icon: Icon(Icons.check_circle),
                )
              ],
            ),
          ),
          Align(
            alignment: Alignment.topRight,
            child: Container(
              width: 50,
              height: 50,
              alignment: Alignment.center,
              margin: EdgeInsets.only(top: 32, right: 12),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(25),
                color: Cores.COR_VERDE,
              ),
              child: Text("${_fotosCapturadas.length}", textAlign: TextAlign.center, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Cores.COR_BRANCO),),
            ),
          ),
        ],
      ),
    );
  }

  void _onTapDown(TapDownDetails details, BoxConstraints constraints) {
    final offset = details.localPosition;

    // Normaliza o clique (precisa ser entre 0.0 e 1.0)
    final dx = offset.dx / constraints.maxWidth;
    final dy = offset.dy / constraints.maxHeight;

    final normalizedPoint = Offset(dx, dy);

    // Define o ponto de foco e exposição
    _controller?.setFocusPoint(normalizedPoint);
    _controller?.setExposurePoint(normalizedPoint);

    print("Definindo foco em $normalizedPoint");
  }

  Future<void> _mostrarDialogConfirmacao(Uint8List bytesFotoAtual) async {
    return await showDialog(
      context: context,
      builder: (ctx){
        return AlertDialog(
          title: Text("Atenção"),
          content: Column(
            children: [
              Container(
                alignment: Alignment.center,
                margin: EdgeInsets.only(bottom: 12),
                child: Text("Confirma que deseja adicionar a foto atual?"),
              ),
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    image: DecorationImage(
                      fit: BoxFit.cover,
                      image: MemoryImage(bytesFotoAtual),
                    )
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
              child: Text("Cancelar"),
            ),
            TextButton(
              onPressed: () async {
                DateTime data = DateTime.now();
                DataImage dataImage = DataImage();
                dataImage.idLocal = GeradorId.gerarIdBaseadoEmItens([Variaveis.idProjetoSelecionado!.toString(), data.millisecondsSinceEpoch.toString()]);
                dataImage.data = data;
                dataImage.bytes = bytesFotoAtual;
                dataImage.idProjeto = Variaveis.idProjetoSelecionado!;
                setState(() {
                  _fotosCapturadas.add(dataImage);
                });
                Navigator.of(context).pop();
              },
              child: Text("Adicionar"),
            ),
          ],
        );
      },
    );
  }

}
