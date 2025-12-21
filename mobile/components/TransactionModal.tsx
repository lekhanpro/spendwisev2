// components/TransactionModal.tsx - Global Transaction Modal
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Colors, DEFAULT_CATEGORIES, generateId } from '../constants/app';
import { Transaction } from '../types';

export const TransactionModal: React.FC = () => {
    const {
        showTransactionModal,
        setShowTransactionModal,
        editingTransaction,
        setEditingTransaction,
        addTransaction,
        updateTransaction,
    } = useApp();

    const theme = Colors.dark;
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');

    // Reset form when modal opens/closes
    useEffect(() => {
        if (showTransactionModal) {
            if (editingTransaction) {
                setType(editingTransaction.type);
                setAmount(editingTransaction.amount.toString());
                setCategory(editingTransaction.category);
                setDescription(editingTransaction.description);
            } else {
                resetForm();
            }
        }
    }, [showTransactionModal, editingTransaction]);

    const resetForm = () => {
        setType('expense');
        setAmount('');
        setCategory('');
        setDescription('');
    };

    const handleClose = () => {
        setShowTransactionModal(false);
        setEditingTransaction(null);
        resetForm();
    };

    const handleSave = () => {
        if (!amount || !category) {
            Alert.alert('Error', 'Please enter amount and select a category');
            return;
        }

        const transactionData: Transaction = {
            id: editingTransaction?.id || generateId(),
            type,
            amount: parseFloat(amount),
            category,
            paymentMethod: 'cash',
            date: editingTransaction?.date || Date.now(),
            description,
            tags: [],
        };

        if (editingTransaction) {
            updateTransaction(transactionData);
        } else {
            addTransaction(transactionData);
        }

        handleClose();
    };

    const filteredCategories = DEFAULT_CATEGORIES.filter(c => c.type === type);

    return (
        <Modal
            visible={showTransactionModal}
            animationType="slide"
            transparent
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={handleClose}
                />
                <View style={styles.container}>
                    <View style={styles.handle} />

                    <Text style={styles.title}>
                        {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
                    </Text>

                    {/* Type Toggle */}
                    <View style={styles.typeToggle}>
                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                type === 'expense' && styles.expenseActive
                            ]}
                            onPress={() => { setType('expense'); setCategory(''); }}
                        >
                            <Text style={[
                                styles.typeButtonText,
                                type === 'expense' && styles.typeButtonTextActive
                            ]}>
                                Expense
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.typeButton,
                                type === 'income' && styles.incomeActive
                            ]}
                            onPress={() => { setType('income'); setCategory(''); }}
                        >
                            <Text style={[
                                styles.typeButtonText,
                                type === 'income' && styles.typeButtonTextActive
                            ]}>
                                Income
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Amount Input */}
                    <TextInput
                        style={styles.input}
                        placeholder="Amount"
                        placeholderTextColor="#6b7280"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />

                    {/* Category Selector */}
                    <Text style={styles.label}>Category</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoryScroll}
                        contentContainerStyle={styles.categoryScrollContent}
                    >
                        {filteredCategories.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryChip,
                                    category === cat.id && { backgroundColor: cat.color }
                                ]}
                                onPress={() => setCategory(cat.id)}
                            >
                                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                                <Text style={[
                                    styles.categoryName,
                                    category === cat.id && styles.categoryNameActive
                                ]}>
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Description Input */}
                    <TextInput
                        style={styles.input}
                        placeholder="Description (optional)"
                        placeholderTextColor="#6b7280"
                        value={description}
                        onChangeText={setDescription}
                    />

                    {/* Buttons */}
                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleClose}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveButtonText}>
                                {editingTransaction ? 'Update' : 'Save'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    container: {
        backgroundColor: '#18181b',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        maxHeight: '85%',
        borderTopWidth: 1,
        borderColor: '#27272a',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#3f3f46',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#f8fafc',
        textAlign: 'center',
        marginBottom: 20,
    },
    typeToggle: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#27272a',
        borderWidth: 1,
        borderColor: '#3f3f46',
    },
    expenseActive: {
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
    },
    incomeActive: {
        backgroundColor: '#10b981',
        borderColor: '#10b981',
    },
    typeButtonText: {
        fontWeight: '600',
        color: '#a1a1aa',
    },
    typeButtonTextActive: {
        color: '#fff',
    },
    input: {
        backgroundColor: '#27272a',
        borderWidth: 1,
        borderColor: '#3f3f46',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#f8fafc',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#f8fafc',
        marginBottom: 8,
    },
    categoryScroll: {
        marginBottom: 16,
    },
    categoryScrollContent: {
        gap: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#27272a',
        borderWidth: 1,
        borderColor: '#3f3f46',
        marginRight: 8,
    },
    categoryIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    categoryName: {
        fontSize: 13,
        color: '#a1a1aa',
    },
    categoryNameActive: {
        color: '#fff',
        fontWeight: '600',
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#27272a',
        borderWidth: 1,
        borderColor: '#3f3f46',
    },
    cancelButtonText: {
        fontWeight: '600',
        color: '#f8fafc',
    },
    saveButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#3b82f6',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '700',
    },
});

export default TransactionModal;
