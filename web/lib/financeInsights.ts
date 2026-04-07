import { Budget, Category, Goal, PaymentMethod, Transaction, TransactionType } from '../types';

export type RangePreset = 'week' | 'month' | '3months' | 'year';

export interface CategoryBreakdownItem {
  id: string;
  name: string;
  color: string;
  icon: string;
  value: number;
  percentage: number;
}

export interface PaymentMethodBreakdownItem {
  id: string;
  name: string;
  icon: string;
  value: number;
  count: number;
  percentage: number;
}

export interface BudgetInsight {
  id: string;
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  limit: number;
  spent: number;
  percentage: number;
  remaining: number;
  forecast: number;
  forecastPercentage: number;
  status: 'on-track' | 'watch' | 'over';
}

export interface GoalInsight {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
  remaining: number;
  daysLeft: number;
  monthlyNeeded: number;
  targetProgress: number;
  status: 'achieved' | 'on-track' | 'watch' | 'behind' | 'overdue';
  priority: Goal['priority'];
}

export interface DailyCashflowPoint {
  label: string;
  income: number;
  expense: number;
  net: number;
}

export interface MonthlyCashflowPoint {
  label: string;
  income: number;
  expense: number;
  net: number;
}

export interface GroupedTransactionBucket {
  id: string;
  label: string;
  totalIncome: number;
  totalExpense: number;
  net: number;
  transactions: Transaction[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function getMonthRange(baseDate = new Date()) {
  const start = new Date(baseDate);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(baseDate);
  end.setMonth(end.getMonth() + 1);
  end.setDate(0);
  end.setHours(23, 59, 59, 999);

  return {
    start: start.getTime(),
    end: end.getTime(),
  };
}

export function getDateRangeStart(range: RangePreset, baseDate = new Date()) {
  const now = new Date(baseDate);

  if (range === 'week') {
    return now.getTime() - 7 * DAY_MS;
  }

  if (range === 'month') {
    return getMonthRange(now).start;
  }

  if (range === '3months') {
    return now.getTime() - 90 * DAY_MS;
  }

  return now.getTime() - 365 * DAY_MS;
}

export function filterTransactionsByDate(transactions: Transaction[], start: number, end = Date.now()) {
  return transactions.filter((transaction) => transaction.date >= start && transaction.date <= end);
}

export function sumTransactions(transactions: Transaction[], type?: TransactionType) {
  return transactions
    .filter((transaction) => (type ? transaction.type === type : true))
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

export function buildCategoryBreakdown(transactions: Transaction[], categories: Category[]) {
  const expenses = transactions.filter((transaction) => transaction.type === 'expense');
  const totalExpenses = sumTransactions(expenses);

  const grouped = expenses.reduce<Record<string, number>>((accumulator, transaction) => {
    accumulator[transaction.category] = (accumulator[transaction.category] || 0) + transaction.amount;
    return accumulator;
  }, {});

  return Object.entries(grouped)
    .map(([categoryId, value]) => {
      const category = categories.find((item) => item.id === categoryId);
      return {
        id: categoryId,
        name: category?.name || categoryId,
        color: category?.color || '#64748b',
        icon: category?.icon || '📦',
        value,
        percentage: totalExpenses > 0 ? (value / totalExpenses) * 100 : 0,
      } satisfies CategoryBreakdownItem;
    })
    .sort((left, right) => right.value - left.value);
}

export function buildPaymentMethodBreakdown(transactions: Transaction[], paymentMethods: PaymentMethod[]) {
  const total = sumTransactions(transactions);
  const grouped = transactions.reduce<Record<string, { count: number; value: number }>>((accumulator, transaction) => {
    const current = accumulator[transaction.paymentMethod] ?? { count: 0, value: 0 };
    current.count += 1;
    current.value += transaction.amount;
    accumulator[transaction.paymentMethod] = current;
    return accumulator;
  }, {});

  return Object.entries(grouped)
    .map(([paymentMethodId, stats]) => {
      const paymentMethod = paymentMethods.find((item) => item.id === paymentMethodId);
      return {
        id: paymentMethodId,
        name: paymentMethod?.name || paymentMethodId,
        icon: paymentMethod?.icon || '🏦',
        value: stats.value,
        count: stats.count,
        percentage: total > 0 ? (stats.value / total) * 100 : 0,
      } satisfies PaymentMethodBreakdownItem;
    })
    .sort((left, right) => right.value - left.value);
}

export function buildDailyCashflowSeries(transactions: Transaction[], days = 14) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - index - 1));
    date.setHours(0, 0, 0, 0);

    const dayStart = date.getTime();
    const dayEnd = dayStart + DAY_MS - 1;
    const dayTransactions = filterTransactionsByDate(transactions, dayStart, dayEnd);
    const income = sumTransactions(dayTransactions, 'income');
    const expense = sumTransactions(dayTransactions, 'expense');

