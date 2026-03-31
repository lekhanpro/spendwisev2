// lib/ai.ts - Groq AI Integration for Financial Insights
// API key should be set via environment variable (VITE_GROQ_API_KEY for web)
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

import { Transaction, Budget, Goal } from '../types';

interface AIInsight {
    title: string;
    message: string;
    type: 'tip' | 'warning' | 'success' | 'info';
    icon: string;
}

interface SpendingAnalysis {
    healthScore: number;
    insights: AIInsight[];
    recommendations: string[];
    summary: string;
}

export async function getFinancialInsights(
    transactions: Transaction[],
    budgets: Budget[],
    goals: Goal[],
    currency: string
): Promise<SpendingAnalysis> {
    try {
        // Calculate spending data
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        const monthTransactions = transactions.filter(t => t.date >= monthStart);
        const totalIncome = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        // Group expenses by category
        const categorySpending: Record<string, number> = {};
        monthTransactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
            });

        // Calculate budget usage
        const budgetUsage = budgets.map(b => {
            const spent = categorySpending[b.category] || 0;
            return {
                category: b.category,
                limit: b.limit,
                spent,
                percentage: (spent / b.limit) * 100
            };
        });

        // Calculate goal progress
        const goalProgress = goals.map(g => ({
            name: g.name,
            target: g.targetAmount,
            current: g.currentAmount,
            percentage: (g.currentAmount / g.targetAmount) * 100,
            daysLeft: Math.ceil((g.deadline - Date.now()) / 86400000)
        }));

        const prompt = `You are a financial advisor AI. Analyze this user's financial data and provide personalized insights.

**Monthly Summary:**
- Income: ${currency}${totalIncome.toFixed(2)}
- Expenses: ${currency}${totalExpenses.toFixed(2)}
- Savings: ${currency}${(totalIncome - totalExpenses).toFixed(2)}
- Savings Rate: ${totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0}%

**Spending by Category:**
${Object.entries(categorySpending).map(([cat, amt]) => `- ${cat}: ${currency}${amt.toFixed(2)}`).join('\n')}

**Budget Usage:**
${budgetUsage.map(b => `- ${b.category}: ${b.percentage.toFixed(0)}% used (${currency}${b.spent}/${currency}${b.limit})`).join('\n') || 'No budgets set'}

**Goals Progress:**
${goalProgress.map(g => `- ${g.name}: ${g.percentage.toFixed(0)}% (${g.daysLeft} days left)`).join('\n') || 'No goals set'}

Provide a JSON response with:
1. healthScore (0-100): Overall financial health rating
2. insights: Array of 3-4 insight objects with {title, message, type: "tip"|"warning"|"success"|"info", icon: emoji}
3. recommendations: Array of 3 actionable tips
4. summary: A brief 2-sentence summary of their financial situation

Respond ONLY with valid JSON, no markdown or explanation.`;

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You are a helpful financial advisor. Always respond with valid JSON only.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Groq API error:', response.status, errorText);
            
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your VITE_GROQ_API_KEY.');
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
            }
            
            throw new Error(`Groq API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            throw new Error('Empty response from Groq API');
        }

        // Parse JSON response
        let parsed;
        try {
            parsed = JSON.parse(content);
        } catch (parseError) {
            console.error('Failed to parse AI response:', content);
            throw new Error('Invalid response format from AI');
        }

        return {
            healthScore: parsed.healthScore || 50,
            insights: parsed.insights || [],
            recommendations: parsed.recommendations || [],
            summary: parsed.summary || 'Unable to analyze your finances at this time.',
        };
    } catch (error) {
        console.error('AI Insights error:', error);

        // Return fallback insights
        return getDefaultInsights(transactions, budgets, goals);
    }
}

function getDefaultInsights(
    transactions: Transaction[],
    budgets: Budget[],
    goals: Goal[]
): SpendingAnalysis {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const monthTransactions = transactions.filter(t => t.date >= monthStart);

    const totalIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    const insights: AIInsight[] = [];

    // Savings insight
    if (savingsRate >= 20) {
        insights.push({
            title: 'Great Savings!',
            message: `You're saving ${savingsRate.toFixed(0)}% of your income. Keep it up!`,
            type: 'success',
            icon: '🎉'
        });
    } else if (savingsRate > 0) {
        insights.push({
            title: 'Building Savings',
            message: `You're saving ${savingsRate.toFixed(0)}%. Try to reach 20% for financial security.`,
            type: 'tip',
            icon: '💡'
        });
    } else {
        insights.push({
            title: 'Spending Alert',
            message: 'You are spending more than you earn. Review your expenses.',
            type: 'warning',
            icon: '⚠️'
        });
    }

    // Budget insights
    budgets.forEach(budget => {
        const spent = monthTransactions
            .filter(t => t.type === 'expense' && t.category === budget.category)
            .reduce((sum, t) => sum + t.amount, 0);
        const percentage = (spent / budget.limit) * 100;

        if (percentage >= 100) {
            insights.push({
                title: 'Budget Exceeded',
                message: `Your ${budget.category} budget is over by ${(percentage - 100).toFixed(0)}%`,
                type: 'warning',
                icon: '🚨'
            });
        } else if (percentage >= 80) {
            insights.push({
                title: 'Budget Warning',
                message: `${budget.category} is at ${percentage.toFixed(0)}% of budget`,
                type: 'info',
                icon: '📊'
            });
        }
    });

    // Goal insights
    goals.forEach(goal => {
        const daysLeft = Math.ceil((goal.deadline - Date.now()) / 86400000);
        const percentage = (goal.currentAmount / goal.targetAmount) * 100;

        if (percentage >= 100) {
            insights.push({
                title: 'Goal Achieved!',
                message: `Congratulations! You've reached your "${goal.name}" goal!`,
                type: 'success',
                icon: '🏆'
            });
        } else if (daysLeft <= 30 && percentage < 80) {
            insights.push({
                title: 'Goal At Risk',
                message: `"${goal.name}" needs attention - ${daysLeft} days left`,
                type: 'warning',
                icon: '⏰'
            });
        }
    });

    return {
        healthScore: Math.min(100, Math.max(0, savingsRate + 30 + (goals.length > 0 ? 10 : 0) + (budgets.length > 0 ? 10 : 0))),
        insights: insights.slice(0, 4),
        recommendations: [
            'Track all expenses daily for better awareness',
            'Set up budgets for your top spending categories',
            'Aim to save at least 20% of your income',
        ],
        summary: `This month you have earned and spent money. ${savingsRate > 0 ? 'You are on the right track!' : 'Consider reducing expenses.'}`,
    };
}

export async function getQuickTip(): Promise<string> {
    const tips = [
        "💡 Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings",
        "💰 Automate your savings - pay yourself first!",
        "📊 Review your subscriptions monthly - cancel unused ones",
        "🛒 Make a shopping list and stick to it",
        "☕ Small daily expenses add up - track your coffee spending!",
        "🎯 Set specific financial goals with deadlines",
        "💳 Pay off high-interest debt first",
        "🏦 Keep 3-6 months of expenses as emergency fund",
    ];
    return tips[Math.floor(Math.random() * tips.length)];
}
