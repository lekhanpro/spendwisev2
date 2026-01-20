import React, { useContext } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { AppContext } from '../../context/AppContext';

export default function BudgetScreen() {
  const { budgets, transactions, categories, formatCurrency } = useContext(AppContext)!;

  const getMonthStart = () => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  const getMonthEnd = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  };

  const monthStart = getMonthStart();
  const monthEnd = getMonthEnd();

  const budgetsWithProgress = budgets.map(budget => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category && t.date >= monthStart && t.date <= monthEnd)
      .reduce((sum, t) => sum + t.amount, 0);
    const percentage = (spent / budget.limit) * 100;
    const remaining = budget.limit - spent;
    const cat = categories.find(c => c.id === budget.category);
    return { ...budget, spent, percentage, remaining, category: cat };
  });

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgetsWithProgress.reduce((sum, b) => sum + b.spent, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budgets</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>Total Budget</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalBudget)}</Text>
          </View>
          <View style={styles.summaryRight}>
            <Text style={styles.summaryLabel}>Spent</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalSpent)}</Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min(100, (totalSpent / totalBudget) * 100)}%`,
                backgroundColor: totalSpent / totalBudget > 1 ? '#ef4444' : totalSpent / totalBudget > 0.8 ? '#f59e0b' : '#10b981'
              }
            ]} 
          />
        </View>
        <Text style={styles.remainingText}>
          {formatCurrency(Math.max(0, totalBudget - totalSpent))} remaining this month
        </Text>
      </View>

      <ScrollView style={styles.list}>
        {budgetsWithProgress.map(budget => (
          <View key={budget.id} style={styles.budgetItem}>
            <View style={styles.budgetHeader}>
              <View style={[styles.icon, { backgroundColor: budget.category?.color + '20' }]}>
                <Text style={styles.emoji}>{budget.category?.icon}</Text>
              </View>
              <View style={styles.budgetInfo}>
                <Text style={styles.budgetName}>{budget.category?.name}</Text>
                <Text style={styles.budgetPeriod}>{budget.period}</Text>
              </View>
            </View>
            <View style={styles.budgetStats}>
              <Text style={styles.budgetAmount}>
                {formatCurrency(budget.spent)} of {formatCurrency(budget.limit)}
              </Text>
              <Text style={[
                styles.budgetPercentage,
                { color: budget.percentage > 100 ? '#ef4444' : budget.percentage > 80 ? '#f59e0b' : '#10b981' }
              ]}>
                {budget.percentage.toFixed(0)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${Math.min(100, budget.percentage)}%`,
                    backgroundColor: budget.percentage > 100 ? '#ef4444' : budget.percentage > 80 ? '#f59e0b' : '#10b981'
                  }
                ]} 
              />
            </View>
            <Text style={[styles.remainingText, budget.remaining < 0 && { color: '#ef4444' }]}>
              {budget.remaining < 0 ? `${formatCurrency(Math.abs(budget.remaining))} over budget` : `${formatCurrency(budget.remaining)} left`}
            </Text>
          </View>
        ))}
        {budgets.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyText}>No budgets set</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  summaryCard: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#27272a',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  remainingText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  list: {
    flex: 1,
    paddingHorizontal: 24,
  },
  budgetItem: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  budgetPeriod: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetAmount: {
    fontSize: 12,
    color: '#d1d5db',
  },
  budgetPercentage: {
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    padding: 48,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
  },
});
