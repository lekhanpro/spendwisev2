// Budget Screen
import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, useColorScheme, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Colors, DEFAULT_CATEGORIES, generateId } from '../../constants/app';
import { Budget } from '../../types';

export default function BudgetScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
    const { budgets, transactions, addBudget, updateBudget, deleteBudget, formatCurrency } = useApp();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [category, setCategory] = useState('');
    const [limit, setLimit] = useState('');
    const [period, setPeriod] = useState<'weekly' | 'monthly'>('monthly');

    const expenseCategories = DEFAULT_CATEGORIES.filter(c => c.type === 'expense');

    const resetForm = () => {
        setCategory('');
        setLimit('');
        setPeriod('monthly');
        setEditingBudget(null);
    };

    const openAddModal = () => {
        resetForm();
        setModalVisible(true);
    };

    const openEditModal = (budget: Budget) => {
        setEditingBudget(budget);
        setCategory(budget.category);
        setLimit(budget.limit.toString());
        setPeriod(budget.period);
        setModalVisible(true);
    };

    const handleSave = () => {
        if (!category || !limit) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const budgetData: Budget = {
            id: editingBudget?.id || generateId(),
            category,
            limit: parseFloat(limit),
            period,
            startDate: editingBudget?.startDate || Date.now(),
            notifications: true,
        };

        if (editingBudget) {
            updateBudget(budgetData);
        } else {
            addBudget(budgetData);
        }

        setModalVisible(false);
        resetForm();
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Delete Budget',
            'Are you sure you want to delete this budget?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteBudget(id) },
            ]
        );
    };

    const getSpentAmount = (categoryId: string, period: 'weekly' | 'monthly') => {
        const now = new Date();
        const periodStart = period === 'weekly'
            ? new Date(now.setDate(now.getDate() - now.getDay())).setHours(0, 0, 0, 0)
            : new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        return transactions
            .filter(t => t.type === 'expense' && t.category === categoryId && t.date >= periodStart)
            .reduce((sum, t) => sum + t.amount, 0);
    };

    const getCategoryInfo = (categoryId: string) => {
        return DEFAULT_CATEGORIES.find(c => c.id === categoryId) || { icon: '📦', name: categoryId, color: '#64748b' };
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {budgets.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📊</Text>
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                            No budgets yet. Tap + to create one.
                        </Text>
                    </View>
                ) : (
                    budgets.map((budget) => {
                        const catInfo = getCategoryInfo(budget.category);
                        const spent = getSpentAmount(budget.category, budget.period);
                        const percentage = Math.min((spent / budget.limit) * 100, 100);
                        const isOverBudget = spent > budget.limit;

                        return (
                            <TouchableOpacity
                                key={budget.id}
                                style={[styles.budgetCard, { backgroundColor: theme.card }]}
                                onPress={() => openEditModal(budget)}
                                onLongPress={() => handleDelete(budget.id)}
                            >
                                <View style={styles.budgetHeader}>
                                    <View style={styles.budgetLeft}>
                                        <Text style={styles.budgetIcon}>{catInfo.icon}</Text>
                                        <View>
                                            <Text style={[styles.budgetName, { color: theme.text }]}>{catInfo.name}</Text>
                                            <Text style={[styles.budgetPeriod, { color: theme.textSecondary }]}>
                                                {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.budgetRight}>
                                        <Text style={[styles.budgetSpent, { color: isOverBudget ? theme.danger : theme.text }]}>
                                            {formatCurrency(spent)}
                                        </Text>
                                        <Text style={[styles.budgetLimit, { color: theme.textSecondary }]}>
                                            of {formatCurrency(budget.limit)}
                                        </Text>
                                    </View>
                                </View>
                                <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            {
                                                width: `${percentage}%`,
                                                backgroundColor: isOverBudget ? theme.danger : percentage > 80 ? theme.warning : catInfo.color,
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={[styles.percentageText, { color: isOverBudget ? theme.danger : theme.textSecondary }]}>
                                    {percentage.toFixed(0)}% used
                                </Text>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary }]} onPress={openAddModal}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            {/* Add/Edit Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>
                            {editingBudget ? 'Edit Budget' : 'Add Budget'}
                        </Text>

                        {/* Category Selector */}
                        <Text style={[styles.label, { color: theme.text }]}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                            {expenseCategories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.categoryChip, category === cat.id && { backgroundColor: cat.color }]}
                                    onPress={() => setCategory(cat.id)}
                                >
                                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                                    <Text style={[styles.categoryName, { color: category === cat.id ? '#fff' : theme.text }]}>
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Limit Input */}
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                            placeholder="Budget Limit"
                            placeholderTextColor={theme.textSecondary}
                            keyboardType="numeric"
                            value={limit}
                            onChangeText={setLimit}
                        />

                        {/* Period Toggle */}
                        <Text style={[styles.label, { color: theme.text }]}>Period</Text>
                        <View style={styles.periodToggle}>
                            {(['weekly', 'monthly'] as const).map((p) => (
                                <TouchableOpacity
                                    key={p}
                                    style={[styles.periodButton, period === p && { backgroundColor: theme.primary }]}
                                    onPress={() => setPeriod(p)}
                                >
                                    <Text style={[styles.periodButtonText, { color: period === p ? '#fff' : theme.text }]}>
                                        {p.charAt(0).toUpperCase() + p.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Buttons */}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.cancelButton, { borderColor: theme.border }]} onPress={() => { setModalVisible(false); resetForm(); }}>
                                <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={handleSave}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 16 },
    emptyContainer: { alignItems: 'center', paddingVertical: 60 },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { fontSize: 16, textAlign: 'center' },
    budgetCard: { padding: 16, borderRadius: 16, marginBottom: 12 },
    budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    budgetLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    budgetIcon: { fontSize: 32 },
    budgetName: { fontSize: 16, fontWeight: '600' },
    budgetPeriod: { fontSize: 12, marginTop: 2 },
    budgetRight: { alignItems: 'flex-end' },
    budgetSpent: { fontSize: 18, fontWeight: '600' },
    budgetLimit: { fontSize: 12, marginTop: 2 },
    progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    percentageText: { fontSize: 12, marginTop: 8, textAlign: 'right' },
    fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4 },
    fabText: { color: '#fff', fontSize: 28, fontWeight: '300' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
    label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
    categoryScroll: { marginBottom: 16 },
    categoryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: '#64748b20' },
    categoryIcon: { fontSize: 16, marginRight: 6 },
    categoryName: { fontSize: 12 },
    input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 16 },
    periodToggle: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    periodButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', backgroundColor: '#64748b20' },
    periodButtonText: { fontWeight: '500' },
    modalButtons: { flexDirection: 'row', gap: 12 },
    cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
    cancelButtonText: { fontWeight: '500' },
    saveButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    saveButtonText: { color: '#fff', fontWeight: '600' },
});
