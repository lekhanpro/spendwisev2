// Settings Screen
import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, useColorScheme, TouchableOpacity, Switch, Alert, Modal } from 'react-native';
import { useApp } from '../../context/AppContext';
import { Colors, SUPPORTED_CURRENCIES } from '../../constants/app';

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
    const { user, darkMode, setDarkMode, currency, setCurrency, handleLogout, resetData, transactions, budgets, goals } = useApp();

    const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

    const handleResetData = () => {
        Alert.alert(
            'Reset All Data',
            'This will delete all your transactions, budgets, and goals. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Reset', style: 'destructive', onPress: resetData },
            ]
        );
    };

    const handleLogoutPress = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', onPress: handleLogout },
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* User Info */}
                {user && (
                    <View style={[styles.section, { backgroundColor: theme.card }]}>
                        <View style={styles.userInfo}>
                            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                                <Text style={styles.avatarText}>
                                    {user.email?.charAt(0).toUpperCase() || 'U'}
                                </Text>
                            </View>
                            <View>
                                <Text style={[styles.userName, { color: theme.text }]}>
                                    {user.displayName || 'User'}
                                </Text>
                                <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                                    {user.email}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Statistics */}
                <View style={[styles.section, { backgroundColor: theme.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Statistics</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.primary }]}>{transactions.length}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Transactions</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.primary }]}>{budgets.length}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Budgets</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.primary }]}>{goals.length}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Goals</Text>
                        </View>
                    </View>
                </View>

                {/* Preferences */}
                <View style={[styles.section, { backgroundColor: theme.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Preferences</Text>

                    <View style={styles.settingRow}>
                        <View>
                            <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
                            <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>Use dark theme</Text>
                        </View>
                        <Switch
                            value={darkMode}
                            onValueChange={setDarkMode}
                            trackColor={{ false: theme.border, true: theme.primary }}
                            thumbColor="#fff"
                        />
                    </View>

                    <TouchableOpacity style={styles.settingRow} onPress={() => setCurrencyModalVisible(true)}>
                        <View>
                            <Text style={[styles.settingLabel, { color: theme.text }]}>Currency</Text>
                            <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>Select your currency</Text>
                        </View>
                        <View style={styles.currencyPreview}>
                            <Text style={[styles.currencySymbol, { color: theme.text }]}>{currency.symbol}</Text>
                            <Text style={[styles.currencyCode, { color: theme.textSecondary }]}>{currency.code}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Danger Zone */}
                <View style={[styles.section, { backgroundColor: theme.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.danger }]}>Danger Zone</Text>

                    <TouchableOpacity style={[styles.dangerButton, { borderColor: theme.danger }]} onPress={handleResetData}>
                        <Text style={[styles.dangerButtonText, { color: theme.danger }]}>Reset All Data</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.danger }]} onPress={handleLogoutPress}>
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={[styles.appName, { color: theme.text }]}>💰 SpendWise</Text>
                    <Text style={[styles.appVersion, { color: theme.textSecondary }]}>Version 2.0.0</Text>
                    <Text style={[styles.appCopyright, { color: theme.textSecondary }]}>© 2024 SpendWise</Text>
                </View>
            </ScrollView>

            {/* Currency Modal */}
            <Modal visible={currencyModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Select Currency</Text>

                        {SUPPORTED_CURRENCIES.map((curr) => (
                            <TouchableOpacity
                                key={curr.code}
                                style={[
                                    styles.currencyOption,
                                    currency.code === curr.code && { backgroundColor: theme.primary + '20' },
                                ]}
                                onPress={() => { setCurrency(curr); setCurrencyModalVisible(false); }}
                            >
                                <Text style={[styles.currencyOptionSymbol, { color: theme.text }]}>{curr.symbol}</Text>
                                <View style={styles.currencyOptionInfo}>
                                    <Text style={[styles.currencyOptionName, { color: theme.text }]}>{curr.name}</Text>
                                    <Text style={[styles.currencyOptionCode, { color: theme.textSecondary }]}>{curr.code}</Text>
                                </View>
                                {currency.code === curr.code && <Text style={styles.checkmark}>✓</Text>}
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={[styles.closeButton, { borderColor: theme.border }]}
                            onPress={() => setCurrencyModalVisible(false)}
                        >
                            <Text style={[styles.closeButtonText, { color: theme.text }]}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 16 },
    section: { padding: 16, borderRadius: 16, marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
    userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#fff', fontSize: 20, fontWeight: '600' },
    userName: { fontSize: 16, fontWeight: '600' },
    userEmail: { fontSize: 14, marginTop: 2 },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: '700' },
    statLabel: { fontSize: 12, marginTop: 4 },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#64748b20' },
    settingLabel: { fontSize: 15, fontWeight: '500' },
    settingDesc: { fontSize: 12, marginTop: 2 },
    currencyPreview: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    currencySymbol: { fontSize: 18, fontWeight: '600' },
    currencyCode: { fontSize: 12 },
    dangerButton: { borderWidth: 1, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 12 },
    dangerButtonText: { fontWeight: '600' },
    logoutButton: { borderRadius: 12, padding: 14, alignItems: 'center' },
    logoutButtonText: { color: '#fff', fontWeight: '600' },
    appInfo: { alignItems: 'center', paddingVertical: 24 },
    appName: { fontSize: 20, fontWeight: '600' },
    appVersion: { fontSize: 12, marginTop: 4 },
    appCopyright: { fontSize: 12, marginTop: 2 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
    currencyOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 8 },
    currencyOptionSymbol: { fontSize: 24, width: 40 },
    currencyOptionInfo: { flex: 1 },
    currencyOptionName: { fontSize: 15, fontWeight: '500' },
    currencyOptionCode: { fontSize: 12 },
    checkmark: { fontSize: 18, color: '#10b981' },
    closeButton: { borderWidth: 1, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 12 },
    closeButtonText: { fontWeight: '500' },
});
