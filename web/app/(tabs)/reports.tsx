// Reports Screen
import React, { useState, useMemo } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    useColorScheme,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { Colors, DEFAULT_CATEGORIES } from '../../constants/app';
import { PieChart, BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

type TimeRange = 'week' | 'month' | 'year';

export default function ReportsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
    const { transactions, formatCurrency } = useApp();
    const [timeRange, setTimeRange] = useState<TimeRange>('month');

    const getDateRange = () => {
        const now = new Date();
        switch (timeRange) {
            case 'week':
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - 7);
                return weekStart.getTime();
            case 'month':
                return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
            case 'year':
                return new Date(now.getFullYear(), 0, 1).getTime();
            default:
                return 0;
        }
    };

    const filteredTransactions = useMemo(() => {
        const startDate = getDateRange();
        return transactions.filter(t => t.date >= startDate);
    }, [transactions, timeRange]);

    const stats = useMemo(() => {
        const income = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const expenses = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        const savings = income - expenses;
        const savingsRate = income > 0 ? (savings / income) * 100 : 0;

        return { income, expenses, savings, savingsRate };
    }, [filteredTransactions]);

    const categoryData = useMemo(() => {
        const data: Record<string, number> = {};
        filteredTransactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                data[t.category] = (data[t.category] || 0) + t.amount;
            });

        const sorted = Object.entries(data)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6);

        return sorted.map(([category, amount]) => {
            const cat = DEFAULT_CATEGORIES.find(c => c.id === category);
            return {
                name: cat?.name || category,
                amount,
                color: cat?.color || '#64748b',
                icon: cat?.icon || '📦',
                legendFontColor: theme.text,
                legendFontSize: 12,
            };
        });
    }, [filteredTransactions, theme]);

    const pieChartData = categoryData.map(item => ({
        name: item.name.slice(0, 10),
        population: item.amount,
        color: item.color,
        legendFontColor: theme.text,
        legendFontSize: 11,
    }));

    // Daily spending for bar chart
    const dailyData = useMemo(() => {
        const days: Record<string, number> = {};
        const now = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const key = date.toLocaleDateString('en', { weekday: 'short' });
            days[key] = 0;
        }

        filteredTransactions
            .filter(t => t.type === 'expense' && t.date >= Date.now() - 7 * 86400000)
            .forEach(t => {
                const date = new Date(t.date);
                const key = date.toLocaleDateString('en', { weekday: 'short' });
                if (days[key] !== undefined) {
                    days[key] += t.amount;
                }
            });

        return {
            labels: Object.keys(days),
            datasets: [{ data: Object.values(days) }],
        };
    }, [filteredTransactions]);

    const chartConfig = {
        backgroundColor: theme.card,
        backgroundGradientFrom: theme.card,
        backgroundGradientTo: theme.card,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        labelColor: () => theme.textSecondary,
        style: { borderRadius: 16 },
        propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: theme.border,
        },
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Time Range Selector */}
            <View style={[styles.rangeSelector, { backgroundColor: theme.card }]}>
                {(['week', 'month', 'year'] as TimeRange[]).map(range => (
                    <TouchableOpacity
                        key={range}
                        style={[
                            styles.rangeButton,
                            timeRange === range && { backgroundColor: theme.primary },
                        ]}
                        onPress={() => setTimeRange(range)}
                    >
                        <Text
                            style={[
                                styles.rangeText,
                                { color: timeRange === range ? '#fff' : theme.text },
                            ]}
                        >
                            {range.charAt(0).toUpperCase() + range.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Summary Cards */}
            <View style={styles.summaryRow}>
                <View style={[styles.summaryCard, { backgroundColor: '#10b98120' }]}>
                    <Text style={[styles.summaryLabel, { color: theme.success }]}>Income</Text>
                    <Text style={[styles.summaryValue, { color: theme.success }]}>
                        {formatCurrency(stats.income)}
                    </Text>
                </View>
                <View style={[styles.summaryCard, { backgroundColor: '#ef444420' }]}>
                    <Text style={[styles.summaryLabel, { color: theme.danger }]}>Expenses</Text>
                    <Text style={[styles.summaryValue, { color: theme.danger }]}>
                        {formatCurrency(stats.expenses)}
                    </Text>
                </View>
            </View>

            <View style={styles.summaryRow}>
                <View style={[styles.summaryCard, { backgroundColor: '#3b82f620' }]}>
                    <Text style={[styles.summaryLabel, { color: theme.primary }]}>Savings</Text>
                    <Text style={[styles.summaryValue, { color: stats.savings >= 0 ? theme.primary : theme.danger }]}>
                        {formatCurrency(stats.savings)}
                    </Text>
                </View>
                <View style={[styles.summaryCard, { backgroundColor: '#8b5cf620' }]}>
                    <Text style={[styles.summaryLabel, { color: '#8b5cf6' }]}>Savings Rate</Text>
                    <Text style={[styles.summaryValue, { color: '#8b5cf6' }]}>
                        {stats.savingsRate.toFixed(1)}%
                    </Text>
                </View>
            </View>

            {/* Spending by Category */}
            {categoryData.length > 0 && (
                <View style={[styles.section, { backgroundColor: theme.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        Spending by Category
                    </Text>
                    <PieChart
                        data={pieChartData}
                        width={screenWidth - 64}
                        height={180}
                        chartConfig={chartConfig}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="0"
                        absolute
                    />

                    {/* Category breakdown */}
                    <View style={styles.categoryList}>
                        {categoryData.map((item, index) => (
                            <View key={index} style={styles.categoryItem}>
                                <View style={styles.categoryLeft}>
                                    <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                                    <Text style={styles.categoryIcon}>{item.icon}</Text>
                                    <Text style={[styles.categoryName, { color: theme.text }]}>
                                        {item.name}
                                    </Text>
                                </View>
                                <Text style={[styles.categoryAmount, { color: theme.text }]}>
                                    {formatCurrency(item.amount)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Daily Spending Chart */}
            <View style={[styles.section, { backgroundColor: theme.card }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Daily Spending (Last 7 Days)
                </Text>
                <BarChart
                    data={dailyData}
                    width={screenWidth - 64}
                    height={200}
                    chartConfig={chartConfig}
                    style={styles.chart}
                    showValuesOnTopOfBars
                    fromZero
                    yAxisLabel=""
                    yAxisSuffix=""
                />
            </View>

            {/* Transaction Count */}
            <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.primary }]}>
                        {filteredTransactions.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                        Transactions
                    </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.primary }]}>
                        {filteredTransactions.filter(t => t.type === 'expense').length}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                        Expenses
                    </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.primary }]}>
                        {filteredTransactions.filter(t => t.type === 'income').length}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                        Income
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    rangeSelector: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    rangeButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    rangeText: {
        fontSize: 14,
        fontWeight: '500',
    },
    summaryRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    summaryCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    section: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    categoryList: {
        marginTop: 16,
    },
    categoryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    categoryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    categoryDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    categoryIcon: {
        fontSize: 16,
    },
    categoryName: {
        fontSize: 14,
    },
    categoryAmount: {
        fontSize: 14,
        fontWeight: '600',
    },
    statsCard: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 16,
        marginBottom: 32,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        backgroundColor: '#e2e8f0',
        marginHorizontal: 8,
    },
});
