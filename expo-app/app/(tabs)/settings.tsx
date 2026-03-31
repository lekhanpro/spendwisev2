import React, { useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { AppContext } from '../../context/AppContext';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { session, handleLogout, categories } = useContext(AppContext)!;
  const router = useRouter();

  const onLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await handleLogout();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.accountCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>{session?.user?.displayName || 'User'}</Text>
            <Text style={styles.accountEmail}>{session?.user?.email || 'No email'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🌙</Text>
              <View>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingSubtitle}>Always enabled</Text>
              </View>
            </View>
            <View style={styles.toggle}>
              <View style={styles.toggleActive} />
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>📁</Text>
              <View>
                <Text style={styles.settingTitle}>Categories</Text>
                <Text style={styles.settingSubtitle}>{categories.length} categories available</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About SpendWise</Text>
          <Text style={styles.aboutText}>
            SpendWise is your personal finance companion. Track expenses, manage budgets, and achieve your financial goals with ease.
          </Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 Privacy</Text>
          <Text style={styles.aboutText}>
            All your data is stored securely with Firebase. We use industry-standard encryption to protect your financial information.
          </Text>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  accountCard: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#27272a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  accountEmail: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#3f3f46',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3b82f6',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignSelf: 'flex-end',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 18,
  },
  version: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 12,
  },
});
