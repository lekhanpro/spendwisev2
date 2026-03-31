import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { AppContext } from '../../context/AppContext';

export default function TransactionsScreen() {
  const { transactions, categories, formatCurrency } = useContext(AppContext)!;
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredTransactions = transactions
    .filter(t => {
      if (filter !== 'all' && t.type !== filter) return false;
      if (search) {
        const cat = categories.find(c => c.id === t.category);
        const searchLower = search.toLowerCase();
        return (t.description?.toLowerCase().includes(searchLower)) ||
          (cat?.name.toLowerCase().includes(searchLower));
      }
      return true;
    })
    .sort((a, b) => b.date - a.date);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor="#6b7280"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filterContainer}>
        {['all', 'expense', 'income'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.list}>
        {filteredTransactions.map(t => {
          const cat = categories.find(c => c.id === t.category);
          return (
            <View key={t.id} style={styles.transactionItem}>
              <View style={[styles.icon, { backgroundColor: cat?.color + '20' }]}>
                <Text style={styles.emoji}>{cat?.icon}</Text>
              </View>
              <View style={styles.details}>
                <Text style={styles.name}>{t.description || cat?.name}</Text>
                <Text style={styles.date}>{new Date(t.date).toLocaleDateString()}</Text>
              </View>
              <Text style={[styles.amount, { color: t.type === 'income' ? '#10b981' : '#ef4444' }]}>
                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
              </Text>
            </View>
          );
        })}
        {filteredTransactions.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No transactions found</Text>
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
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    flex: 1,
    paddingHorizontal: 24,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
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
  details: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  empty: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
  },
});
