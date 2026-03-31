import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import '../constants/app_constants.dart';
import '../models/models.dart';
import '../providers/app_provider.dart';
import '../widgets/glass_card.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  String _range = 'month'; // week, month, year

  @override
  Widget build(BuildContext context) {
    return Consumer<AppProvider>(
      builder: (ctx, p, _) {
        final sym = p.currency.symbol;
        final now = DateTime.now();
        late int rangeStart;
        if (_range == 'week') {
          rangeStart = now.subtract(Duration(days: now.weekday % 7)).millisecondsSinceEpoch;
        } else if (_range == 'month') {
          rangeStart = DateTime(now.year, now.month, 1).millisecondsSinceEpoch;
        } else {
          rangeStart = DateTime(now.year, 1, 1).millisecondsSinceEpoch;
        }

        final filtered = p.transactions.where((t) => t.date >= rangeStart).toList();
        final income = filtered.where((t) => t.type == TransactionType.income).fold(0.0, (s, t) => s + t.amount);
        final expenses = filtered.where((t) => t.type == TransactionType.expense).fold(0.0, (s, t) => s + t.amount);
        final savings = income - expenses;
        final savingsRate = income > 0 ? (savings / income * 100) : 0.0;

        // Category spending
        final catSpending = <String, double>{};
        for (final t in filtered.where((t) => t.type == TransactionType.expense)) {
          catSpending[t.category] = (catSpending[t.category] ?? 0) + t.amount;
        }
        final sortedCats = catSpending.entries.toList()..sort((a, b) => b.value.compareTo(a.value));
        final topCats = sortedCats.take(6).toList();

        // Daily spending (last 7 days)
        final dailySpending = <String, double>{};
        for (int i = 6; i >= 0; i--) {
          final day = now.subtract(Duration(days: i));
          final dayKey = DateFormat('E').format(day).substring(0, 3);
          final dayStart = DateTime(day.year, day.month, day.day).millisecondsSinceEpoch;
          final dayEnd = dayStart + 86400000;
          dailySpending[dayKey] = p.transactions
              .where((t) => t.type == TransactionType.expense && t.date >= dayStart && t.date < dayEnd)
              .fold(0.0, (s, t) => s + t.amount);
        }

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Range selector
              Row(
                children: ['week', 'month', 'year'].map((r) {
                  final sel = _range == r;
                  return Expanded(child: GestureDetector(
                    onTap: () => setState(() => _range = r),
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: sel ? AppColors.primary.withValues(alpha: 0.2) : Colors.transparent,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: sel ? AppColors.primary : AppColors.border),
                      ),
                      child: Center(child: Text(r[0].toUpperCase() + r.substring(1), style: TextStyle(color: sel ? AppColors.primary : AppColors.textSecondary, fontWeight: FontWeight.w600))),
                    ),
                  ));
                }).toList(),
              ),
              const SizedBox(height: 16),

              // Summary cards
              Row(
                children: [
                  Expanded(child: _summaryCard('Income', '$sym${income.toStringAsFixed(0)}', AppColors.success)),
                  const SizedBox(width: 8),
                  Expanded(child: _summaryCard('Expenses', '$sym${expenses.toStringAsFixed(0)}', AppColors.danger)),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(child: _summaryCard('Savings', '$sym${savings.toStringAsFixed(0)}', AppColors.primary)),
                  const SizedBox(width: 8),
                  Expanded(child: _summaryCard('Rate', '${savingsRate.toStringAsFixed(1)}%', const Color(0xFF8B5CF6))),
                ],
              ),
              const SizedBox(height: 16),

              // Pie chart
              if (topCats.isNotEmpty) ...[
                const Text('Spending by Category', style: TextStyle(color: AppColors.text, fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                GlassCard(
                  child: Column(
                    children: [
                      SizedBox(
                        height: 200,
                        child: PieChart(
                          PieChartData(
                            sectionsSpace: 2,
                            centerSpaceRadius: 40,
                            sections: topCats.asMap().entries.map((e) {
                              final cat = getCategoryById(e.value.key);
                              return PieChartSectionData(
                                value: e.value.value,
                                color: hexToColor(cat?.color ?? '#64748b'),
                                title: '${(e.value.value / expenses * 100).toStringAsFixed(0)}%',
                                titleStyle: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                radius: 50,
                              );
                            }).toList(),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      ...topCats.map((e) {
                        final cat = getCategoryById(e.key);
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            children: [
                              Container(width: 12, height: 12, decoration: BoxDecoration(color: hexToColor(cat?.color ?? '#64748b'), borderRadius: BorderRadius.circular(3))),
                              const SizedBox(width: 8),
                              Text(cat?.icon ?? '', style: const TextStyle(fontSize: 14)),
                              const SizedBox(width: 4),
                              Expanded(child: Text(cat?.name ?? e.key, style: const TextStyle(color: AppColors.text, fontSize: 13))),
                              Text('$sym${e.value.toStringAsFixed(0)}', style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                            ],
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 16),

              // Bar chart
              const Text('Daily Spending (7 Days)', style: TextStyle(color: AppColors.text, fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              GlassCard(
                child: SizedBox(
                  height: 200,
                  child: BarChart(
                    BarChartData(
                      gridData: const FlGridData(show: false),
                      borderData: FlBorderData(show: false),
                      titlesData: FlTitlesData(
                        leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            getTitlesWidget: (v, _) {
                              final keys = dailySpending.keys.toList();
                              if (v.toInt() < keys.length) {
                                return Text(keys[v.toInt()], style: const TextStyle(color: AppColors.textSecondary, fontSize: 10));
                              }
                              return const Text('');
                            },
                          ),
                        ),
                      ),
                      barGroups: dailySpending.entries.toList().asMap().entries.map((e) => BarChartGroupData(
                        x: e.key,
                        barRods: [
                          BarChartRodData(toY: e.value.value, color: AppColors.primary, width: 20, borderRadius: const BorderRadius.vertical(top: Radius.circular(4))),
                        ],
                      )).toList(),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Transaction stats
              GlassCard(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _stat('Total', '${filtered.length}'),
                    _stat('Expenses', '${filtered.where((t) => t.type == TransactionType.expense).length}'),
                    _stat('Income', '${filtered.where((t) => t.type == TransactionType.income).length}'),
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

  Widget _summaryCard(String label, String value, Color color) {
    return GlassCard(
      padding: const EdgeInsets.all(12),
      margin: EdgeInsets.zero,
      child: Column(
        children: [
          Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(color: color, fontSize: 18, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _stat(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(color: AppColors.primary, fontSize: 20, fontWeight: FontWeight.bold)),
        Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
      ],
    );
  }
}
