import 'dart:convert';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:evvia_appverificador_independente/model/data_image.dart';
import 'package:flutter/material.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import 'package:http/http.dart' as http;

import '../config/constantes.dart';
import '../config/variaveis.dart';
import '../helper/gerador_id.dart';

class TelaVisualizacaoImagens extends StatefulWidget {
  List<DataImage> imagens;
  TelaVisualizacaoImagens({Key? key, required this.imagens}) : super(key: key);

  @override
  State<TelaVisualizacaoImagens> createState() => _TelaVisualizacaoImagensState();
}

class _TelaVisualizacaoImagensState extends State<TelaVisualizacaoImagens> {

  PageController _pageController = PageController(initialPage: 0);

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Expanded(
            child: PageView.builder(
              controller: _pageController,
              itemCount: widget.imagens.length,
              itemBuilder: (ctx, idx){
                DataImage dataImg = widget.imagens[idx];
                return Container(
                  width: MediaQuery.of(context).size.width,
                  decoration: BoxDecoration(
                    image: DecorationImage(
                      fit: BoxFit.fitWidth,
                      image: dataImg.url != null ? CachedNetworkImageProvider(
                        dataImg.url!,
                        headers: {
                          "Authorization" : "Bearer ${Api.tokenAcesso}"
                        },
                      ) : MemoryImage(dataImg.bytes!),
                    )
                  ),
                );
              },
            ),
          ),
          Container(
            margin: EdgeInsets.only(bottom: 12),
            child: SmoothPageIndicator(
              controller: _pageController,
              count: widget.imagens.length,
              effect: const WormEffect(
                dotHeight: 8,
                dotWidth: 8,
                type: WormType.normal,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
