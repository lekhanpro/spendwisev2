import 'dart:convert';
import 'dart:math';
import 'package:http/http.dart' as http;
import '../models/models.dart';

class AIInsight {
  final String title;
  final String message;
  final String type; // tip, warning, success, info
  final String icon;

  AIInsight({required this.title, required this.message, required this.type, required this.icon});

  factory AIInsight.fromJson(Map<String, dynamic> json) => AIInsight(
    title: json['title'] ?? '',
    message: json['message'] ?? '',
    type: json['type'] ?? 'info',
    icon: json['icon'] ?? '\u{1F4A1}',
  );
}

class SpendingAnalysis {
  final int healthScore;
  final List<AIInsight> insights;
  final List<String> recommendations;
  final String summary;

  SpendingAnalysis({
    required this.healthScore,
    required this.insights,
    required this.recommendations,
    required this.summary,
  });
}

class AIService {
  static const _apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
  String _apiKey = '';

  void setApiKey(String key) => _apiKey = key;

  Future<SpendingAnalysis> getFinancialInsights(
    List<AppTransaction> transactions,
    List<Budget> budgets,
    List<Goal> goals,
    String currencySymbol,
  ) async {
    try {
      if (_apiKey.isEmpty) return _getDefaultInsights(transactions, budgets, goals);

      final now = DateTime.now();
      final monthStart = DateTime(now.year, now.month, 1).millisecondsSinceEpoch;
      final monthTxns = transactions.where((t) => t.date >= monthStart).toList();

      final totalIncome = monthTxns.where((t) => t.type == TransactionType.income).fold(0.0, (s, t) => s + t.amount);
      final totalExpenses = monthTxns.where((t) => t.type == TransactionType.expense).fold(0.0, (s, t) => s + t.amount);

      final catSpending = <String, double>{};
      for (final t in monthTxns.where((t) => t.type == TransactionType.expense)) {
        catSpending[t.category] = (catSpending[t.category] ?? 0) + t.amount;
      }

      final budgetUsage = budgets.map((b) {
        final spent = catSpending[b.category] ?? 0;
        return '- ${b.category}: ${(spent / b.limit * 100).toStringAsFixed(0)}% used ($currencySymbol${spent.toStringAsFixed(0)}/$currencySymbol${b.limit.toStringAsFixed(0)})';
      }).join('\n');

      final goalProgress = goals.map((g) {
        final pct = (g.currentAmount / g.targetAmount * 100).toStringAsFixed(0);
        return '- ${g.name}: $pct% (${g.daysLeft} days left)';
      }).join('\n');

      final savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toStringAsFixed(1) : '0';

      final prompt = '''You are a financial advisor AI. Analyze this user's financial data and provide personalized insights.

**Monthly Summary:**
- Income: $currencySymbol${totalIncome.toStringAsFixed(2)}
- Expenses: $currencySymbol${totalExpenses.toStringAsFixed(2)}
- Savings: $currencySymbol${(totalIncome - totalExpenses).toStringAsFixed(2)}
- Savings Rate: $savingsRate%

**Spending by Category:**
${catSpending.entries.map((e) => '- ${e.key}: $currencySymbol${e.value.toStringAsFixed(2)}').join('\n')}

**Budget Usage:**
${budgetUsage.isEmpty ? 'No budgets set' : budgetUsage}

**Goals Progress:**
${goalProgress.isEmpty ? 'No goals set' : goalProgress}

Provide a JSON response with:
1. healthScore (0-100): Overall financial health rating
2. insights: Array of 3-4 insight objects with {title, message, type: "tip"|"warning"|"success"|"info", icon: emoji}
3. recommendations: Array of 3 actionable tips
4. summary: A brief 2-sentence summary

Respond ONLY with valid JSON, no markdown or explanation.''';

      final response = await http.post(
        Uri.parse(_apiUrl),
        headers: {'Authorization': 'Bearer $_apiKey', 'Content-Type': 'application/json'},
        body: jsonEncode({
          'model': 'llama-3.3-70b-versatile',
          'messages': [
            {'role': 'system', 'content': 'You are a helpful financial advisor. Always respond with valid JSON only.'},
            {'role': 'user', 'content': prompt},
          ],
          'temperature': 0.7,
          'max_tokens': 1000,
        }),
      );

      if (response.statusCode != 200) throw Exception('API error: ${response.statusCode}');

      final data = jsonDecode(response.body);
      final content = data['choices'][0]['message']['content'];
      final parsed = jsonDecode(content);

      return SpendingAnalysis(
        healthScore: (parsed['healthScore'] ?? 50) as int,
        insights: (parsed['insights'] as List? ?? []).map((i) => AIInsight.fromJson(Map<String, dynamic>.from(i))).toList(),
        recommendations: List<String>.from(parsed['recommendations'] ?? []),
        summary: parsed['summary'] ?? 'Unable to analyze.',
      );
    } catch (e) {
      return _getDefaultInsights(transactions, budgets, goals);
    }
  }

