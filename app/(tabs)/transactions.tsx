// Transactions Screen - Glass card styling matching web
import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList, Modal, TextInput, Alert } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Colors, DEFAULT_CATEGORIES, PAYMENT_METHODS, generateId } from '../../constants/app';
import { Transaction } from '../../types';

export default function TransactionsScreen() {
    const theme = Colors.dark;
    const { transactions, addTransaction, updateTransaction, deleteTransaction, formatCurrency, categories } = useApp();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [description, setDescription] = useState('');
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

    const filteredTransactions = transactions.filter(t =>
        filter === 'all' ? true : t.type === filter
    );

    const resetForm = () => {
        setType('expense');
        setAmount('');
        setCategory('');
        setPaymentMethod('cash');
        setDescription('');
        setEditingTransaction(null);
    };

    const openAddModal = () => {
        resetForm();
        setModalVisible(true);
    };

    const openEditModal = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setType(transaction.type);
        setAmount(transaction.amount.toString());
        setCategory(transaction.category);
        setPaymentMethod(transaction.paymentMethod);
        setDescription(transaction.description);
        setModalVisible(true);
    };

    const handleSave = () => {
        if (!amount || !category) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        const transactionData: Transaction = {
            id: editingTransaction?.id || generateId(),
            type,
            amount: parseFloat(amount),
            category,
            paymentMethod,
            date: editingTransaction?.date || Date.now(),
            description,
            tags: [],
        };

        if (editingTransaction) {
            updateTransaction(transactionData);
        } else {
            addTransaction(transactionData);
        }

        setModalVisible(false);
        resetForm();
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Delete Transaction',
            'Are you sure you want to delete this transaction?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(id) },
            ]
        );
    };

    const getCategoryInfo = (categoryId: string) => {
        return DEFAULT_CATEGORIES.find(c => c.id === categoryId) || { icon: '📦', name: categoryId, color: '#64748b' };
    };

    const filteredCategories = DEFAULT_CATEGORIES.filter(c => c.type === type);

    return (
        <View style={[styles.container, { backgroundColor: '#000000' }]}>
            {/* Filter Tabs - Glass Style */}
            <View style={styles.filterContainer}>
                {(['all', 'income', 'expense'] as const).map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterTab, filter === f && { backgroundColor: theme.primary }]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.filterText, { color: filter === f ? '#fff' : theme.text }]}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Transactions List */}
            <FlatList
                data={filteredTransactions}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                        No transactions yet
                    </Text>
                }
                renderItem={({ item }) => {
                    const catInfo = getCategoryInfo(item.category);
                    return (
                        <TouchableOpacity
                            style={[styles.transactionCard, { backgroundColor: theme.card }]}
                            onPress={() => openEditModal(item)}
                            onLongPress={() => handleDelete(item.id)}
                        >
                            <View style={styles.transactionLeft}>
                                <Text style={styles.transactionIcon}>{catInfo.icon}</Text>
                                <View>
                                    <Text style={[styles.transactionDesc, { color: theme.text }]}>
                                        {item.description || catInfo.name}
                                    </Text>
                                    <Text style={[styles.transactionDate, { color: theme.textSecondary }]}>
                                        {new Date(item.date).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>
                            <Text style={[
                                styles.transactionAmount,
                                { color: item.type === 'income' ? theme.success : theme.danger }
                            ]}>
                                {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />

            {/* FAB */}
            <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary }]} onPress={openAddModal}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            {/* Add/Edit Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>
                            {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
                        </Text>

                        {/* Type Toggle */}
                        <View style={styles.typeToggle}>
                            {(['expense', 'income'] as const).map((t) => (
                                <TouchableOpacity
                                    key={t}
                                    style={[styles.typeButton, type === t && { backgroundColor: t === 'income' ? theme.success : theme.danger }]}
                                    onPress={() => { setType(t); setCategory(''); }}
                                >
                                    <Text style={[styles.typeButtonText, { color: type === t ? '#fff' : theme.text }]}>
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Amount Input */}
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                            placeholder="Amount"
                            placeholderTextColor={theme.textSecondary}
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                        />

                        {/* Category Selector */}
                        <Text style={[styles.label, { color: theme.text }]}>Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                            {filteredCategories.map((cat) => (
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

                        {/* Description Input */}
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                            placeholder="Description (optional)"
                            placeholderTextColor={theme.textSecondary}
                            value={description}
                            onChangeText={setDescription}
                        />

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
    container: { flex: 1, paddingBottom: 100 },
    filterContainer: {
        flexDirection: 'row',
        margin: 16,
        borderRadius: 16,
        padding: 4,
        backgroundColor: 'rgba(24, 24, 27, 0.5)',
        borderWidth: 1,
        borderColor: '#27272a',
    },
    filterTab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
    filterText: { fontSize: 14, fontWeight: '500' },
    listContainer: { padding: 16, paddingTop: 0 },
    emptyText: { textAlign: 'center', paddingVertical: 40, color: '#6b7280' },
    transactionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 8,
        backgroundColor: 'rgba(24, 24, 27, 0.5)',
        borderWidth: 1,
        borderColor: '#27272a',
    },
    transactionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    transactionIcon: { fontSize: 28 },
    transactionDesc: { fontSize: 14, fontWeight: '500', color: '#f8fafc' },
    transactionDate: { fontSize: 12, marginTop: 2, color: '#6b7280' },
    transactionAmount: { fontSize: 16, fontWeight: '600' },
    fab: { position: 'absolute', right: 20, bottom: 90, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 8 },
    fabText: { color: '#fff', fontSize: 28, fontWeight: '300' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '85%',
        backgroundColor: '#18181b',
        borderTopWidth: 1,
        borderColor: '#27272a',
    },
    modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 20, textAlign: 'center', color: '#f8fafc' },
    typeToggle: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    typeButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(39, 39, 42, 0.8)', borderWidth: 1, borderColor: '#27272a' },
    typeButtonText: { fontWeight: '500' },
    input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 16, backgroundColor: 'rgba(24, 24, 27, 0.8)', color: '#f8fafc', borderColor: '#27272a' },
    label: { fontSize: 14, fontWeight: '500', marginBottom: 8, color: '#f8fafc' },
    categoryScroll: { marginBottom: 16 },
    categoryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: 'rgba(39, 39, 42, 0.8)', borderWidth: 1, borderColor: '#27272a' },
    categoryIcon: { fontSize: 16, marginRight: 6 },
    categoryName: { fontSize: 12 },
    modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
    cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, backgroundColor: 'rgba(39, 39, 42, 0.8)', borderColor: '#27272a' },
    cancelButtonText: { fontWeight: '500', color: '#f8fafc' },
    saveButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#3b82f6' },
    saveButtonText: { color: '#fff', fontWeight: '600' },
});
