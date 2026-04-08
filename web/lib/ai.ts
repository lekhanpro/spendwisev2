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

// ─── Financial Scorecard ─────────────────────────────────────────────────────

export interface ScorecardComponent {
  label: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  detail: string;
}

export interface FinancialScorecard {
  overall: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  components: ScorecardComponent[];
  summary: string;
}

function gradeFromScore(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

export function computeFinancialScorecard(
  transactions: Transaction[],
  budgets: Budget[],
  goals: Goal[]
): FinancialScorecard {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const monthTx = transactions.filter(t => t.date >= monthStart);
  const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savingsRate = income > 0 ? (income - expenses) / income : 0;

  const savingsScore = Math.min(100, Math.round(savingsRate * 250));
  const savingsComp: ScorecardComponent = {
    label: 'Savings Rate',
    score: savingsScore,
    grade: gradeFromScore(savingsScore),
    detail: `${(savingsRate * 100).toFixed(1)}% of income saved (target: 20%+)`,
  };

  let budgetScore = budgets.length === 0 ? 50 : 100;
  if (budgets.length > 0) {
    const overCount = budgets.filter(b => {
      const spent = monthTx.filter(t => t.type === 'expense' && t.category === b.category).reduce((s, t) => s + t.amount, 0);
      return spent > b.limit;
    }).length;
    budgetScore = Math.round(100 - (overCount / budgets.length) * 100);
  }
  const budgetComp: ScorecardComponent = {
    label: 'Budget Adherence',
    score: budgetScore,
    grade: gradeFromScore(budgetScore),
    detail: budgets.length === 0 ? 'No budgets set' : `${budgets.length - Math.round(budgets.length * (1 - budgetScore / 100))} of ${budgets.length} budgets on track`,
  };

  const goalScore = goals.length === 0 ? 50 : Math.min(100, Math.round(
    goals.reduce((s, g) => s + Math.min(1, g.currentAmount / g.targetAmount), 0) / goals.length * 100
  ));
  const goalComp: ScorecardComponent = {
    label: 'Goal Progress',
    score: goalScore,
    grade: gradeFromScore(goalScore),
    detail: goals.length === 0 ? 'No goals set' : `${goals.filter(g => g.currentAmount >= g.targetAmount).length} of ${goals.length} goals achieved`,
  };

  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
  const prevEnd = monthStart - 1;
  const prevExpenses = transactions.filter(t => t.type === 'expense' && t.date >= prevStart && t.date <= prevEnd).reduce((s, t) => s + t.amount, 0);
  const trendScore = prevExpenses === 0 ? 70
    : expenses <= prevExpenses ? Math.min(100, Math.round(70 + ((prevExpenses - expenses) / prevExpenses) * 100))
    : Math.max(0, Math.round(70 - ((expenses - prevExpenses) / prevExpenses) * 60));
  const trendComp: ScorecardComponent = {
    label: 'Spending Trend',
    score: trendScore,
    grade: gradeFromScore(trendScore),
    detail: prevExpenses === 0 ? 'No prior month data' : expenses <= prevExpenses ? 'Spending down vs last month ✓' : 'Spending up vs last month',
  };

  const uniqueCats = new Set(transactions.filter(t => t.type === 'expense').map(t => t.category)).size;
  const diversityScore = Math.min(100, uniqueCats * 14);
  const diversityComp: ScorecardComponent = {
    label: 'Tracking Diversity',
    score: diversityScore,
    grade: gradeFromScore(diversityScore),
    detail: `Tracking ${uniqueCats} expense categories`,
  };

  const overall = Math.round(
    savingsScore * 0.30 + budgetScore * 0.25 + goalScore * 0.20 + trendScore * 0.15 + diversityScore * 0.10
  );
  const grade = gradeFromScore(overall);
  const summary = overall >= 85
    ? 'Excellent financial health! Keep up the great work.'
    : overall >= 70
    ? 'Good financial health with room for improvement.'
    : overall >= 55
    ? 'Fair financial health — focus on savings and budgeting.'
    : 'Your finances need attention. Start with a monthly budget.';

  return { overall, grade, components: [savingsComp, budgetComp, goalComp, trendComp, diversityComp], summary };
}

// ─── Investment Suggestions ───────────────────────────────────────────────────

export interface InvestmentSuggestion {
  name: string;
  type: 'stock' | 'mutual_fund' | 'etf' | 'fixed_income' | 'savings_scheme' | 'crypto';
  risk: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
  expectedReturn: string;
  minAmount: number;
  description: string;
  why: string;
  emoji: string;
  tags: string[];
}

function defaultSuggestions(currencyCode: string): InvestmentSuggestion[] {
  if (currencyCode === 'INR') {
    return [
      { name: 'SIP – Nifty 50 Index Fund', type: 'mutual_fund', risk: 'medium', riskLevel: 'medium', expectedReturn: '11–13% p.a.', minAmount: 500, description: 'Low-cost index fund tracking Nifty 50 — ideal for long-term wealth creation.', why: 'Great for steady compounding over 5+ years with low expense ratio.', emoji: '📈', tags: ['index', 'equity', 'long-term'] },
      { name: 'PPF (Public Provident Fund)', type: 'fixed_income', risk: 'low', riskLevel: 'low', expectedReturn: '7.1% p.a.', minAmount: 500, description: 'Government-backed savings with tax-free returns and EEE tax benefit.', why: 'Safe, guaranteed returns with full tax exemption under EEE.', emoji: '🏦', tags: ['tax-free', 'government', 'safe'] },
      { name: 'ELSS Mutual Fund', type: 'mutual_fund', risk: 'medium', riskLevel: 'medium', expectedReturn: '12–15% p.a.', minAmount: 500, description: 'Equity-linked savings with 80C deduction and 3-year lock-in.', why: 'Saves ₹46,800 in tax while growing your wealth in equities.', emoji: '💼', tags: ['tax-saving', '80C', 'equity'] },
      { name: 'NPS (National Pension System)', type: 'savings_scheme', risk: 'low', riskLevel: 'low', expectedReturn: '9–11% p.a.', minAmount: 1000, description: 'Retirement-focused pension fund with ₹50k extra deduction under 80CCD(1B).', why: 'Additional ₹50k tax deduction beyond 80C limit — pure retirement wealth.', emoji: '🎯', tags: ['retirement', 'tax-saving'] },
    ];
  }
  if (currencyCode === 'USD') {
    return [
      { name: 'S&P 500 Index ETF (VOO)', type: 'etf', risk: 'medium', riskLevel: 'medium', expectedReturn: '9–11% p.a.', minAmount: 100, description: 'Broad US market exposure at minimal cost.', why: 'Historically beats most active funds over 10+ year periods.', emoji: '🇺🇸', tags: ['index', 'diversified', 'passive'] },
      { name: 'US I-Bonds', type: 'fixed_income', risk: 'low', riskLevel: 'low', expectedReturn: 'Inflation-linked', minAmount: 25, description: 'Inflation-protected government savings bonds — safe and tax-deferred.', why: 'Perfect for emergency fund overflow — beats inflation, zero credit risk.', emoji: '🛡️', tags: ['inflation', 'safe', 'government'] },
      { name: 'VXUS International ETF', type: 'etf', risk: 'medium', riskLevel: 'medium', expectedReturn: '7–9% p.a.', minAmount: 100, description: 'International developed and emerging market diversification.', why: 'Reduces concentration in US equities and adds global diversification.', emoji: '🌍', tags: ['international', 'diversification'] },
      { name: 'High-Yield Savings Account', type: 'fixed_income', risk: 'low', riskLevel: 'low', expectedReturn: '4.5–5.5% p.a.', minAmount: 1, description: 'Liquid emergency fund earning competitive interest.', why: 'Keep 3-6 months expenses here — liquid and earning real returns.', emoji: '💰', tags: ['liquid', 'emergency', 'safe'] },
    ];
  }
  return [
    { name: 'MSCI World ETF', type: 'etf', risk: 'medium', riskLevel: 'medium', expectedReturn: '8–10% p.a.', minAmount: 50, description: 'Global equity index covering 23 developed markets.', why: 'One-fund diversification across the global equity market.', emoji: '🌐', tags: ['global', 'diversified', 'passive'] },
    { name: 'Government Bonds', type: 'fixed_income', risk: 'low', riskLevel: 'low', expectedReturn: '4–5% p.a.', minAmount: 100, description: 'Safe government-backed fixed income with predictable returns.', why: 'Stable anchor in your portfolio against equity volatility.', emoji: '📋', tags: ['safe', 'government', 'fixed'] },
  ];
}

export async function getInvestmentSuggestions(
  transactions: Transaction[],
  goals: Goal[],
  currencyCode: string,
  currencySymbol: string
): Promise<InvestmentSuggestion[]> {
  if (!GROQ_API_KEY) return defaultSuggestions(currencyCode);

  try {
    const now = new Date();
    const ms = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const monthTx = transactions.filter(t => t.date >= ms);
    const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const surplus = income - expenses;

    const prompt = `You are a financial advisor AI. Suggest 4 personalized investments.
Monthly surplus: ${currencySymbol}${surplus.toFixed(0)}
Currency: ${currencyCode}
Goals: ${goals.map(g => `${g.name} (target: ${currencySymbol}${g.targetAmount})`).join(', ') || 'None'}
Respond ONLY with a JSON array of 4 objects, each: name, type (stock|mutual_fund|etf|fixed_income|savings_scheme|crypto), risk (low|medium|high), expectedReturn, minAmount (number in ${currencyCode}), description (1 sentence), tags (2-3 short tags). JSON only.`;

    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a financial advisor. Respond with valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
        max_tokens: 800,
      }),
    });

    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    const parsed = JSON.parse(data.choices[0]?.message?.content || '[]');
    return Array.isArray(parsed) ? parsed : defaultSuggestions(currencyCode);
  } catch {
    return defaultSuggestions(currencyCode);
  }
}
