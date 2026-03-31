import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/models.dart';
import '../constants/app_constants.dart';
import '../providers/app_provider.dart';

class TransactionModal extends StatefulWidget {
  final AppTransaction? transaction;
  const TransactionModal({super.key, this.transaction});

  @override
  State<TransactionModal> createState() => _TransactionModalState();
}

class _TransactionModalState extends State<TransactionModal> {
  late TransactionType _type;
  late TextEditingController _amountCtrl;
  late TextEditingController _descCtrl;
  String _category = 'food';
  String _paymentMethod = 'cash';

  @override
  void initState() {
    super.initState();
    _type = widget.transaction?.type ?? TransactionType.expense;
    _amountCtrl = TextEditingController(text: widget.transaction?.amount.toString() ?? '');
    _descCtrl = TextEditingController(text: widget.transaction?.description ?? '');
    _category = widget.transaction?.category ?? (_type == TransactionType.expense ? 'food' : 'salary');
    _paymentMethod = widget.transaction?.paymentMethod ?? 'cash';
  }

  @override
  void dispose() {
    _amountCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  List<Category> get _categories => defaultCategories.where((c) => c.type == _type).toList();

  void _save() {
    final amount = double.tryParse(_amountCtrl.text);
    if (amount == null || amount <= 0) return;

    final provider = context.read<AppProvider>();
    final txn = AppTransaction(
      id: widget.transaction?.id ?? generateId(),
      type: _type,
      amount: amount,
      category: _category,
      paymentMethod: _paymentMethod,
      date: widget.transaction?.date ?? DateTime.now().millisecondsSinceEpoch,
      description: _descCtrl.text,
    );

    if (widget.transaction != null) {
      provider.updateTransaction(txn);
    } else {
      provider.addTransaction(txn);
    }
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      decoration: const BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2))),
            ),
            const SizedBox(height: 16),
            Text(widget.transaction != null ? 'Edit Transaction' : 'Add Transaction', style: const TextStyle(color: AppColors.text, fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            // Type toggle
            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() { _type = TransactionType.expense; _category = 'food'; }),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: _type == TransactionType.expense ? AppColors.danger.withValues(alpha: 0.2) : Colors.transparent,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: _type == TransactionType.expense ? AppColors.danger : AppColors.border),
                      ),
                      child: Center(child: Text('Expense', style: TextStyle(color: _type == TransactionType.expense ? AppColors.danger : AppColors.textSecondary, fontWeight: FontWeight.w600))),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() { _type = TransactionType.income; _category = 'salary'; }),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: _type == TransactionType.income ? AppColors.success.withValues(alpha: 0.2) : Colors.transparent,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: _type == TransactionType.income ? AppColors.success : AppColors.border),
                      ),
                      child: Center(child: Text('Income', style: TextStyle(color: _type == TransactionType.income ? AppColors.success : AppColors.textSecondary, fontWeight: FontWeight.w600))),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            // Amount
            TextField(
              controller: _amountCtrl,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              style: const TextStyle(color: AppColors.text, fontSize: 24, fontWeight: FontWeight.bold),
              decoration: InputDecoration(
                hintText: '0.00',
                hintStyle: TextStyle(color: AppColors.textSecondary.withValues(alpha: 0.5)),
                prefixText: context.read<AppProvider>().currency.symbol,
                prefixStyle: const TextStyle(color: AppColors.text, fontSize: 24, fontWeight: FontWeight.bold),
                filled: true,
                fillColor: AppColors.background,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.border)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.border)),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.primary)),
              ),
            ),
            const SizedBox(height: 16),
            // Category
            const Text('Category', style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
            const SizedBox(height: 8),
            SizedBox(
              height: 44,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: _categories.length,
                itemBuilder: (ctx, i) {
                  final cat = _categories[i];
                  final selected = cat.id == _category;
                  return GestureDetector(
                    onTap: () => setState(() => _category = cat.id),
                    child: Container(
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: selected ? hexToColor(cat.color).withValues(alpha: 0.2) : Colors.transparent,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: selected ? hexToColor(cat.color) : AppColors.border),
                      ),
                      child: Row(
                        children: [
                          Text(cat.icon, style: const TextStyle(fontSize: 16)),
                          const SizedBox(width: 4),
                          Text(cat.name, style: TextStyle(color: selected ? hexToColor(cat.color) : AppColors.textSecondary, fontSize: 13)),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),
            // Payment method
            const Text('Payment Method', style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
            const SizedBox(height: 8),
            SizedBox(
              height: 44,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: paymentMethods.length,
                itemBuilder: (ctx, i) {
                  final pm = paymentMethods[i];
                  final selected = pm.id == _paymentMethod;
                  return GestureDetector(
                    onTap: () => setState(() => _paymentMethod = pm.id),
                    child: Container(
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: selected ? AppColors.primary.withValues(alpha: 0.2) : Colors.transparent,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: selected ? AppColors.primary : AppColors.border),
                      ),
                      child: Row(
                        children: [
                          Text(pm.icon, style: const TextStyle(fontSize: 16)),
                          const SizedBox(width: 4),
                          Text(pm.name, style: TextStyle(color: selected ? AppColors.primary : AppColors.textSecondary, fontSize: 13)),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),
            // Description
            TextField(
              controller: _descCtrl,
              style: const TextStyle(color: AppColors.text),
              decoration: InputDecoration(
                hintText: 'Description (optional)',
                hintStyle: TextStyle(color: AppColors.textSecondary.withValues(alpha: 0.5)),
                filled: true,
                fillColor: AppColors.background,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.border)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.border)),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.primary)),
              ),
            ),
            const SizedBox(height: 24),
            // Save
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _save,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: Text(widget.transaction != null ? 'Update' : 'Add Transaction', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
              ),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}
