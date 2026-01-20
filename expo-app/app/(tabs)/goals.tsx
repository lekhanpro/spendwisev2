import React, { useContext } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { AppContext } from '../../context/AppContext';

export default function GoalsScreen() {
  const { goals, formatCurrency } = useContext(AppContext)!;

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Savings Goals</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Savings Progress</Text>
        <Text style={styles.summaryValue}>
          {formatCurrency(totalSaved)} <Text style={styles.summaryTarget}>/ {formatCurrency(totalTarget)}</Text>
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0}%` }
            ]} 
          />
        </View>
      </View>

      <ScrollView style={styles.list}>
        {goals.map(goal => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const daysLeft = Math.ceil((goal.deadline - Date.now()) / 86400000);

          return (
            <View key={goal.id} style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalName}>{goal.name}</Text>
                <View style={[
                  styles.priorityBadge,
                  { 
                    backgroundColor: goal.priority === 'high' ? '#ef444420' : goal.priority === 'medium' ? '#f59e0b20' : '#10b98120',
                    borderColor: goal.priority === 'high' ? '#ef4444' : goal.priority === 'medium' ? '#f59e0b' : '#10b981'
                  }
                ]}>
                  <Text style={[
                    styles.priorityText,
                    { color: goal.priority === 'high' ? '#ef4444' : goal.priority === 'medium' ? '#f59e0b' : '#10b981' }
                  ]}>
                    {goal.priority}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.deadline}>
                {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
              </Text>

              <View style={styles.amountRow}>
                <View>
                  <Text style={styles.currentAmount}>{formatCurrency(goal.currentAmount)}</Text>
                  <Text style={styles.targetAmount}>of {formatCurrency(goal.targetAmount)}</Text>
                </View>
                <Text style={[styles.percentage, { color: progress >= 100 ? '#10b981' : '#3b82f6' }]}>
                  {progress.toFixed(0)}%
                </Text>
              </View>

              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${Math.min(100, progress)}%`,
                      backgroundColor: progress >= 100 ? '#10b981' : '#3b82f6'
                    }
                  ]} 
                />
              </View>

              {progress >= 100 && (
                <View style={styles.achievedBadge}>
                  <Text style={styles.achievedText}>Goal achieved! 🎉</Text>
                </View>
              )}
            </View>
          );
        })}
        {goals.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyText}>No savings goals yet</Text>
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
    backgroundColor: '#1e40af20',
    borderWidth: 1,
    borderColor: '#3b82f650',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#93c5fd',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  summaryTarget: {
    fontSize: 16,
    color: '#93c5fd',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#1e3a8a30',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#60a5fa',
    borderRadius: 6,
  },
  list: {
    flex: 1,
    paddingHorizontal: 24,
  },
  goalItem: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  deadline: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  currentAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  targetAmount: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  percentage: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  achievedBadge: {
    backgroundColor: '#10b98120',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 12,
    padding: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  achievedText: {
    color: '#10b981',
    fontSize: 14,
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
