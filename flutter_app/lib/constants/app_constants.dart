import 'dart:math';
import 'package:flutter/material.dart';
import '../models/models.dart';

const defaultCategories = <Category>[
  Category(id: 'food', name: 'Food & Dining', icon: '\u{1F355}', color: '#f59e0b', type: TransactionType.expense),
  Category(id: 'transport', name: 'Transport', icon: '\u{1F697}', color: '#3b82f6', type: TransactionType.expense),
  Category(id: 'entertainment', name: 'Entertainment', icon: '\u{1F3AC}', color: '#8b5cf6', type: TransactionType.expense),
  Category(id: 'bills', name: 'Bills & Utilities', icon: '\u{1F4A1}', color: '#ef4444', type: TransactionType.expense),
  Category(id: 'shopping', name: 'Shopping', icon: '\u{1F6CD}\u{FE0F}', color: '#ec4899', type: TransactionType.expense),
  Category(id: 'health', name: 'Health & Fitness', icon: '\u{1F4AA}', color: '#10b981', type: TransactionType.expense),
  Category(id: 'education', name: 'Education', icon: '\u{1F4DA}', color: '#6366f1', type: TransactionType.expense),
  Category(id: 'travel', name: 'Travel', icon: '\u{2708}\u{FE0F}', color: '#14b8a6', type: TransactionType.expense),
  Category(id: 'groceries', name: 'Groceries', icon: '\u{1F6D2}', color: '#84cc16', type: TransactionType.expense),
  Category(id: 'other', name: 'Other', icon: '\u{1F4E6}', color: '#64748b', type: TransactionType.expense),
  Category(id: 'salary', name: 'Salary', icon: '\u{1F4B0}', color: '#10b981', type: TransactionType.income),
  Category(id: 'freelance', name: 'Freelance', icon: '\u{1F4BB}', color: '#3b82f6', type: TransactionType.income),
  Category(id: 'investments', name: 'Investments', icon: '\u{1F4C8}', color: '#8b5cf6', type: TransactionType.income),
  Category(id: 'gifts', name: 'Gifts', icon: '\u{1F381}', color: '#f59e0b', type: TransactionType.income),
];

const paymentMethods = <PaymentMethod>[
  PaymentMethod(id: 'cash', name: 'Cash', icon: '\u{1F4B5}'),
  PaymentMethod(id: 'credit', name: 'Credit Card', icon: '\u{1F4B3}'),
  PaymentMethod(id: 'debit', name: 'Debit Card', icon: '\u{1F3E7}'),
  PaymentMethod(id: 'digital', name: 'Digital Wallet', icon: '\u{1F4F1}'),
  PaymentMethod(id: 'bank', name: 'Bank Transfer', icon: '\u{1F3E6}'),
];

const supportedCurrencies = <AppCurrency>[
  AppCurrency(code: 'USD', symbol: '\$', name: 'US Dollar', locale: 'en-US'),
  AppCurrency(code: 'INR', symbol: '\u{20B9}', name: 'Indian Rupee', locale: 'en-IN'),
  AppCurrency(code: 'EUR', symbol: '\u{20AC}', name: 'Euro', locale: 'de-DE'),
  AppCurrency(code: 'GBP', symbol: '\u{00A3}', name: 'British Pound', locale: 'en-GB'),
  AppCurrency(code: 'JPY', symbol: '\u{00A5}', name: 'Japanese Yen', locale: 'ja-JP'),
  AppCurrency(code: 'AED', symbol: 'AED', name: 'UAE Dirham', locale: 'en-AE'),
];

String generateId() => Random().nextInt(999999999).toRadixString(36);

Category? getCategoryById(String id) {
  try {
    return defaultCategories.firstWhere((c) => c.id == id);
  } catch (_) {
    return null;
  }
}

Color hexToColor(String hex) {
  hex = hex.replaceFirst('#', '');
  if (hex.length == 6) hex = 'FF$hex';
  return Color(int.parse(hex, radix: 16));
}

class AppColors {
  static const background = Color(0xFF000000);
  static const card = Color(0xFF18181B);
  static const text = Color(0xFFF8FAFC);
  static const textSecondary = Color(0xFF9CA3AF);
  static const border = Color(0xFF27272A);
  static const primary = Color(0xFF3B82F6);
  static const success = Color(0xFF10B981);
  static const danger = Color(0xFFEF4444);
  static const warning = Color(0xFFF59E0B);
}
