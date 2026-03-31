// Goals Screen
import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, useColorScheme, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Colors, generateId } from '../../constants/app';
import { Goal, Priority } from '../../types';

export default function GoalsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
    const { goals, addGoal, updateGoal, deleteGoal, formatCurrency } = useApp();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');
    const [deadline, setDeadline] = useState('');
    const [priority, setPriority] = useState<Priority>('medium');

    const resetForm = () => {
        setName('');
        setTargetAmount('');
        setCurrentAmount('');
        setDeadline('');
        setPriority('medium');
        setEditingGoal(null);
    };

    const openAddModal = () => {
        resetForm();
        setModalVisible(true);
    };

    const openEditModal = (goal: Goal) => {
        setEditingGoal(goal);
        setName(goal.name);
        setTargetAmount(goal.targetAmount.toString());
        setCurrentAmount(goal.currentAmount.toString());
        setDeadline(new Date(goal.deadline).toISOString().split('T')[0]);
        setPriority(goal.priority);
        setModalVisible(true);
    };

    const handleSave = () => {
        if (!name || !targetAmount) {
            Alert.alert('Error', 'Please fill in required fields');
            return;
        }

        const goalData: Goal = {
            id: editingGoal?.id || generateId(),
            name,
            targetAmount: parseFloat(targetAmount),
            currentAmount: parseFloat(currentAmount) || 0,
            deadline: deadline ? new Date(deadline).getTime() : Date.now() + 86400000 * 30,
            priority,
        };

        if (editingGoal) {
            updateGoal(goalData);
        } else {
            addGoal(goalData);
        }

        setModalVisible(false);
        resetForm();
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Delete Goal',
            'Are you sure you want to delete this goal?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteGoal(id) },
            ]
        );
    };

    const addFunds = (goal: Goal, amount: number) => {
        updateGoal({
            ...goal,
            currentAmount: Math.min(goal.currentAmount + amount, goal.targetAmount),
        });
    };

    const getPriorityColor = (p: Priority) => {
        switch (p) {
            case 'high': return theme.danger;
            case 'medium': return theme.warning;
            case 'low': return theme.success;
        }
    };

    const getDaysRemaining = (deadline: number) => {
        const days = Math.ceil((deadline - Date.now()) / 86400000);
        return days > 0 ? `${days} days left` : 'Overdue';
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {goals.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🎯</Text>
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                            No goals yet. Tap + to create one.
                        </Text>
                    </View>
                ) : (
                    goals.map((goal) => {
                        const percentage = (goal.currentAmount / goal.targetAmount) * 100;
                        const isComplete = goal.currentAmount >= goal.targetAmount;

                        return (
                            <TouchableOpacity
                                key={goal.id}
                                style={[styles.goalCard, { backgroundColor: theme.card }]}
                                onPress={() => openEditModal(goal)}
                                onLongPress={() => handleDelete(goal.id)}
                            >
                                <View style={styles.goalHeader}>
                                    <View>
                                        <Text style={[styles.goalName, { color: theme.text }]}>{goal.name}</Text>
                                        <View style={styles.goalMeta}>
                                            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(goal.priority) + '20' }]}>
                                                <Text style={[styles.priorityText, { color: getPriorityColor(goal.priority) }]}>
                                                    {goal.priority.toUpperCase()}
                                                </Text>
                                            </View>
                                            <Text style={[styles.deadline, { color: theme.textSecondary }]}>
                                                {getDaysRemaining(goal.deadline)}
                                            </Text>
                                        </View>
                                    </View>
                                    {isComplete && <Text style={styles.completeIcon}>✅</Text>}
                                </View>

                                <View style={styles.amountRow}>
                                    <Text style={[styles.currentAmount, { color: theme.primary }]}>
                                        {formatCurrency(goal.currentAmount)}
                                    </Text>
                                    <Text style={[styles.targetAmount, { color: theme.textSecondary }]}>
                                        / {formatCurrency(goal.targetAmount)}
                                    </Text>
                                </View>

                                <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                                    <View
                                        style={[styles.progressFill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: isComplete ? theme.success : theme.primary }]}
                                    />
                                </View>

                                {!isComplete && (
                                    <View style={styles.quickAddRow}>
                                        {[100, 500, 1000].map((amt) => (
                                            <TouchableOpacity
                                                key={amt}
                                                style={[styles.quickAddButton, { backgroundColor: theme.primary + '20' }]}
                                                onPress={() => addFunds(goal, amt)}
                                            >
                                                <Text style={[styles.quickAddText, { color: theme.primary }]}>+{amt}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
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
                            {editingGoal ? 'Edit Goal' : 'Add Goal'}
                        </Text>

                        <TextInput
                            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                            placeholder="Goal Name"
                            placeholderTextColor={theme.textSecondary}
                            value={name}
                            onChangeText={setName}
                        />

                        <TextInput
                            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                            placeholder="Target Amount"
                            placeholderTextColor={theme.textSecondary}
                            keyboardType="numeric"
                            value={targetAmount}
                            onChangeText={setTargetAmount}
                        />

                        <TextInput
                            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                            placeholder="Current Amount (optional)"
                            placeholderTextColor={theme.textSecondary}
                            keyboardType="numeric"
                            value={currentAmount}
                            onChangeText={setCurrentAmount}
                        />

                        <TextInput
                            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                            placeholder="Deadline (YYYY-MM-DD)"
                            placeholderTextColor={theme.textSecondary}
                            value={deadline}
                            onChangeText={setDeadline}
                        />

                        {/* Priority Toggle */}
                        <Text style={[styles.label, { color: theme.text }]}>Priority</Text>
                        <View style={styles.priorityToggle}>
                            {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                                <TouchableOpacity
                                    key={p}
                                    style={[styles.priorityButton, priority === p && { backgroundColor: getPriorityColor(p) }]}
                                    onPress={() => setPriority(p)}
                                >
                                    <Text style={[styles.priorityButtonText, { color: priority === p ? '#fff' : theme.text }]}>
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
    goalCard: { padding: 16, borderRadius: 16, marginBottom: 12 },
    goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    goalName: { fontSize: 18, fontWeight: '600', marginBottom: 6 },
    goalMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    priorityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    priorityText: { fontSize: 10, fontWeight: '600' },
    deadline: { fontSize: 12 },
    completeIcon: { fontSize: 24 },
    amountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
    currentAmount: { fontSize: 24, fontWeight: '700' },
    targetAmount: { fontSize: 14, marginLeft: 4 },
    progressBar: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
    progressFill: { height: '100%', borderRadius: 4 },
    quickAddRow: { flexDirection: 'row', gap: 8 },
    quickAddButton: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
    quickAddText: { fontWeight: '600' },
    fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4 },
    fabText: { color: '#fff', fontSize: 28, fontWeight: '300' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
    priorityToggle: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    priorityButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', backgroundColor: '#64748b20' },
    priorityButtonText: { fontWeight: '500' },
    modalButtons: { flexDirection: 'row', gap: 12 },
    cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
    cancelButtonText: { fontWeight: '500' },
    saveButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    saveButtonText: { color: '#fff', fontWeight: '600' },
});
