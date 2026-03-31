// Dashboard Screen - Updated to match web app design
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { Colors, DEFAULT_CATEGORIES } from '../../constants/app';
import { LineChart } from 'react-native-chart-kit';
import { GlassCard } from '../../components/GlassCard';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const theme = Colors.dark;
  const { transactions, budgets, goals, formatCurrency, setShowTransactionModal } = useApp();

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculate summary
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  // Get recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);

  // Budget alerts (80%+ usage)
  const budgetAlerts = budgets.map(budget => {
    const spent = monthTransactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((sum, t) => sum + t.amount, 0);
    const percentage = (spent / budget.limit) * 100;
    const cat = DEFAULT_CATEGORIES.find(c => c.id === budget.category);
    return { ...budget, spent, percentage, category: cat };
  }).filter(b => b.percentage >= 80);

  // Chart data for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const chartData = {
    labels: last7Days.map(d => d.toLocaleDateString('en', { weekday: 'short' })),
    datasets: [
      {
        data: last7Days.map(day => {
          const dayStart = new Date(day.setHours(0, 0, 0, 0)).getTime();
          const dayEnd = new Date(day.setHours(23, 59, 59, 999)).getTime();
          return transactions
            .filter(t => t.type === 'expense' && t.date >= dayStart && t.date <= dayEnd)
            .reduce((sum, t) => sum + t.amount, 0) || 0;
        }),
        strokeWidth: 2,
      },
    ],
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = DEFAULT_CATEGORIES.find(c => c.id === categoryId);
    return category?.icon || '📦';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = DEFAULT_CATEGORIES.find(c => c.id === categoryId);
    return category?.color || '#64748b';
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}!</Text>
            <Text style={styles.title}>Your Finances</Text>
          </View>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
        </View>

        {/* Balance Card - Glass Effect */}
        <GlassCard style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={[styles.balanceValue, { color: balance >= 0 ? '#fff' : theme.danger }]}>
            {formatCurrency(balance)}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>↑</Text>
              </View>
              <View>
                <Text style={styles.statLabel}>Income</Text>
                <Text style={styles.statValue}>{formatCurrency(totalIncome)}</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                <Text style={[styles.statIcon, { color: '#ef4444' }]}>↓</Text>
              </View>
              <View>
                <Text style={styles.statLabel}>Expenses</Text>
                <Text style={styles.statValue}>{formatCurrency(totalExpenses)}</Text>
              </View>
            </View>
          </View>

          {/* Savings Rate */}
          <View style={styles.savingsContainer}>
            <View style={styles.savingsHeader}>
              <Text style={styles.savingsLabel}>Savings Rate</Text>
              <Text style={styles.savingsValue}>{savingsRate.toFixed(1)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${Math.max(0, Math.min(100, savingsRate))}%` }
                ]}
              />
            </View>
          </View>
        </GlassCard>

        {/* Budget Alerts */}
        {budgetAlerts.length > 0 && (
          <View style={styles.alertsContainer}>
            {budgetAlerts.map(alert => (
              <GlassCard
                key={alert.id}
                variant={alert.percentage >= 100 ? 'danger' : 'highlight'}
                style={styles.alertCard}
              >
                <View style={styles.alertContent}>
                  <View style={[
                    styles.alertIcon,
                    { backgroundColor: alert.percentage >= 100 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(251, 191, 36, 0.2)' }
                  ]}>
                    <Text>⚠️</Text>
                  </View>
                  <View style={styles.alertText}>
                    <Text style={[
                      styles.alertTitle,
                      { color: alert.percentage >= 100 ? '#f87171' : '#fbbf24' }
                    ]}>
                      {alert.category?.name} budget {alert.percentage >= 100 ? 'exceeded!' : 'warning'}
                    </Text>
                    <Text style={styles.alertSubtitle}>
                      {formatCurrency(alert.spent)} of {formatCurrency(alert.limit)} ({alert.percentage.toFixed(0)}%)
                    </Text>
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <GlassCard style={styles.quickStatCard}>
            <Text style={styles.quickStatLabel}>Transactions</Text>
            <Text style={styles.quickStatValue}>{monthTransactions.length}</Text>
            <Text style={styles.quickStatSub}>This month</Text>
          </GlassCard>
          <GlassCard style={styles.quickStatCard}>
            <Text style={styles.quickStatLabel}>Active Budgets</Text>
            <Text style={styles.quickStatValue}>{budgets.length}</Text>
            <Text style={styles.quickStatSub}>Categories tracked</Text>
          </GlassCard>
        </View>

        {/* Spending Chart */}
        <GlassCard style={styles.chartCard}>
          <Text style={styles.sectionTitle}>7-Day Spending Trend</Text>
          <LineChart
            data={chartData}
            width={screenWidth - 64}
            height={180}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: 'transparent',
              backgroundGradientTo: 'transparent',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              labelColor: () => '#9ca3af',
              style: { borderRadius: 16 },
              propsForDots: { r: '4', strokeWidth: '2', stroke: '#3b82f6' },
              propsForBackgroundLines: { stroke: '#27272a' },
            }}
            bezier
            style={styles.chart}
            withVerticalLines={false}
          />
        </GlassCard>

        {/* Recent Transactions */}
        <GlassCard style={styles.transactionsCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No transactions yet</Text>
              <TouchableOpacity onPress={() => setShowTransactionModal(true)}>
                <Text style={styles.addFirstText}>Add your first</Text>
              </TouchableOpacity>
            </View>
          ) : (
            recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <View style={[
                    styles.transactionIconContainer,
                    { backgroundColor: getCategoryColor(transaction.category) + '20' }
                  ]}>
                    <Text style={styles.transactionIcon}>
                      {getCategoryIcon(transaction.category)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.transactionDesc}>
                      {transaction.description || DEFAULT_CATEGORIES.find(c => c.id === transaction.category)?.name}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {new Date(transaction.date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <Text style={[
                  styles.transactionAmount,
                  { color: transaction.type === 'income' ? theme.success : theme.danger }
                ]}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </Text>
              </View>
            ))
          )}
        </GlassCard>

        {/* Bottom padding for navigation bar + FAB buttons */}
        <View style={{ height: 160 }} />
      </ScrollView>

      {/* Fixed Position Quick Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, styles.expenseFab]}
          onPress={() => setShowTransactionModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>−</Text>
          <Text style={styles.fabText}>Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fab, styles.incomeFab]}
          onPress={() => setShowTransactionModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>+</Text>
          <Text style={styles.fabText}>Income</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    color: '#9ca3af',
    fontSize: 14,
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: 'bold',
  },
  date: {
    color: '#9ca3af',
    fontSize: 14,
  },
  balanceCard: {
    marginBottom: 16,
  },
  balanceLabel: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 4,
  },
  balanceValue: {
    color: '#f8fafc',
    fontSize: 36,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statIcon: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 12,
  },
  statValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  savingsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  savingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  savingsLabel: {
    color: '#9ca3af',
    fontSize: 14,
  },
  savingsValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  alertsContainer: {
    gap: 8,
    marginBottom: 16,
  },
  alertCard: {
    padding: 12,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertText: {
    flex: 1,
  },
  alertTitle: {
    fontWeight: '500',
    marginBottom: 2,
  },
  alertSubtitle: {
    color: '#9ca3af',
    fontSize: 13,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickStatCard: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatLabel: {
    color: '#9ca3af',
    fontSize: 13,
  },
  quickStatValue: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: 'bold',
  },
  quickStatSub: {
    color: '#6b7280',
    fontSize: 11,
  },
  chartCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    marginLeft: -16,
  },
  transactionsCard: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
  },
  addFirstText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  transactionIcon: {
    fontSize: 20,
  },
  transactionDesc: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '500',
  },
  transactionDate: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  expenseButton: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  incomeButton: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
  },
  quickActionIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quickActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Fixed position FAB styles
  fabContainer: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 16,
    zIndex: 50,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 28,
    gap: 8,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  expenseFab: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  incomeFab: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
  },
  fabIcon: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  fabText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
