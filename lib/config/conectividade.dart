import 'package:connectivity_plus/connectivity_plus.dart';

class Conectividade {
  static Future<bool> isConectado() async {
    final List<ConnectivityResult> connectivityResults = await Connectivity().checkConnectivity();

    // Se a lista estiver vazia ou só tiver "none"
    if (connectivityResults.isEmpty || connectivityResults.contains(ConnectivityResult.none)) {
      return false;
    } else {
      return true;
    }
  }
}