import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, Platform, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/app';
import { useApp } from '../../context/AppContext';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={22} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const theme = Colors.dark;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setShowTransactionModal } = useApp();

  const tabBarHeight = Platform.OS === 'android' ? 60 + insets.bottom : 70 + insets.bottom;

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarStyle: {
            backgroundColor: '#18181b',
            borderTopColor: '#27272a',
            borderTopWidth: 1,
            paddingBottom: Platform.OS === 'android' ? insets.bottom + 8 : insets.bottom,
            height: tabBarHeight,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
          },
          headerStyle: {
            backgroundColor: '#000000',
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: theme.text,
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/settings')}
              style={{ marginRight: 16 }}
            >
              <FontAwesome name="cog" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          ),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            title: 'Transactions',
            tabBarIcon: ({ color }) => <TabBarIcon name="exchange" color={color} />,
          }}
        />
        <Tabs.Screen
          name="budget"
          options={{
            title: 'Budget',
            tabBarIcon: ({ color }) => <TabBarIcon name="pie-chart" color={color} />,
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: 'Reports',
            tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart" color={color} />,
          }}
        />
        <Tabs.Screen
          name="goals"
          options={{
            title: 'Goals',
            tabBarIcon: ({ color }) => <TabBarIcon name="bullseye" color={color} />,
          }}
        />
        {/* Hidden tabs - accessible from Settings */}
        <Tabs.Screen
          name="insights"
          options={{
            href: null,
            title: 'AI Insights',
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            href: null,
            title: 'Settings',
          }}
        />
      </Tabs>

      {/* Floating Action Buttons for Add Expense/Income */}
      <View style={[styles.fabContainer, { bottom: tabBarHeight + 16 }]}>
        <TouchableOpacity
          style={[styles.fab, styles.expenseFab]}
          onPress={() => setShowTransactionModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>−</Text>
          <Text style={styles.fabText}>Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fab, styles.incomeFab]}
          onPress={() => setShowTransactionModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>+</Text>
          <Text style={styles.fabText}>Income</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    zIndex: 100,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    gap: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  expenseFab: {
    backgroundColor: '#ef4444',
  },
  incomeFab: {
    backgroundColor: '#10b981',
  },
  fabIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  fabText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

