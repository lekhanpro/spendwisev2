import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../constants/app_constants.dart';
import '../models/models.dart';
import '../providers/app_provider.dart';
import '../widgets/glass_card.dart';
import '../widgets/transaction_modal.dart';

class TransactionsScreen extends StatefulWidget {
  const TransactionsScreen({super.key});

  @override
  State<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends State<TransactionsScreen> {
  String _filter = 'all'; // all, income, expense

  @override
  Widget build(BuildContext context) {
    return Consumer<AppProvider>(
      builder: (ctx, p, _) {
        final sym = p.currency.symbol;
        var txns = List<AppTransaction>.from(p.transactions);
        if (_filter == 'income') txns = txns.where((t) => t.type == TransactionType.income).toList();
        if (_filter == 'expense') txns = txns.where((t) => t.type == TransactionType.expense).toList();
        txns.sort((a, b) => b.date.compareTo(a.date));

        return Column(
          children: [
            // Filter tabs
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: ['all', 'income', 'expense'].map((f) {
                  final selected = _filter == f;
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _filter = f),
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: selected ? AppColors.primary.withValues(alpha: 0.2) : Colors.transparent,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: selected ? AppColors.primary : AppColors.border),
                        ),
                        child: Center(
                          child: Text(
                            f[0].toUpperCase() + f.substring(1),
                            style: TextStyle(color: selected ? AppColors.primary : AppColors.textSecondary, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            // List
            Expanded(
              child: txns.isEmpty
                  ? const Center(child: Text('No transactions yet', style: TextStyle(color: AppColors.textSecondary)))
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: txns.length,
                      itemBuilder: (ctx, i) {
                        final t = txns[i];
                        final cat = getCategoryById(t.category);
                        return GestureDetector(
                          onTap: () => _edit(t),
                          onLongPress: () => _delete(t),
                          child: GlassCard(
                            padding: const EdgeInsets.all(12),
                            child: Row(
                              children: [
                                Container(
                                  width: 44, height: 44,
                                  decoration: BoxDecoration(
                                    color: hexToColor(cat?.color ?? '#64748b').withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Center(child: Text(cat?.icon ?? '\u{1F4E6}', style: const TextStyle(fontSize: 20))),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(cat?.name ?? t.category, style: const TextStyle(color: AppColors.text, fontWeight: FontWeight.w600)),
                                      Text(
                                        t.description.isNotEmpty ? t.description : DateFormat('MMM d, yyyy').format(DateTime.fromMillisecondsSinceEpoch(t.date)),
                                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                                      ),
                                    ],
                                  ),
                                ),
                                Text(
                                  '${t.type == TransactionType.income ? '+' : '-'}$sym${t.amount.toStringAsFixed(2)}',
                                  style: TextStyle(color: t.type == TransactionType.income ? AppColors.success : AppColors.danger, fontWeight: FontWeight.bold, fontSize: 16),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        );
      },
    );
  }

  void _edit(AppTransaction t) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => TransactionModal(transaction: t),
    );
  }

  void _delete(AppTransaction t) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.card,
        title: const Text('Delete Transaction', style: TextStyle(color: AppColors.text)),
        content: const Text('Are you sure?', style: TextStyle(color: AppColors.textSecondary)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          TextButton(
            onPressed: () {
              context.read<AppProvider>().deleteTransaction(t.id);
              Navigator.pop(ctx);
            },
            child: const Text('Delete', style: TextStyle(color: AppColors.danger)),
          ),
        ],
      ),
    );
  }
}
