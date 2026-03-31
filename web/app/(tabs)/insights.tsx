// AI Insights Screen
import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    useColorScheme,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import { Colors } from '../../constants/app';
import { getFinancialInsights, getQuickTip } from '../../lib/ai';

interface Insight {
    title: string;
    message: string;
    type: 'tip' | 'warning' | 'success' | 'info';
    icon: string;
}

export default function InsightsScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
    const { transactions, budgets, goals, currency } = useApp();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [healthScore, setHealthScore] = useState(0);
    const [insights, setInsights] = useState<Insight[]>([]);
    const [recommendations, setRecommendations] = useState<string[]>([]);
    const [summary, setSummary] = useState('');
    const [quickTip, setQuickTip] = useState('');

    const loadInsights = async () => {
        try {
            const result = await getFinancialInsights(
                transactions,
                budgets,
                goals,
                currency.symbol
            );
            setHealthScore(result.healthScore);
            setInsights(result.insights);
            setRecommendations(result.recommendations);
            setSummary(result.summary);
            setQuickTip(await getQuickTip());
        } catch (error) {
            console.error('Error loading insights:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadInsights();
    }, [transactions, budgets, goals]);

    const onRefresh = () => {
        setRefreshing(true);
        loadInsights();
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return theme.success;
        if (score >= 40) return theme.warning;
        return theme.danger;
    };

    const getInsightColor = (type: string) => {
        switch (type) {
            case 'success': return theme.success;
            case 'warning': return theme.warning;
            case 'tip': return theme.primary;
            default: return theme.textSecondary;
        }
    };

    const getInsightBgColor = (type: string) => {
        switch (type) {
            case 'success': return theme.success + '15';
            case 'warning': return theme.warning + '15';
            case 'tip': return theme.primary + '15';
            default: return theme.textSecondary + '15';
        }
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                    🤖 Analyzing your finances...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.background }]}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Health Score */}
            <View style={[styles.scoreCard, { backgroundColor: theme.card }]}>
                <Text style={[styles.scoreTitle, { color: theme.textSecondary }]}>
                    Financial Health Score
                </Text>
                <View style={styles.scoreContainer}>
                    <View style={[styles.scoreCircle, { borderColor: getScoreColor(healthScore) }]}>
                        <Text style={[styles.scoreValue, { color: getScoreColor(healthScore) }]}>
                            {healthScore}
                        </Text>
                        <Text style={[styles.scoreMax, { color: theme.textSecondary }]}>/100</Text>
                    </View>
                </View>
                <Text style={[styles.scoreSummary, { color: theme.text }]}>{summary}</Text>
            </View>

            {/* Quick Tip */}
            <View style={[styles.tipCard, { backgroundColor: theme.primary + '15' }]}>
                <Text style={[styles.tipText, { color: theme.primary }]}>{quickTip}</Text>
            </View>

            {/* AI Insights */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>🤖 AI Insights</Text>
                {insights.map((insight, index) => (
                    <View
                        key={index}
                        style={[styles.insightCard, { backgroundColor: getInsightBgColor(insight.type) }]}
                    >
                        <Text style={styles.insightIcon}>{insight.icon}</Text>
                        <View style={styles.insightContent}>
                            <Text style={[styles.insightTitle, { color: getInsightColor(insight.type) }]}>
                                {insight.title}
                            </Text>
                            <Text style={[styles.insightMessage, { color: theme.text }]}>
                                {insight.message}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Recommendations */}
            <View style={[styles.section, styles.recommendationsSection]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    💡 Recommendations
                </Text>
                <View style={[styles.recommendationsCard, { backgroundColor: theme.card }]}>
                    {recommendations.map((rec, index) => (
                        <View key={index} style={styles.recommendationItem}>
                            <Text style={styles.recommendationNumber}>{index + 1}</Text>
                            <Text style={[styles.recommendationText, { color: theme.text }]}>
                                {rec}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Refresh Button */}
            <TouchableOpacity
                style={[styles.refreshButton, { backgroundColor: theme.primary }]}
                onPress={onRefresh}
            >
                <Text style={styles.refreshButtonText}>🔄 Get New Insights</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    scoreCard: {
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 16,
    },
    scoreTitle: {
        fontSize: 14,
        marginBottom: 16,
    },
    scoreContainer: {
        marginBottom: 16,
    },
    scoreCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreValue: {
        fontSize: 42,
        fontWeight: '700',
    },
    scoreMax: {
        fontSize: 14,
        marginTop: -4,
    },
    scoreSummary: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    tipCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    tipText: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    insightCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    insightIcon: {
        fontSize: 28,
        marginRight: 12,
    },
    insightContent: {
        flex: 1,
    },
    insightTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    insightMessage: {
        fontSize: 13,
        lineHeight: 18,
    },
    recommendationsSection: {
        marginBottom: 24,
    },
    recommendationsCard: {
        padding: 16,
        borderRadius: 16,
    },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    recommendationNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#3b82f620',
        color: '#3b82f6',
        textAlign: 'center',
        lineHeight: 24,
        fontSize: 12,
        fontWeight: '600',
        marginRight: 12,
    },
    recommendationText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    refreshButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 32,
    },
    refreshButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
