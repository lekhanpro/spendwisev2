import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../constants/app_constants.dart';
import '../models/models.dart';
import '../providers/app_provider.dart';
import '../widgets/glass_card.dart';

class BudgetScreen extends StatelessWidget {
  const BudgetScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AppProvider>(
      builder: (ctx, p, _) {
        final sym = p.currency.symbol;
        if (p.budgets.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('\u{1F4CA}', style: TextStyle(fontSize: 48)),
                const SizedBox(height: 8),
                const Text('No budgets yet', style: TextStyle(color: AppColors.textSecondary, fontSize: 16)),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => _showAddDialog(context),
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                  child: const Text('Add Budget', style: TextStyle(color: Colors.white)),
                ),
              ],
            ),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: p.budgets.length + 1,
          itemBuilder: (ctx, i) {
            if (i == p.budgets.length) return const SizedBox(height: 80);
            final b = p.budgets[i];
            final cat = getCategoryById(b.category);
            final spent = p.monthTransactions
                .where((t) => t.type == TransactionType.expense && t.category == b.category)
                .fold(0.0, (s, t) => s + t.amount);
            final pct = b.limit > 0 ? spent / b.limit : 0.0;
            final color = pct >= 1 ? AppColors.danger : pct >= 0.8 ? AppColors.warning : hexToColor(cat?.color ?? '#3b82f6');

            return GestureDetector(
              onTap: () => _showEditDialog(context, b),
              onLongPress: () => _delete(context, b),
              child: GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(cat?.icon ?? '\u{1F4E6}', style: const TextStyle(fontSize: 24)),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(cat?.name ?? b.category, style: const TextStyle(color: AppColors.text, fontWeight: FontWeight.bold, fontSize: 16)),
                              Text(b.period == Period.weekly ? 'Weekly' : 'Monthly', style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                            ],
                          ),
                        ),
                        Text('${(pct * 100).toStringAsFixed(0)}%', style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 18)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('$sym${spent.toStringAsFixed(0)} spent', style: const TextStyle(color: AppColors.textSecondary)),
                        Text('$sym${b.limit.toStringAsFixed(0)} limit', style: const TextStyle(color: AppColors.textSecondary)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: pct.clamp(0, 1),
                        backgroundColor: AppColors.border,
                        valueColor: AlwaysStoppedAnimation(color),
                        minHeight: 8,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _showAddDialog(BuildContext context) => _showBudgetDialog(context, null);
  void _showEditDialog(BuildContext context, Budget b) => _showBudgetDialog(context, b);

  void _showBudgetDialog(BuildContext context, Budget? existing) {
    final expenseCats = defaultCategories.where((c) => c.type == TransactionType.expense).toList();
    String category = existing?.category ?? expenseCats.first.id;
    double limit = existing?.limit ?? 0;
    Period period = existing?.period ?? Period.monthly;
    final limitCtrl = TextEditingController(text: existing?.limit.toString() ?? '');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setState) => Container(
          padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom, left: 20, right: 20, top: 20),
          decoration: const BoxDecoration(color: AppColors.card, borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2)))),
                const SizedBox(height: 16),
                Text(existing != null ? 'Edit Budget' : 'Add Budget', style: const TextStyle(color: AppColors.text, fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                const Text('Category', style: TextStyle(color: AppColors.textSecondary)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8, runSpacing: 8,
                  children: expenseCats.map((c) => GestureDetector(
                    onTap: () => setState(() => category = c.id),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: category == c.id ? hexToColor(c.color).withValues(alpha: 0.2) : Colors.transparent,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: category == c.id ? hexToColor(c.color) : AppColors.border),
                      ),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        Text(c.icon), const SizedBox(width: 4),
                        Text(c.name, style: TextStyle(color: category == c.id ? hexToColor(c.color) : AppColors.textSecondary, fontSize: 13)),
                      ]),
                    ),
                  )).toList(),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: limitCtrl,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  style: const TextStyle(color: AppColors.text, fontSize: 20),
                  onChanged: (v) => limit = double.tryParse(v) ?? 0,
                  decoration: InputDecoration(
                    hintText: 'Budget limit', hintStyle: const TextStyle(color: AppColors.textSecondary),
                    filled: true, fillColor: AppColors.background,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.border)),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.border)),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [Period.weekly, Period.monthly].map((pe) {
                    final sel = period == pe;
                    return Expanded(child: GestureDetector(
                      onTap: () => setState(() => period = pe),
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: sel ? AppColors.primary.withValues(alpha: 0.2) : Colors.transparent,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: sel ? AppColors.primary : AppColors.border),
                        ),
                        child: Center(child: Text(pe == Period.weekly ? 'Weekly' : 'Monthly', style: TextStyle(color: sel ? AppColors.primary : AppColors.textSecondary))),
                      ),
                    ));
                  }).toList(),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity, height: 50,
                  child: ElevatedButton(
                    onPressed: () {
                      final l = double.tryParse(limitCtrl.text) ?? 0;
                      if (l <= 0) return;
                      final provider = context.read<AppProvider>();
                      final budget = Budget(
                        id: existing?.id ?? generateId(),
                        category: category, limit: l, period: period,
                        startDate: existing?.startDate ?? DateTime.now().millisecondsSinceEpoch,
                      );
                      if (existing != null) {
                        provider.updateBudget(budget);
                      } else {
                        provider.addBudget(budget);
                      }
                      Navigator.pop(ctx);
                    },
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                    child: Text(existing != null ? 'Update' : 'Add Budget', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _delete(BuildContext context, Budget b) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.card,
        title: const Text('Delete Budget', style: TextStyle(color: AppColors.text)),
        content: const Text('Are you sure?', style: TextStyle(color: AppColors.textSecondary)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          TextButton(onPressed: () { context.read<AppProvider>().deleteBudget(b.id); Navigator.pop(ctx); }, child: const Text('Delete', style: TextStyle(color: AppColors.danger))),
        ],
      ),
    );
  }
}
