// lib/ai.ts - AI integration for SpendWise
// Server-side proxy (/api/chat) is preferred; direct Groq call is the fallback.
// To harden security: create web/api/chat.ts as a Vercel serverless function,
// set GROQ_API_KEY (no VITE_ prefix) in Vercel env vars, remove VITE_GROQ_API_KEY.
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const SERVER_PROXY_URL = '/api/chat';
const TIMEOUT_MS = 20000;

import { Transaction, Budget, Goal } from '../types';

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(id);
    }
}

// Try server proxy first (more secure), fall back to direct Groq call.
async function callAI(messages: Array<{ role: string; content: string }>, systemPrompt?: string): Promise<string> {
    // Attempt server-side proxy
    try {
        const probeRes = await fetch(SERVER_PROXY_URL, { method: 'HEAD' }).catch(() => null);
        if (probeRes && probeRes.status !== 404) {
            const proxyRes = await fetchWithTimeout(SERVER_PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages, systemPrompt }),
            });
            if (proxyRes.ok) {
                const data = await proxyRes.json();
                if (data?.content) return data.content;
            }
            if (proxyRes.status === 429) throw new AIError('rate_limit', 'AI service is busy. Try again in a moment.');
            if (proxyRes.status === 504) throw new AIError('timeout', 'AI request timed out. Try a shorter message.');
            if (proxyRes.status === 503) throw new AIError('not_configured', 'AI assistant is not configured on this server.');
        }
    } catch (err) {
        if (err instanceof AIError) throw err;
        // proxy not available — fall through to direct call
    }

    // Direct Groq call fallback
    if (!GROQ_API_KEY) {
        throw new AIError('not_configured', 'AI assistant needs a GROQ_API_KEY. See .env.example for setup.');
    }

    const allMessages = [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        ...messages,
    ];

    let res: Response;
    try {
        res = await fetchWithTimeout(GROQ_API_URL, {
            method: 'POST',
            headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: allMessages, temperature: 0.7, max_tokens: 800 }),
        });
    } catch (err: any) {
        if (err?.name === 'AbortError') throw new AIError('timeout', 'AI request timed out. Try a shorter message.');
        throw new AIError('network', 'Network error reaching AI service. Check your connection.');
    }

    if (!res.ok) {
        if (res.status === 401) throw new AIError('auth', 'Invalid Groq API key. Check VITE_GROQ_API_KEY in .env.local.');
        if (res.status === 429) throw new AIError('rate_limit', 'Rate limit hit. Please wait a moment and try again.');
        throw new AIError('upstream', `AI service error (${res.status}). Try again shortly.`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new AIError('empty', 'AI returned an empty response. Try again.');
    return content;
}

export class AIError extends Error {
    constructor(public readonly code: 'not_configured' | 'auth' | 'rate_limit' | 'timeout' | 'network' | 'upstream' | 'empty', message: string) {
        super(message);
        this.name = 'AIError';
    }
}

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

        const rawContent = await callAI(
            [{ role: 'user', content: prompt }],
            'You are a helpful financial advisor. Always respond with valid JSON only.'
        );

        // Parse JSON response — strip markdown code fences if present
        const stripped = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
        let parsed: any;
        try {
            parsed = JSON.parse(stripped);
        } catch {
            // Try to extract JSON from the response
            const match = stripped.match(/\{[\s\S]*\}/);
            if (match) {
                try { parsed = JSON.parse(match[0]); } catch { throw new Error('Could not parse AI response as JSON'); }
            } else {
                throw new Error('AI returned non-JSON response');
            }
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
