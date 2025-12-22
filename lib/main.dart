import 'dart:io';

import 'package:evvia_appverificador_independente/telas/tela_login.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:hive/hive.dart';
import 'package:hive_flutter/adapters.dart';

import 'config/constantes.dart';

void main() async {

  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();

  runApp(
    MaterialApp(
      debugShowCheckedModeBanner: false,
      localizationsDelegates: GlobalMaterialLocalizations.delegates,
      supportedLocales: [
        Locale('pt', 'BR'),
      ],
      locale: Locale('pt', 'BR'),
      home: TelaLogin(),
      theme: ThemeData(
        fontFamily: "Poppins",
        appBarTheme: AppBarTheme(
          backgroundColor: Cores.COR_BRANCO_GELO,
          titleTextStyle: TextStyle(color: Cores.COR_PRETO, fontSize: 22),
          iconTheme: IconThemeData(
            color: Cores.COR_VERDE,
          )
        ),
        scaffoldBackgroundColor: Cores.COR_BRANCO_GELO,
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: Cores.COR_VERDE,
            foregroundColor: Cores.COR_BRANCO,
            iconColor: Cores.COR_BRANCO,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            )
          )
        ),
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            foregroundColor: Cores.COR_VERDE,
          )
        ),
        textSelectionTheme: TextSelectionThemeData(
          cursorColor: Cores.COR_VERDE,
          selectionHandleColor: Cores.COR_CINZA_ESCURO.withAlpha(10),
          selectionColor: Cores.COR_CINZA_CLARO,
        ),
        inputDecorationTheme: InputDecorationTheme(
          contentPadding: EdgeInsets.only(left: 12, right: 12, top: 8, bottom: 8),
          labelStyle: TextStyle(color: Cores.COR_CINZA_CLARO),
          floatingLabelStyle: TextStyle(color: Cores.COR_VERDE),
          enabledBorder: OutlineInputBorder(
            borderSide: BorderSide(color: Cores.COR_CINZA, width: 2),
            borderRadius: BorderRadius.circular(12),
          ),
          focusedBorder: OutlineInputBorder(
            borderSide: BorderSide(color: Cores.COR_CINZA, width: 2),
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        floatingActionButtonTheme: FloatingActionButtonThemeData(
          backgroundColor: Cores.COR_VERDE,
          foregroundColor: Cores.COR_BRANCO,
        ),
        progressIndicatorTheme: ProgressIndicatorThemeData(
          color: Cores.COR_VERDE,
          circularTrackColor: Cores.COR_CINZA,
        ),
        datePickerTheme: DatePickerThemeData(
          backgroundColor: Colors.white, // Cor de fundo do calendário
          surfaceTintColor: Colors.blueGrey[50], // Tom da superfície
          shadowColor: Colors.black26, // Sombra
          headerBackgroundColor: Cores.COR_VERDE, // Cor do cabeçalho
          headerForegroundColor: Colors.white, // Cor do texto do cabeçalho
          rangeSelectionBackgroundColor: Cores.COR_VERDE.withAlpha(40), // Cor do fundo da seleção de intervalo
          rangeSelectionOverlayColor: MaterialStateProperty.all(Cores.COR_VERDE.withAlpha(30)), // Cor ao passar o mouse por cima
          todayBackgroundColor: WidgetStateColor.resolveWith((states) {
            if(states.contains(WidgetState.selected)){
              return Cores.COR_VERDE;
            }
            return Cores.COR_BRANCO;
          }),
          todayForegroundColor: WidgetStateColor.resolveWith((states) {
            if(states.contains(WidgetState.selected)){
              return Cores.COR_BRANCO;
            }
            return Cores.COR_VERDE;
          }),
          dayBackgroundColor: WidgetStateColor.resolveWith((states) {
            if(states.contains(WidgetState.selected)){
              return Cores.COR_VERDE;
            }
            return Colors.transparent;
          }),
          dayForegroundColor: WidgetStateColor.resolveWith((states) {
            if(states.contains(WidgetState.selected)){
              return Cores.COR_BRANCO;
            }
            return Cores.COR_CINZA_ESCURO;
          }),
          confirmButtonStyle: ButtonStyle(
            foregroundColor: WidgetStateColor.resolveWith((states) {
              return Cores.COR_VERDE;
            }),
          ),
          cancelButtonStyle: ButtonStyle(
            foregroundColor: WidgetStateColor.resolveWith((states) {
              return Cores.COR_CINZA_ESCURO;
            }),
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ), // Borda do calendário
        ),
        bottomNavigationBarTheme: BottomNavigationBarThemeData(
          selectedItemColor: Cores.COR_VERDE
        )
      ),
    )
  );
}