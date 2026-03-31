import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';
import '../models/models.dart';
import '../providers/app_provider.dart';
import '../widgets/glass_card.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notificationsEnabled = false;
  bool _dailyReminder = false;
  bool _budgetAlerts = true;
  bool _weeklyInsights = false;
  final _apiKeyCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadPrefs();
  }

  void _loadPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _notificationsEnabled = prefs.getBool('notifications') ?? false;
      _dailyReminder = prefs.getBool('dailyReminder') ?? false;
      _budgetAlerts = prefs.getBool('budgetAlerts') ?? true;
      _weeklyInsights = prefs.getBool('weeklyInsights') ?? false;
      _apiKeyCtrl.text = prefs.getString('groqApiKey') ?? '';
    });
    if (_apiKeyCtrl.text.isNotEmpty) {
      context.read<AppProvider>().setGroqApiKey(_apiKeyCtrl.text);
    }
  }

  void _savePrefs() async {
    final prefs = await SharedPreferences.getInstance();
    prefs.setBool('notifications', _notificationsEnabled);
    prefs.setBool('dailyReminder', _dailyReminder);
    prefs.setBool('budgetAlerts', _budgetAlerts);
    prefs.setBool('weeklyInsights', _weeklyInsights);
  }

  @override
  void dispose() {
    _apiKeyCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AppProvider>(
      builder: (ctx, p, _) {
        final email = p.user?.email ?? 'Unknown';
        final initial = email.isNotEmpty ? email[0].toUpperCase() : '?';

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // User info
              GlassCard(
                child: Row(
                  children: [
                    Container(
                      width: 50, height: 50,
                      decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
                      child: Center(child: Text(initial, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold))),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(p.user?.displayName ?? email.split('@')[0], style: const TextStyle(color: AppColors.text, fontWeight: FontWeight.bold, fontSize: 16)),
                          Text(email, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Stats
              GlassCard(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _stat('${p.transactions.length}', 'Transactions'),
                    _stat('${p.budgets.length}', 'Budgets'),
                    _stat('${p.goals.length}', 'Goals'),
                  ],
                ),
              ),

              // AI API Key
              const Text('AI Settings', style: TextStyle(color: AppColors.text, fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Groq API Key', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _apiKeyCtrl,
                      obscureText: true,
                      style: const TextStyle(color: AppColors.text),
                      onChanged: (v) async {
                        context.read<AppProvider>().setGroqApiKey(v);
                        final prefs = await SharedPreferences.getInstance();
                        prefs.setString('groqApiKey', v);
                      },
                      decoration: InputDecoration(
                        hintText: 'Enter your Groq API key',
                        hintStyle: const TextStyle(color: AppColors.textSecondary),
                        filled: true, fillColor: AppColors.background,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: AppColors.border)),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: AppColors.border)),
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text('Get your key at console.groq.com', style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                  ],
                ),
              ),

              // Notifications
              const Text('Notifications', style: TextStyle(color: AppColors.text, fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              GlassCard(
                child: Column(
                  children: [
                    _toggle('Enable Notifications', _notificationsEnabled, (v) => setState(() { _notificationsEnabled = v; _savePrefs(); })),
                    if (_notificationsEnabled) ...[
                      const Divider(color: AppColors.border),
                      _toggle('Daily Reminder (8 PM)', _dailyReminder, (v) => setState(() { _dailyReminder = v; _savePrefs(); })),
                      _toggle('Budget Alerts', _budgetAlerts, (v) => setState(() { _budgetAlerts = v; _savePrefs(); })),
                      _toggle('Weekly Insights', _weeklyInsights, (v) => setState(() { _weeklyInsights = v; _savePrefs(); })),
                    ],
                  ],
                ),
              ),

              // Preferences
              const Text('Preferences', style: TextStyle(color: AppColors.text, fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              GlassCard(
                child: Column(
                  children: [
                    // Currency
                    GestureDetector(
                      onTap: () => _showCurrencyPicker(context),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Row(
                          children: [
                            const Icon(Icons.attach_money, color: AppColors.textSecondary),
                            const SizedBox(width: 12),
                            const Expanded(child: Text('Currency', style: TextStyle(color: AppColors.text))),
                            Text('${p.currency.symbol} ${p.currency.code}', style: const TextStyle(color: AppColors.primary)),
                            const SizedBox(width: 4),
                            const Icon(Icons.chevron_right, color: AppColors.textSecondary),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Danger zone
              const SizedBox(height: 16),
              const Text('Danger Zone', style: TextStyle(color: AppColors.danger, fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              GlassCard(
                child: Column(
                  children: [
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: () => _confirmReset(context),
                        style: OutlinedButton.styleFrom(foregroundColor: AppColors.danger, side: const BorderSide(color: AppColors.danger)),
                        child: const Text('Reset All Data'),
                      ),
                    ),
                    const SizedBox(height: 8),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => _confirmLogout(context),
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
                        child: const Text('Logout', style: TextStyle(color: Colors.white)),
                      ),
                    ),
                  ],
                ),
              ),

              // App info
              const SizedBox(height: 24),
              const Center(
                child: Column(
                  children: [
                    Text('\u{1F4B0} SpendWise', style: TextStyle(color: AppColors.text, fontSize: 16, fontWeight: FontWeight.bold)),
                    SizedBox(height: 4),
                    Text('Version 2.2.1 - AI Edition', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                    Text('Powered by Groq AI', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                  ],
                ),
              ),
              const SizedBox(height: 80),
            ],
          ),
        );
      },
    );
  }

  Widget _stat(String value, String label) {
    return Column(
      children: [
        Text(value, style: const TextStyle(color: AppColors.primary, fontSize: 20, fontWeight: FontWeight.bold)),
        Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
      ],
    );
  }

  Widget _toggle(String label, bool value, ValueChanged<bool> onChanged) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Expanded(child: Text(label, style: const TextStyle(color: AppColors.text))),
          Switch(value: value, onChanged: onChanged, activeColor: AppColors.primary),
        ],
      ),
    );
  }

  void _showCurrencyPicker(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.card,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => ListView(
        shrinkWrap: true,
        children: supportedCurrencies.map((c) => ListTile(
          leading: Text(c.symbol, style: const TextStyle(fontSize: 20, color: AppColors.text)),
          title: Text(c.name, style: const TextStyle(color: AppColors.text)),
          subtitle: Text(c.code, style: const TextStyle(color: AppColors.textSecondary)),
          onTap: () {
            context.read<AppProvider>().setCurrency(c);
            Navigator.pop(ctx);
          },
        )).toList(),
      ),
    );
  }

  void _confirmReset(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.card,
        title: const Text('Reset All Data', style: TextStyle(color: AppColors.text)),
        content: const Text('This will delete all your transactions, budgets, and goals. This cannot be undone.', style: TextStyle(color: AppColors.textSecondary)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          TextButton(
            onPressed: () { context.read<AppProvider>().resetAllData(); Navigator.pop(ctx); },
            child: const Text('Reset', style: TextStyle(color: AppColors.danger)),
          ),
        ],
      ),
    );
  }

  void _confirmLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.card,
        title: const Text('Logout', style: TextStyle(color: AppColors.text)),
        content: const Text('Are you sure you want to logout?', style: TextStyle(color: AppColors.textSecondary)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          TextButton(
            onPressed: () { context.read<AppProvider>().signOut(); Navigator.pop(ctx); },
            child: const Text('Logout', style: TextStyle(color: AppColors.danger)),
          ),
        ],
      ),
    );
  }
}