  SpendingAnalysis _getDefaultInsights(List<AppTransaction> transactions, List<Budget> budgets, List<Goal> goals) {
    final now = DateTime.now();
    final monthStart = DateTime(now.year, now.month, 1).millisecondsSinceEpoch;
    final monthTxns = transactions.where((t) => t.date >= monthStart).toList();

    final totalIncome = monthTxns.where((t) => t.type == TransactionType.income).fold(0.0, (s, t) => s + t.amount);
    final totalExpenses = monthTxns.where((t) => t.type == TransactionType.expense).fold(0.0, (s, t) => s + t.amount);
    final savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0.0;

    final insights = <AIInsight>[];

    if (savingsRate >= 20) {
      insights.add(AIInsight(title: 'Great Savings!', message: 'You\'re saving ${savingsRate.toStringAsFixed(0)}% of your income. Keep it up!', type: 'success', icon: '\u{1F389}'));
    } else if (savingsRate > 0) {
      insights.add(AIInsight(title: 'Building Savings', message: 'You\'re saving ${savingsRate.toStringAsFixed(0)}%. Try to reach 20% for financial security.', type: 'tip', icon: '\u{1F4A1}'));
    } else {
      insights.add(AIInsight(title: 'Spending Alert', message: 'You are spending more than you earn. Review your expenses.', type: 'warning', icon: '\u{26A0}\u{FE0F}'));
    }

    for (final budget in budgets) {
      final spent = monthTxns.where((t) => t.type == TransactionType.expense && t.category == budget.category).fold(0.0, (s, t) => s + t.amount);
      final pct = (spent / budget.limit) * 100;
      if (pct >= 100) {
        insights.add(AIInsight(title: 'Budget Exceeded', message: 'Your ${budget.category} budget is over by ${(pct - 100).toStringAsFixed(0)}%', type: 'warning', icon: '\u{1F6A8}'));
      } else if (pct >= 80) {
        insights.add(AIInsight(title: 'Budget Warning', message: '${budget.category} is at ${pct.toStringAsFixed(0)}% of budget', type: 'info', icon: '\u{1F4CA}'));
      }
    }

    for (final goal in goals) {
      if (goal.isComplete) {
        insights.add(AIInsight(title: 'Goal Achieved!', message: 'Congratulations! You\'ve reached your "${goal.name}" goal!', type: 'success', icon: '\u{1F3C6}'));
      } else if (goal.daysLeft <= 30 && goal.progress < 0.8) {
        insights.add(AIInsight(title: 'Goal At Risk', message: '"${goal.name}" needs attention - ${goal.daysLeft} days left', type: 'warning', icon: '\u{23F0}'));
      }
    }

    final score = (savingsRate + 30 + (goals.isNotEmpty ? 10 : 0) + (budgets.isNotEmpty ? 10 : 0)).clamp(0, 100).toInt();

    return SpendingAnalysis(
      healthScore: score,
      insights: insights.take(4).toList(),
      recommendations: [
        'Track all expenses daily for better awareness',
        'Set up budgets for your top spending categories',
        'Aim to save at least 20% of your income',
      ],
      summary: 'This month you have earned and spent money. ${savingsRate > 0 ? 'You are on the right track!' : 'Consider reducing expenses.'}',
    );
  }

  String getQuickTip() {
    const tips = [
      '\u{1F4A1} Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings',
      '\u{1F4B0} Automate your savings - pay yourself first!',
      '\u{1F4CA} Review your subscriptions monthly - cancel unused ones',
      '\u{1F6D2} Make a shopping list and stick to it',
      '\u{2615} Small daily expenses add up - track your coffee spending!',
      '\u{1F3AF} Set specific financial goals with deadlines',
      '\u{1F4B3} Pay off high-interest debt first',
      '\u{1F3E6} Keep 3-6 months of expenses as emergency fund',
    ];
    return tips[Random().nextInt(tips.length)];
  }

  Future<String> chat(String message, List<AppTransaction> transactions, String currencySymbol) async {
    if (_apiKey.isEmpty) return 'Please set your Groq API key in Settings to use the AI chatbot.';

    try {
      final now = DateTime.now();
      final monthStart = DateTime(now.year, now.month, 1).millisecondsSinceEpoch;
      final monthTxns = transactions.where((t) => t.date >= monthStart).toList();
      final totalIncome = monthTxns.where((t) => t.type == TransactionType.income).fold(0.0, (s, t) => s + t.amount);
      final totalExpenses = monthTxns.where((t) => t.type == TransactionType.expense).fold(0.0, (s, t) => s + t.amount);

      final response = await http.post(
        Uri.parse(_apiUrl),
        headers: {'Authorization': 'Bearer $_apiKey', 'Content-Type': 'application/json'},
        body: jsonEncode({
          'model': 'llama-3.3-70b-versatile',
          'messages': [
            {'role': 'system', 'content': 'You are SpendWise AI, a helpful financial advisor chatbot. The user\'s monthly income is $currencySymbol${totalIncome.toStringAsFixed(2)} and expenses are $currencySymbol${totalExpenses.toStringAsFixed(2)}. Keep responses concise.'},
            {'role': 'user', 'content': message},
          ],
          'temperature': 0.7,
          'max_tokens': 500,
        }),
      );

      if (response.statusCode != 200) throw Exception('API error');
      final data = jsonDecode(response.body);
      return data['choices'][0]['message']['content'] ?? 'No response';
    } catch (e) {
      return 'Sorry, I couldn\'t process your request. Please try again.';
    }
  }
}
