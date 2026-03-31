import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../constants/app_constants.dart';
import '../models/models.dart';
import '../providers/app_provider.dart';
import '../widgets/glass_card.dart';

class GoalsScreen extends StatelessWidget {
  const GoalsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AppProvider>(
      builder: (ctx, p, _) {
        final sym = p.currency.symbol;
        if (p.goals.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('\u{1F3AF}', style: TextStyle(fontSize: 48)),
                const SizedBox(height: 8),
                const Text('No goals yet', style: TextStyle(color: AppColors.textSecondary, fontSize: 16)),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => _showGoalDialog(context, null),
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                  child: const Text('Add Goal', style: TextStyle(color: Colors.white)),
                ),
              ],
            ),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: p.goals.length + 1,
          itemBuilder: (ctx, i) {
            if (i == p.goals.length) return const SizedBox(height: 80);
            final g = p.goals[i];
            final priorityColor = g.priority == Priority.high ? AppColors.danger : g.priority == Priority.medium ? AppColors.warning : AppColors.success;

            return GestureDetector(
              onTap: () => _showGoalDialog(context, g),
              onLongPress: () => _delete(context, g),
              child: GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(g.name, style: const TextStyle(color: AppColors.text, fontWeight: FontWeight.bold, fontSize: 16)),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(color: priorityColor.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(8)),
                          child: Text(g.priority.name[0].toUpperCase() + g.priority.name.substring(1), style: TextStyle(color: priorityColor, fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                        if (g.isComplete) ...[
                          const SizedBox(width: 8),
                          const Icon(Icons.check_circle, color: AppColors.success, size: 20),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      g.isComplete ? 'Completed!' : g.daysLeft > 0 ? '${g.daysLeft} days remaining' : 'Overdue',
                      style: TextStyle(color: g.isComplete ? AppColors.success : g.daysLeft <= 0 ? AppColors.danger : AppColors.textSecondary, fontSize: 12),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('$sym${g.currentAmount.toStringAsFixed(0)}', style: const TextStyle(color: AppColors.text, fontWeight: FontWeight.bold)),
                        Text('$sym${g.targetAmount.toStringAsFixed(0)}', style: const TextStyle(color: AppColors.textSecondary)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: g.progress,
                        backgroundColor: AppColors.border,
                        valueColor: AlwaysStoppedAnimation(g.isComplete ? AppColors.success : AppColors.primary),
                        minHeight: 8,
                      ),
                    ),
                    if (!g.isComplete) ...[
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [100, 500, 1000].map((amt) => _quickAddButton(context, g.id, amt.toDouble(), sym)).toList(),
                      ),
                    ],
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _quickAddButton(BuildContext context, String goalId, double amount, String sym) {
    return OutlinedButton(
      onPressed: () => context.read<AppProvider>().addToGoal(goalId, amount),
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.primary,
        side: const BorderSide(color: AppColors.border),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      ),
      child: Text('+$sym${amount.toStringAsFixed(0)}', style: const TextStyle(fontSize: 12)),
    );
  }

  void _showGoalDialog(BuildContext context, Goal? existing) {
    final nameCtrl = TextEditingController(text: existing?.name ?? '');
    final targetCtrl = TextEditingController(text: existing?.targetAmount.toString() ?? '');
    final currentCtrl = TextEditingController(text: existing?.currentAmount.toString() ?? '0');
    final dateCtrl = TextEditingController(
      text: existing != null ? DateTime.fromMillisecondsSinceEpoch(existing.deadline).toIso8601String().substring(0, 10) : '',
    );
    Priority priority = existing?.priority ?? Priority.medium;

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
                Text(existing != null ? 'Edit Goal' : 'Add Goal', style: const TextStyle(color: AppColors.text, fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                _field(nameCtrl, 'Goal Name'),
                const SizedBox(height: 12),
                _field(targetCtrl, 'Target Amount', isNumber: true),
                const SizedBox(height: 12),
                _field(currentCtrl, 'Current Amount', isNumber: true),
                const SizedBox(height: 12),
                GestureDetector(
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: existing != null ? DateTime.fromMillisecondsSinceEpoch(existing.deadline) : DateTime.now().add(const Duration(days: 90)),
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 3650)),
                    );
                    if (picked != null) dateCtrl.text = picked.toIso8601String().substring(0, 10);
                  },
                  child: AbsorbPointer(child: _field(dateCtrl, 'Deadline (YYYY-MM-DD)')),
                ),
                const SizedBox(height: 16),
                Row(
                  children: Priority.values.map((pr) {
                    final sel = priority == pr;
                    final c = pr == Priority.high ? AppColors.danger : pr == Priority.medium ? AppColors.warning : AppColors.success;
                    return Expanded(child: GestureDetector(
                      onTap: () => setState(() => priority = pr),
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: sel ? c.withValues(alpha: 0.2) : Colors.transparent,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: sel ? c : AppColors.border),
                        ),
                        child: Center(child: Text(pr.name[0].toUpperCase() + pr.name.substring(1), style: TextStyle(color: sel ? c : AppColors.textSecondary, fontWeight: FontWeight.w600))),
                      ),
                    ));
                  }).toList(),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity, height: 50,
                  child: ElevatedButton(
                    onPressed: () {
                      final name = nameCtrl.text.trim();
                      final target = double.tryParse(targetCtrl.text) ?? 0;
                      final current = double.tryParse(currentCtrl.text) ?? 0;
                      final date = DateTime.tryParse(dateCtrl.text);
                      if (name.isEmpty || target <= 0 || date == null) return;

                      final provider = context.read<AppProvider>();
                      final goal = Goal(
                        id: existing?.id ?? generateId(),
                        name: name, targetAmount: target, currentAmount: current,
                        deadline: date.millisecondsSinceEpoch, priority: priority,
                      );
                      if (existing != null) { provider.updateGoal(goal); } else { provider.addGoal(goal); }
                      Navigator.pop(ctx);
                    },
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                    child: Text(existing != null ? 'Update' : 'Add Goal', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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

  Widget _field(TextEditingController ctrl, String hint, {bool isNumber = false}) {
    return TextField(
      controller: ctrl,
      keyboardType: isNumber ? const TextInputType.numberWithOptions(decimal: true) : TextInputType.text,
      style: const TextStyle(color: AppColors.text),
      decoration: InputDecoration(
        hintText: hint, hintStyle: const TextStyle(color: AppColors.textSecondary),
        filled: true, fillColor: AppColors.background,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.border)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.border)),
      ),
    );
  }

  void _delete(BuildContext context, Goal g) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.card,
        title: const Text('Delete Goal', style: TextStyle(color: AppColors.text)),
        content: const Text('Are you sure?', style: TextStyle(color: AppColors.textSecondary)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          TextButton(onPressed: () { context.read<AppProvider>().deleteGoal(g.id); Navigator.pop(ctx); }, child: const Text('Delete', style: TextStyle(color: AppColors.danger))),
        ],
      ),
    );
  }
}
