import 'dart:async';
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/models.dart';
import '../services/firebase_service.dart';
import '../services/ai_service.dart';
import '../constants/app_constants.dart';

class AppProvider extends ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final DatabaseService _db = DatabaseService();
  final AIService _ai = AIService();

  User? _user;
  List<AppTransaction> _transactions = [];
  List<Budget> _budgets = [];
  List<Goal> _goals = [];
  AppCurrency _currency = supportedCurrencies[0];
  bool _darkMode = true;
  bool _isLoading = true;

  StreamSubscription? _txnSub;
  StreamSubscription? _budgetSub;
  StreamSubscription? _goalSub;
  StreamSubscription? _settingsSub;

  User? get user => _user;
  List<AppTransaction> get transactions => _transactions;
  List<Budget> get budgets => _budgets;
  List<Goal> get goals => _goals;
  AppCurrency get currency => _currency;
  bool get darkMode => _darkMode;
  bool get isLoading => _isLoading;
  AIService get ai => _ai;

  AppProvider() {
    _init();
  }

  void _init() {
    try {
      _auth.authStateChanges().listen((user) {
        _user = user;
        if (user != null) {
          _subscribeToData(user.uid);
        } else {
          _cancelSubscriptions();
          _transactions = [];
          _budgets = [];
          _goals = [];
        }
        _isLoading = false;
        notifyListeners();
      }, onError: (e) {
        debugPrint('Auth error: $e');
        _isLoading = false;
        notifyListeners();
      });
    } catch (e) {
      debugPrint('Firebase not initialized: $e');
      _isLoading = false;
      notifyListeners();
    }
  }

  void _subscribeToData(String uid) {
    _cancelSubscriptions();
    _txnSub = _db.transactionsStream(uid).listen((txns) {
      _transactions = txns;
      notifyListeners();
    });
    _budgetSub = _db.budgetsStream(uid).listen((budgets) {
      _budgets = budgets;
      notifyListeners();
    });
    _goalSub = _db.goalsStream(uid).listen((goals) {
      _goals = goals;
      notifyListeners();
    });
    _settingsSub = _db.settingsStream(uid).listen((settings) {
      if (settings != null) {
        _darkMode = settings['darkMode'] ?? true;
        if (settings['currency'] != null) {
          _currency = AppCurrency.fromJson(Map<String, dynamic>.from(settings['currency']));
        }
        notifyListeners();
      }
    });
  }

  void _cancelSubscriptions() {
    _txnSub?.cancel();
    _budgetSub?.cancel();
    _goalSub?.cancel();
    _settingsSub?.cancel();
  }

  // Auth
  Future<void> signUp(String email, String password) async {
    final cred = await _auth.createUserWithEmailAndPassword(email: email, password: password);
    await cred.user?.sendEmailVerification();
  }

  Future<void> signIn(String email, String password) async {
    await _auth.signInWithEmailAndPassword(email: email, password: password);
  }

  Future<void> signOut() async {
    await _auth.signOut();
  }

  Future<void> resetPassword(String email) async {
    await _auth.sendPasswordResetEmail(email: email);
  }

  // Transactions
  Future<void> addTransaction(AppTransaction txn) async {
    if (_user == null) return;
    _transactions.add(txn);
    await _db.saveTransactions(_user!.uid, _transactions);
  }

  Future<void> updateTransaction(AppTransaction txn) async {
    if (_user == null) return;
    final idx = _transactions.indexWhere((t) => t.id == txn.id);
    if (idx != -1) {
      _transactions[idx] = txn;
      await _db.saveTransactions(_user!.uid, _transactions);
    }
  }

  Future<void> deleteTransaction(String id) async {
    if (_user == null) return;
    _transactions.removeWhere((t) => t.id == id);
    await _db.saveTransactions(_user!.uid, _transactions);
  }

  // Budgets
  Future<void> addBudget(Budget budget) async {
    if (_user == null) return;
    _budgets.add(budget);
    await _db.saveBudgets(_user!.uid, _budgets);
  }

  Future<void> updateBudget(Budget budget) async {
    if (_user == null) return;
    final idx = _budgets.indexWhere((b) => b.id == budget.id);
    if (idx != -1) {
      _budgets[idx] = budget;
      await _db.saveBudgets(_user!.uid, _budgets);
    }
  }

  Future<void> deleteBudget(String id) async {
    if (_user == null) return;
    _budgets.removeWhere((b) => b.id == id);
    await _db.saveBudgets(_user!.uid, _budgets);
  }

  // Goals
  Future<void> addGoal(Goal goal) async {
    if (_user == null) return;
    _goals.add(goal);
    await _db.saveGoals(_user!.uid, _goals);
  }

  Future<void> updateGoal(Goal goal) async {
    if (_user == null) return;
    final idx = _goals.indexWhere((g) => g.id == goal.id);
    if (idx != -1) {
      _goals[idx] = goal;
      await _db.saveGoals(_user!.uid, _goals);
    }
  }

  Future<void> deleteGoal(String id) async {
    if (_user == null) return;
    _goals.removeWhere((g) => g.id == id);
    await _db.saveGoals(_user!.uid, _goals);
  }

  Future<void> addToGoal(String goalId, double amount) async {
    final idx = _goals.indexWhere((g) => g.id == goalId);
    if (idx != -1) {
      _goals[idx] = _goals[idx].copyWith(currentAmount: _goals[idx].currentAmount + amount);
      await _db.saveGoals(_user!.uid, _goals);
    }
  }

  // Settings
  Future<void> setCurrency(AppCurrency c) async {
    if (_user == null) return;
    _currency = c;
    notifyListeners();
    await _db.saveSettings(_user!.uid, darkMode: _darkMode, currency: _currency);
  }

  Future<void> setDarkMode(bool v) async {
    if (_user == null) return;
    _darkMode = v;
    notifyListeners();
    await _db.saveSettings(_user!.uid, darkMode: _darkMode, currency: _currency);
  }

  Future<void> resetAllData() async {
    if (_user == null) return;
    await _db.resetAllData(_user!.uid);
  }

  void setGroqApiKey(String key) => _ai.setApiKey(key);

  // Computed
  List<AppTransaction> get monthTransactions {
    final now = DateTime.now();
    final start = DateTime(now.year, now.month, 1).millisecondsSinceEpoch;
    return _transactions.where((t) => t.date >= start).toList();
  }

  double get monthIncome => monthTransactions.where((t) => t.type == TransactionType.income).fold(0.0, (s, t) => s + t.amount);
  double get monthExpenses => monthTransactions.where((t) => t.type == TransactionType.expense).fold(0.0, (s, t) => s + t.amount);
  double get monthBalance => monthIncome - monthExpenses;
  double get savingsRate => monthIncome > 0 ? (monthBalance / monthIncome * 100) : 0;

  @override
  void dispose() {
    _cancelSubscriptions();
    super.dispose();
  }
}
