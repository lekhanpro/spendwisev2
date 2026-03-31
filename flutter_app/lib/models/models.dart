// Data models matching the Expo app

enum TransactionType { income, expense }
enum Period { weekly, monthly }
enum Priority { low, medium, high }

class AppTransaction {
  final String id;
  final TransactionType type;
  final double amount;
  final String category;
  final String paymentMethod;
  final int date;
  final String description;
  final List<String> tags;

  AppTransaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.category,
    required this.paymentMethod,
    required this.date,
    this.description = '',
    this.tags = const [],
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'type': type == TransactionType.income ? 'income' : 'expense',
    'amount': amount,
    'category': category,
    'paymentMethod': paymentMethod,
    'date': date,
    'description': description,
    'tags': tags,
  };

  factory AppTransaction.fromJson(Map<String, dynamic> json) => AppTransaction(
    id: json['id'] ?? '',
    type: json['type'] == 'income' ? TransactionType.income : TransactionType.expense,
    amount: (json['amount'] ?? 0).toDouble(),
    category: json['category'] ?? '',
    paymentMethod: json['paymentMethod'] ?? 'cash',
    date: json['date'] ?? 0,
    description: json['description'] ?? '',
    tags: List<String>.from(json['tags'] ?? []),
  );

  AppTransaction copyWith({
    String? id, TransactionType? type, double? amount, String? category,
    String? paymentMethod, int? date, String? description, List<String>? tags,
  }) => AppTransaction(
    id: id ?? this.id,
    type: type ?? this.type,
    amount: amount ?? this.amount,
    category: category ?? this.category,
    paymentMethod: paymentMethod ?? this.paymentMethod,
    date: date ?? this.date,
    description: description ?? this.description,
    tags: tags ?? this.tags,
  );
}

class Budget {
  final String id;
  final String category;
  final double limit;
  final Period period;
  final int startDate;
  final bool notifications;

  Budget({
    required this.id,
    required this.category,
    required this.limit,
    required this.period,
    required this.startDate,
    this.notifications = true,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'category': category,
    'limit': limit,
    'period': period == Period.weekly ? 'weekly' : 'monthly',
    'startDate': startDate,
    'notifications': notifications,
  };

  factory Budget.fromJson(Map<String, dynamic> json) => Budget(
    id: json['id'] ?? '',
    category: json['category'] ?? '',
    limit: (json['limit'] ?? 0).toDouble(),
    period: json['period'] == 'weekly' ? Period.weekly : Period.monthly,
    startDate: json['startDate'] ?? 0,
    notifications: json['notifications'] ?? true,
  );

  Budget copyWith({
    String? id, String? category, double? limit, Period? period,
    int? startDate, bool? notifications,
  }) => Budget(
    id: id ?? this.id,
    category: category ?? this.category,
    limit: limit ?? this.limit,
    period: period ?? this.period,
    startDate: startDate ?? this.startDate,
    notifications: notifications ?? this.notifications,
  );
}

class Goal {
  final String id;
  final String name;
  final double targetAmount;
  final double currentAmount;
  final int deadline;
  final Priority priority;

  Goal({
    required this.id,
    required this.name,
    required this.targetAmount,
    this.currentAmount = 0,
    required this.deadline,
    this.priority = Priority.medium,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'targetAmount': targetAmount,
    'currentAmount': currentAmount,
    'deadline': deadline,
    'priority': priority.name,
  };

  factory Goal.fromJson(Map<String, dynamic> json) => Goal(
    id: json['id'] ?? '',
    name: json['name'] ?? '',
    targetAmount: (json['targetAmount'] ?? 0).toDouble(),
    currentAmount: (json['currentAmount'] ?? 0).toDouble(),
    deadline: json['deadline'] ?? 0,
    priority: Priority.values.firstWhere(
      (p) => p.name == json['priority'],
      orElse: () => Priority.medium,
    ),
  );

  Goal copyWith({
    String? id, String? name, double? targetAmount, double? currentAmount,
    int? deadline, Priority? priority,
  }) => Goal(
    id: id ?? this.id,
    name: name ?? this.name,
    targetAmount: targetAmount ?? this.targetAmount,
    currentAmount: currentAmount ?? this.currentAmount,
    deadline: deadline ?? this.deadline,
    priority: priority ?? this.priority,
  );

  bool get isComplete => currentAmount >= targetAmount;
  double get progress => targetAmount > 0 ? (currentAmount / targetAmount).clamp(0, 1) : 0;
  int get daysLeft => ((deadline - DateTime.now().millisecondsSinceEpoch) / 86400000).ceil();
}

class Category {
  final String id;
  final String name;
  final String icon;
  final String color;
  final TransactionType type;

  const Category({
    required this.id,
    required this.name,
    required this.icon,
    required this.color,
    required this.type,
  });
}

class PaymentMethod {
  final String id;
  final String name;
  final String icon;

  const PaymentMethod({required this.id, required this.name, required this.icon});
}

class AppCurrency {
  final String code;
  final String symbol;
  final String name;
  final String locale;

  const AppCurrency({
    required this.code,
    required this.symbol,
    required this.name,
    required this.locale,
  });

  Map<String, dynamic> toJson() => {
    'code': code, 'symbol': symbol, 'name': name, 'locale': locale,
  };

  factory AppCurrency.fromJson(Map<String, dynamic> json) => AppCurrency(
    code: json['code'] ?? 'USD',
    symbol: json['symbol'] ?? '\$',
    name: json['name'] ?? 'US Dollar',
    locale: json['locale'] ?? 'en-US',
  );
}
