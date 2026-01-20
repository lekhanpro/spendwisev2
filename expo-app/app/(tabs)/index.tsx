import React, { useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { AppContext } from '../../context/AppContext';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const { transactions, budgets, categories, formatCurrency } = useContext(AppContext)!;
  const router = useRouter();

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

  const monthlyTransactions = transactions.filter(t => t.date >= monthStart && t.date <= monthEnd);
  const totalIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}!</Text>
        <Text style={styles.title}>Your Finances</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.statValue}>{formatCurrency(totalIncome)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.statValue}>{formatCurrency(totalExpenses)}</Text>
          </View>
        </View>

        <View style={styles.savingsSection}>
          <View style={styles.savingsHeader}>
            <Text style={styles.savingsLabel}>Savings Rate</Text>
            <Text style={styles.savingsValue}>{savingsRate.toFixed(1)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(100, savingsRate)}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.quickStats}>
        <View style={styles.statCard}>
          <Text style={styles.statCardLabel}>Transactions</Text>
          <Text style={styles.statCardValue}>{monthlyTransactions.length}</Text>
          <Text style={styles.statCardSubtext}>This month</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardLabel}>Active Budgets</Text>
          <Text style={styles.statCardValue}>{budgets.length}</Text>
          <Text style={styles.statCardSubtext}>Categories tracked</Text>
        </View>
      </View>

      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        
        {transactions.slice(0, 5).map(t => {
          const cat = categories.find(c => c.id === t.category);
          return (
            <View key={t.id} style={styles.transactionItem}>
              <View style={[styles.transactionIcon, { backgroundColor: cat?.color + '20' }]}>
                <Text style={styles.transactionEmoji}>{cat?.icon}</Text>
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionName}>{t.description || cat?.name}</Text>
                <Text style={styles.transactionDate}>{new Date(t.date).toLocaleDateString()}</Text>
              </View>
              <Text style={[styles.transactionAmount, { color: t.type === 'income' ? '#10b981' : '#ef4444' }]}>
                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
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
  greeting: {
    fontSize: 14,
    color: '#9ca3af',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  balanceCard: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 16,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 4,
  },
  savingsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  savingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  savingsLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  savingsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#27272a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 16,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  statCardSubtext: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  recentSection: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  seeAll: {
    fontSize: 14,
    color: '#3b82f6',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionEmoji: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  transactionDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
});
