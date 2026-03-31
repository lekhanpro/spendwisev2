import 'package:firebase_database/firebase_database.dart';
import '../models/models.dart';

class DatabaseService {
  final FirebaseDatabase _db = FirebaseDatabase.instance;

  String _userPath(String uid) => 'users/$uid';

  // Transactions
  Future<void> saveTransactions(String uid, List<AppTransaction> txns) async {
    await _db.ref('${_userPath(uid)}/transactions').set(txns.map((t) => t.toJson()).toList());
  }

  Stream<List<AppTransaction>> transactionsStream(String uid) {
    return _db.ref('${_userPath(uid)}/transactions').onValue.map((event) {
      if (event.snapshot.value == null) return <AppTransaction>[];
      final list = event.snapshot.value;
      if (list is List) {
        return list.whereType<Map>().map((m) => AppTransaction.fromJson(Map<String, dynamic>.from(m))).toList();
      }
      if (list is Map) {
        return list.values.whereType<Map>().map((m) => AppTransaction.fromJson(Map<String, dynamic>.from(m))).toList();
      }
      return <AppTransaction>[];
    });
  }

  // Budgets
  Future<void> saveBudgets(String uid, List<Budget> budgets) async {
    await _db.ref('${_userPath(uid)}/budgets').set(budgets.map((b) => b.toJson()).toList());
  }

  Stream<List<Budget>> budgetsStream(String uid) {
    return _db.ref('${_userPath(uid)}/budgets').onValue.map((event) {
      if (event.snapshot.value == null) return <Budget>[];
      final list = event.snapshot.value;
      if (list is List) {
        return list.whereType<Map>().map((m) => Budget.fromJson(Map<String, dynamic>.from(m))).toList();
      }
      if (list is Map) {
        return list.values.whereType<Map>().map((m) => Budget.fromJson(Map<String, dynamic>.from(m))).toList();
      }
      return <Budget>[];
    });
  }

  // Goals
  Future<void> saveGoals(String uid, List<Goal> goals) async {
    await _db.ref('${_userPath(uid)}/goals').set(goals.map((g) => g.toJson()).toList());
  }

  Stream<List<Goal>> goalsStream(String uid) {
    return _db.ref('${_userPath(uid)}/goals').onValue.map((event) {
      if (event.snapshot.value == null) return <Goal>[];
      final list = event.snapshot.value;
      if (list is List) {
        return list.whereType<Map>().map((m) => Goal.fromJson(Map<String, dynamic>.from(m))).toList();
      }
      if (list is Map) {
        return list.values.whereType<Map>().map((m) => Goal.fromJson(Map<String, dynamic>.from(m))).toList();
      }
      return <Goal>[];
    });
  }

  // Settings
  Future<void> saveSettings(String uid, {required bool darkMode, required AppCurrency currency}) async {
    await _db.ref('${_userPath(uid)}/settings').set({
      'darkMode': darkMode,
      'currency': currency.toJson(),
    });
  }

  Stream<Map<String, dynamic>?> settingsStream(String uid) {
    return _db.ref('${_userPath(uid)}/settings').onValue.map((event) {
      if (event.snapshot.value == null) return null;
      return Map<String, dynamic>.from(event.snapshot.value as Map);
    });
  }

  // Reset all data
  Future<void> resetAllData(String uid) async {
    await _db.ref(_userPath(uid)).remove();
  }
}
