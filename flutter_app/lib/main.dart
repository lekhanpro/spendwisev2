import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'constants/app_constants.dart';
import 'providers/app_provider.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/transactions_screen.dart';
import 'screens/budget_screen.dart';
import 'screens/goals_screen.dart';
import 'screens/reports_screen.dart';
import 'screens/insights_screen.dart';
import 'screens/settings_screen.dart';
import 'widgets/transaction_modal.dart';
import 'widgets/ai_chatbot.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint('Firebase init error: $e');
  }
  runApp(
    ChangeNotifierProvider(
      create: (_) => AppProvider(),
      child: const SpendWiseApp(),
    ),
  );
}

class SpendWiseApp extends StatelessWidget {
  const SpendWiseApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SpendWise',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: AppColors.background,
        colorScheme: const ColorScheme.dark(
          primary: AppColors.primary,
          surface: AppColors.card,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.background,
          elevation: 0,
        ),
      ),
      home: Consumer<AppProvider>(
        builder: (ctx, p, _) {
          if (p.isLoading) {
            return const Scaffold(
              backgroundColor: AppColors.background,
              body: Center(child: CircularProgressIndicator(color: AppColors.primary)),
            );
          }
          if (p.user == null) return const LoginScreen();
          return const HomeShell();
        },
      ),
    );
  }
}

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _currentIndex = 0;

  final _screens = const [
    DashboardScreen(),
    TransactionsScreen(),
    BudgetScreen(),
    GoalsScreen(),
    ReportsScreen(),
    InsightsScreen(),
    SettingsScreen(),
  ];

  final _titles = const [
    'Dashboard',
    'Transactions',
    'Budget',
    'Goals',
    'Reports',
    'AI Insights',
    'Settings',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(_titles[_currentIndex], style: const TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          if (_currentIndex == 1)
            IconButton(
              onPressed: _showAddTransaction,
              icon: const Icon(Icons.add_circle_outline),
            ),
        ],
      ),
      body: _screens[_currentIndex],
      floatingActionButton: FloatingActionButton(
        onPressed: _showChatbot,
        backgroundColor: AppColors.primary,
        child: const Text('\u{1F916}', style: TextStyle(fontSize: 24)),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
        type: BottomNavigationBarType.fixed,
        backgroundColor: AppColors.card,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textSecondary,
        selectedFontSize: 11,
        unselectedFontSize: 11,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.receipt_long), label: 'Txns'),
          BottomNavigationBarItem(icon: Icon(Icons.account_balance_wallet), label: 'Budget'),
          BottomNavigationBarItem(icon: Icon(Icons.flag), label: 'Goals'),
          BottomNavigationBarItem(icon: Icon(Icons.bar_chart), label: 'Reports'),
          BottomNavigationBarItem(icon: Icon(Icons.auto_awesome), label: 'AI'),
          BottomNavigationBarItem(icon: Icon(Icons.settings), label: 'Settings'),
        ],
      ),
    );
  }

  void _showAddTransaction() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const TransactionModal(),
    );
  }

  void _showChatbot() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const AIChatbot(),
    );
  }
}
