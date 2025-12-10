// Dashboard Screen
import React from 'react';
import { StyleSheet, View, Text, ScrollView, useColorScheme, TouchableOpacity, Dimensions } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Colors, DEFAULT_CATEGORIES } from '../../constants/app';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { transactions, budgets, goals, formatCurrency, setShowTransactionModal } = useApp();

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

  // Get recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5);

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

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Balance</Text>
          <Text style={[styles.summaryValue, { color: balance >= 0 ? theme.success : theme.danger }]}>
            {formatCurrency(balance)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <View style={[styles.smallCard, { backgroundColor: '#10b98120' }]}>
            <Text style={[styles.smallLabel, { color: theme.success }]}>Income</Text>
            <Text style={[styles.smallValue, { color: theme.success }]}>
              {formatCurrency(totalIncome)}
            </Text>
          </View>
          <View style={[styles.smallCard, { backgroundColor: '#ef444420' }]}>
            <Text style={[styles.smallLabel, { color: theme.danger }]}>Expenses</Text>
            <Text style={[styles.smallValue, { color: theme.danger }]}>
              {formatCurrency(totalExpenses)}
            </Text>
          </View>
        </View>
      </View>

      {/* Spending Chart */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Weekly Spending</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 48}
          height={180}
          chartConfig={{
            backgroundColor: theme.card,
            backgroundGradientFrom: theme.card,
            backgroundGradientTo: theme.card,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            labelColor: () => theme.textSecondary,
            style: { borderRadius: 16 },
            propsForDots: { r: '4', strokeWidth: '2', stroke: '#3b82f6' },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Recent Transactions */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Transactions</Text>
        {recentTransactions.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No transactions yet
          </Text>
        ) : (
          recentTransactions.map((transaction) => (
            <View key={transaction.id} style={[styles.transactionItem, { borderBottomColor: theme.border }]}>
              <View style={styles.transactionLeft}>
                <Text style={styles.transactionIcon}>{getCategoryIcon(transaction.category)}</Text>
                <View>
                  <Text style={[styles.transactionDesc, { color: theme.text }]}>
                    {transaction.description || DEFAULT_CATEGORIES.find(c => c.id === transaction.category)?.name}
                  </Text>
                  <Text style={[styles.transactionDate, { color: theme.textSecondary }]}>
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
      </View>

      {/* Add Transaction FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => setShowTransactionModal(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  summaryContainer: {
    marginBottom: 16,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  smallLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  smallValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionIcon: {
    fontSize: 24,
  },
  transactionDesc: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
  },
});
