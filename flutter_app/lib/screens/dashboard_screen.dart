import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import '../constants/app_constants.dart';
import '../models/models.dart';
import '../providers/app_provider.dart';
import '../widgets/glass_card.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  String _greeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AppProvider>(
      builder: (ctx, p, _) {
        final sym = p.currency.symbol;
        final balance = p.monthBalance;
        final income = p.monthIncome;
        final expenses = p.monthExpenses;
        final savings = p.savingsRate;

        // 7-day spending
        final now = DateTime.now();
        final spots = <FlSpot>[];
        for (int i = 6; i >= 0; i--) {
          final day = now.subtract(Duration(days: i));
          final dayStart = DateTime(day.year, day.month, day.day).millisecondsSinceEpoch;
          final dayEnd = dayStart + 86400000;
          final total = p.transactions
              .where((t) => t.type == TransactionType.expense && t.date >= dayStart && t.date < dayEnd)
              .fold(0.0, (s, t) => s + t.amount);
          spots.add(FlSpot((6 - i).toDouble(), total));
        }

        // Budget alerts
        final alerts = <Budget>[];
        for (final b in p.budgets) {
          final spent = p.monthTransactions.where((t) => t.type == TransactionType.expense && t.category == b.category).fold(0.0, (s, t) => s + t.amount);
          if (spent / b.limit >= 0.8) alerts.add(b);
        }

        // Recent transactions
        final recent = List<AppTransaction>.from(p.transactions)..sort((a, b) => b.date.compareTo(a.date));
        final recentFive = recent.take(5).toList();

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(_greeting(), style: const TextStyle(color: AppColors.text, fontSize: 24, fontWeight: FontWeight.bold)),
              Text(DateFormat('EEEE, MMMM d').format(now), style: const TextStyle(color: AppColors.textSecondary)),
              const SizedBox(height: 16),

              // Balance Card
              GlassCard(
                child: Column(
                  children: [
                    const Text('Current Balance', style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
                    const SizedBox(height: 4),
                    Text('$sym${balance.toStringAsFixed(2)}',
                      style: TextStyle(color: balance >= 0 ? AppColors.success : AppColors.danger, fontSize: 32, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(child: _statItem('\u{2B06}\u{FE0F}', 'Income', '$sym${income.toStringAsFixed(0)}', AppColors.success)),
                        Expanded(child: _statItem('\u{2B07}\u{FE0F}', 'Expenses', '$sym${expenses.toStringAsFixed(0)}', AppColors.danger)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Text('Savings Rate', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                        const Spacer(),
                        Text('${savings.toStringAsFixed(1)}%', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: (savings / 100).clamp(0, 1),
                        backgroundColor: AppColors.border,
                        valueColor: const AlwaysStoppedAnimation(AppColors.primary),
                        minHeight: 6,
                      ),
                    ),
                  ],
                ),
              ),

              // Budget alerts
              if (alerts.isNotEmpty) ...[
                const Text('Budget Alerts', style: TextStyle(color: AppColors.warning, fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                for (final b in alerts)
                  Builder(builder: (_) {
                    final spent = p.monthTransactions.where((t) => t.type == TransactionType.expense && t.category == b.category).fold(0.0, (s, t) => s + t.amount);
                    final pct = spent / b.limit;
                    final cat = getCategoryById(b.category);
                    return GlassCard(
                      color: (pct >= 1 ? AppColors.danger : AppColors.warning).withValues(alpha: 0.15),
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        children: [
                          Text(cat?.icon ?? '\u{1F4E6}', style: const TextStyle(fontSize: 20)),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(cat?.name ?? b.category, style: const TextStyle(color: AppColors.text, fontWeight: FontWeight.w600)),
                                Text('$sym${spent.toStringAsFixed(0)} / $sym${b.limit.toStringAsFixed(0)}', style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                              ],
                            ),
                          ),
                          Text('${(pct * 100).toStringAsFixed(0)}%', style: TextStyle(color: pct >= 1 ? AppColors.danger : AppColors.warning, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    );
                  }),
                const SizedBox(height: 8),
              ],

              // Quick stats
              Row(
                children: [
                  Expanded(
                    child: GlassCard(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        children: [
                          Text('${p.monthTransactions.length}', style: const TextStyle(color: AppColors.primary, fontSize: 24, fontWeight: FontWeight.bold)),
                          const Text('Transactions', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: GlassCard(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        children: [
                          Text('${p.budgets.length}', style: const TextStyle(color: AppColors.primary, fontSize: 24, fontWeight: FontWeight.bold)),
                          const Text('Active Budgets', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),

              // 7-day chart
              const Text('7-Day Spending Trend', style: TextStyle(color: AppColors.text, fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              GlassCard(
                child: SizedBox(
                  height: 200,
                  child: LineChart(
                    LineChartData(
                      gridData: const FlGridData(show: false),
                      titlesData: FlTitlesData(
                        leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            getTitlesWidget: (v, _) {
                              final d = now.subtract(Duration(days: 6 - v.toInt()));
                              return Text(DateFormat('E').format(d).substring(0, 2), style: const TextStyle(color: AppColors.textSecondary, fontSize: 10));
                            },
                          ),
                        ),
                      ),
                      borderData: FlBorderData(show: false),
                      lineBarsData: [
                        LineChartBarData(
                          spots: spots,
                          isCurved: true,
                          color: AppColors.primary,
                          barWidth: 3,
                          dotData: const FlDotData(show: true),
                          belowBarData: BarAreaData(show: true, color: AppColors.primary.withValues(alpha: 0.1)),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // Recent transactions
              const Text('Recent Transactions', style: TextStyle(color: AppColors.text, fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              for (final t in recentFive)
                Builder(builder: (_) {
                  final cat = getCategoryById(t.category);
                  return GlassCard(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Text(cat?.icon ?? '\u{1F4E6}', style: const TextStyle(fontSize: 24)),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(cat?.name ?? t.category, style: const TextStyle(color: AppColors.text, fontWeight: FontWeight.w600)),
                              Text(t.description.isNotEmpty ? t.description : DateFormat('MMM d').format(DateTime.fromMillisecondsSinceEpoch(t.date)),
                                style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                            ],
                          ),
                        ),
                        Text(
                          '${t.type == TransactionType.income ? '+' : '-'}$sym${t.amount.toStringAsFixed(2)}',
                          style: TextStyle(color: t.type == TransactionType.income ? AppColors.success : AppColors.danger, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  );
                }),
              const SizedBox(height: 80),
            ],
          ),
        );
      },
    );
  }

  Widget _statItem(String icon, String label, String value, Color color) {
    return Row(
      children: [
        Text(icon, style: const TextStyle(fontSize: 16)),
        const SizedBox(width: 4),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
            Text(value, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 15)),
          ],
        ),
      ],
    );
  }
}
