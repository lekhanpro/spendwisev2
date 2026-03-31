import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../constants/app_constants.dart';
import '../providers/app_provider.dart';
import '../services/ai_service.dart';
import '../widgets/glass_card.dart';

class InsightsScreen extends StatefulWidget {
  const InsightsScreen({super.key});

  @override
  State<InsightsScreen> createState() => _InsightsScreenState();
}

class _InsightsScreenState extends State<InsightsScreen> {
  SpendingAnalysis? _analysis;
  String _quickTip = '';
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadInsights();
  }

  void _loadInsights() async {
    setState(() => _loading = true);
    final p = context.read<AppProvider>();
    _quickTip = p.ai.getQuickTip();
    _analysis = await p.ai.getFinancialInsights(p.transactions, p.budgets, p.goals, p.currency.symbol);
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: AppColors.primary),
            SizedBox(height: 16),
            Text('Analyzing your finances...', style: TextStyle(color: AppColors.textSecondary)),
          ],
        ),
      );
    }

    final a = _analysis!;
    final scoreColor = a.healthScore >= 70 ? AppColors.success : a.healthScore >= 40 ? AppColors.warning : AppColors.danger;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Health score
          Center(
            child: GlassCard(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  const Text('Financial Health Score', style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
                  const SizedBox(height: 12),
                  Container(
                    width: 100, height: 100,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: scoreColor, width: 4),
                    ),
                    child: Center(child: Text('${a.healthScore}', style: TextStyle(color: scoreColor, fontSize: 36, fontWeight: FontWeight.bold))),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    a.healthScore >= 70 ? 'Great!' : a.healthScore >= 40 ? 'Good' : 'Needs Work',
                    style: TextStyle(color: scoreColor, fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
          ),

          // Quick tip
          GlassCard(
            color: const Color(0xFF8B5CF6).withValues(alpha: 0.15),
            child: Text(_quickTip, style: const TextStyle(color: AppColors.text, fontSize: 15)),
          ),

          // AI Insights
          const Text('AI Insights', style: TextStyle(color: AppColors.text, fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          for (final insight in a.insights)
            Builder(builder: (_) {
              final color = switch (insight.type) {
                'success' => AppColors.success,
                'warning' => AppColors.warning,
                'tip' => AppColors.primary,
                _ => const Color(0xFF8B5CF6),
              };
              return GlassCard(
                color: color.withValues(alpha: 0.1),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(insight.icon, style: const TextStyle(fontSize: 24)),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(insight.title, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 15)),
                          const SizedBox(height: 4),
                          Text(insight.message, style: const TextStyle(color: AppColors.text, fontSize: 13)),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            }),
          const SizedBox(height: 16),

          // Recommendations
          const Text('Recommendations', style: TextStyle(color: AppColors.text, fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          GlassCard(
            child: Column(
              children: a.recommendations.asMap().entries.map((e) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 24, height: 24,
                      decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                      child: Center(child: Text('${e.key + 1}', style: const TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.bold))),
                    ),
                    const SizedBox(width: 12),
                    Expanded(child: Text(e.value, style: const TextStyle(color: AppColors.text, fontSize: 14))),
                  ],
                ),
              )).toList(),
            ),
          ),
          const SizedBox(height: 16),

          // Refresh
          Center(
            child: ElevatedButton.icon(
              onPressed: _loadInsights,
              icon: const Icon(Icons.refresh, color: Colors.white),
              label: const Text('Refresh Insights', style: TextStyle(color: Colors.white)),
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
            ),
          ),
          const SizedBox(height: 80),
        ],
      ),
    );
  }
}