    return {
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      income,
      expense,
      net: income - expense,
    } satisfies DailyCashflowPoint;
  });
}

export function buildMonthlyCashflowSeries(transactions: Transaction[], months = 6) {
  return Array.from({ length: months }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (months - index - 1));

    const { start, end } = getMonthRange(date);
    const monthTransactions = filterTransactionsByDate(transactions, start, end);
    const income = sumTransactions(monthTransactions, 'income');
    const expense = sumTransactions(monthTransactions, 'expense');

    return {
      label: date.toLocaleDateString('en-US', { month: 'short' }),
      income,
      expense,
      net: income - expense,
    } satisfies MonthlyCashflowPoint;
  });
}

export function buildBudgetInsights(
  budgets: Budget[],
  transactions: Transaction[],
  categories: Category[],
  monthStart: number,
  monthEnd: number
) {
  const elapsedDays = Math.max(1, Math.ceil((Date.now() - monthStart) / DAY_MS));
  const totalDays = Math.max(1, Math.ceil((monthEnd - monthStart + 1) / DAY_MS));

  return budgets
    .map((budget) => {
      const category = categories.find((item) => item.id === budget.category);
      const spent = transactions
        .filter(
          (transaction) =>
            transaction.type === 'expense' &&
            transaction.category === budget.category &&
            transaction.date >= monthStart &&
            transaction.date <= monthEnd
        )
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
      const forecast = elapsedDays > 0 ? (spent / elapsedDays) * totalDays : spent;
      const forecastPercentage = budget.limit > 0 ? (forecast / budget.limit) * 100 : 0;
      const status =
        percentage >= 100 || forecastPercentage >= 110
          ? 'over'
          : percentage >= 80 || forecastPercentage >= 90
            ? 'watch'
            : 'on-track';

      return {
        id: budget.id,
        categoryId: budget.category,
        name: category?.name || budget.category,
        icon: category?.icon || '📦',
        color: category?.color || '#64748b',
        limit: budget.limit,
        spent,
        percentage,
        remaining: budget.limit - spent,
        forecast,
        forecastPercentage,
        status,
      } satisfies BudgetInsight;
    })
    .sort((left, right) => right.percentage - left.percentage);
}

export function buildGoalInsights(goals: Goal[]) {
  const now = Date.now();

  return goals
    .map((goal) => {
      const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
      const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
      const daysLeft = Math.ceil((goal.deadline - now) / DAY_MS);
      const monthlyNeeded = remaining > 0 && daysLeft > 0 ? remaining / Math.max(1, daysLeft / 30) : 0;

      const createdGuess = goal.deadline - 365 * DAY_MS;
      const totalDuration = Math.max(1, goal.deadline - createdGuess);
      const elapsedDuration = Math.min(totalDuration, Math.max(0, now - createdGuess));
      const targetProgress = (elapsedDuration / totalDuration) * 100;

      let status: GoalInsight['status'] = 'on-track';
      if (progress >= 100) status = 'achieved';
      else if (daysLeft <= 0) status = 'overdue';
      else if (progress + 10 < targetProgress) status = 'behind';
      else if (progress < targetProgress) status = 'watch';

      return {
        id: goal.id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        progress,
        remaining,
        daysLeft,
        monthlyNeeded,
        targetProgress,
        status,
        priority: goal.priority,
      } satisfies GoalInsight;
    })
    .sort((left, right) => {
      if (left.status === 'achieved' && right.status !== 'achieved') return 1;
      if (left.status !== 'achieved' && right.status === 'achieved') return -1;
      return left.daysLeft - right.daysLeft;
    });
}

export function groupTransactionsByDay(transactions: Transaction[]) {
  const groups = transactions.reduce<Record<string, GroupedTransactionBucket>>((accumulator, transaction) => {
    const date = new Date(transaction.date);
    const label = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const id = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();

    if (!accumulator[id]) {
      accumulator[id] = {
        id,
        label,
        totalIncome: 0,
        totalExpense: 0,
        net: 0,
        transactions: [],
      };
    }

    accumulator[id].transactions.push(transaction);
    if (transaction.type === 'income') {
      accumulator[id].totalIncome += transaction.amount;
    } else {
      accumulator[id].totalExpense += transaction.amount;
    }
    accumulator[id].net = accumulator[id].totalIncome - accumulator[id].totalExpense;

    return accumulator;
  }, {});

  return Object.values(groups)
    .map((group) => ({
      ...group,
      transactions: [...group.transactions].sort((left, right) => right.date - left.date),
    }))
    .sort((left, right) => right.id.localeCompare(left.id));
}

export function getLargestTransaction(transactions: Transaction[]) {
  return [...transactions].sort((left, right) => right.amount - left.amount)[0] ?? null;
}
