import React, { useContext, useMemo } from 'react';
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AppContext } from '../context/AppContext';
import {
  buildBudgetInsights,
  buildCategoryBreakdown,
  buildDailyCashflowSeries,
  buildGoalInsights,
  getMonthRange,
  sumTransactions,
} from '../lib/financeInsights';
import { Icons } from './Icons';
import { InvestCard, MetricPill, ProgressBar, SectionTitle } from './investment/InvestUI';

export const Dashboard: React.FC = () => {
  const { transactions, budgets, goals, categories, setActiveView, setShowTransactionModal, formatCurrency } = useContext(AppContext)!;

  const { start: monthStart, end: monthEnd } = useMemo(() => getMonthRange(), []);
  const monthlyTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.date >= monthStart && transaction.date <= monthEnd),
    [monthEnd, monthStart, transactions]
  );

  const totalIncome = useMemo(() => sumTransactions(monthlyTransactions, 'income'), [monthlyTransactions]);
  const totalExpenses = useMemo(() => sumTransactions(monthlyTransactions, 'expense'), [monthlyTransactions]);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;
  const elapsedDays = Math.max(1, Math.ceil((Date.now() - monthStart) / (24 * 60 * 60 * 1000)));
  const daysLeft = Math.max(0, Math.ceil((monthEnd - Date.now()) / (24 * 60 * 60 * 1000)));
  const averageDailySpend = totalExpenses / elapsedDays;

  const categoryData = useMemo(
    () => buildCategoryBreakdown(monthlyTransactions, categories),
    [categories, monthlyTransactions]
  );
  const trendData = useMemo(() => buildDailyCashflowSeries(transactions, 14), [transactions]);
  const budgetInsights = useMemo(
    () => buildBudgetInsights(budgets, transactions, categories, monthStart, monthEnd),
    [budgets, categories, monthEnd, monthStart, transactions]
  );
  const goalInsights = useMemo(() => buildGoalInsights(goals), [goals]);
  const topCategory = categoryData[0];
  const atRiskBudgets = budgetInsights.filter((item) => item.status !== 'on-track');
  const fundedGoals = goalInsights.filter((item) => item.status === 'achieved').length;
  const activeGoals = goalInsights.filter((item) => item.status !== 'achieved');
  const recentTransactions = [...transactions].sort((left, right) => right.date - left.date).slice(0, 5);
  const totalBudget = budgetInsights.reduce((sum, item) => sum + item.limit, 0);
  const totalBudgetSpent = budgetInsights.reduce((sum, item) => sum + item.spent, 0);
  const budgetUsage = totalBudget > 0 ? (totalBudgetSpent / totalBudget) * 100 : 0;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-gray-500 dark:text-gray-400">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Home Overview</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-right">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      <InvestCard className="overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 dark:from-zinc-900 dark:via-blue-950 dark:to-cyan-900 p-6 text-white relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_36%)]" />
          <div className="relative z-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.2em] text-white/75">Cash Position</p>
                <h2 className="mt-2 break-words text-3xl font-bold sm:text-4xl">{formatCurrency(balance)}</h2>
                <p className="text-white/85 mt-3">
                  Month-to-date you brought in {formatCurrency(totalIncome)} and spent {formatCurrency(totalExpenses)}.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <MetricPill label="Savings Rate" value={`${savingsRate.toFixed(1)}%`} tone={savingsRate >= 20 ? 'positive' : savingsRate >= 0 ? 'warning' : 'negative'} />
                <MetricPill label="Avg / Day" value={formatCurrency(averageDailySpend)} tone="neutral" />
                <MetricPill label="Budget Used" value={`${budgetUsage.toFixed(0)}%`} tone={budgetUsage > 100 ? 'negative' : budgetUsage >= 80 ? 'warning' : 'positive'} />
                <MetricPill label="Days Left" value={`${daysLeft}`} tone="neutral" />
              </div>
            </div>
          </div>
        </div>
      </InvestCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricPill label="Transactions" value={`${monthlyTransactions.length}`} />
        <MetricPill label="At-Risk Budgets" value={`${atRiskBudgets.length}`} tone={atRiskBudgets.length > 0 ? 'warning' : 'positive'} />
        <MetricPill label="Goals Funded" value={`${fundedGoals}/${goals.length || 0}`} tone="positive" />
        <MetricPill label="Top Category" value={topCategory ? topCategory.name : 'No spend'} tone="warning" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <InvestCard className="p-5">
          <SectionTitle
            eyebrow="Flow"
            title="14-Day Cashflow"
            description="Track how income and spending have been moving over the last two weeks."
          />
          <div className="h-64 mt-5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="dashboardIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="dashboardExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#dashboardIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#dashboardExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </InvestCard>

        <InvestCard className="p-5">
          <SectionTitle
            eyebrow="Mix"
            title="Spend Composition"
            description={topCategory ? `${topCategory.name} is currently your largest expense bucket.` : 'Your category mix will appear once expenses are recorded.'}
          />
          <div className="grid gap-4 md:grid-cols-[0.44fr_0.56fr] mt-5 items-center">
            <div className="h-48">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData.slice(0, 5)} dataKey="value" innerRadius={42} outerRadius={72} stroke="none">
                      {categoryData.slice(0, 5).map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full rounded-3xl bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-zinc-800 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  No expense data
                </div>
              )}
            </div>
            <div className="space-y-3">
              {categoryData.slice(0, 4).map((item) => (
                <div key={item.id}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span>{item.icon}</span>
                      <span className="text-gray-900 dark:text-white truncate">{item.name}</span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">{item.percentage.toFixed(0)}%</span>
                  </div>
                  <ProgressBar value={item.percentage} tone="blue" />
                </div>
              ))}
            </div>
          </div>
        </InvestCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <InvestCard className="p-5">
          <SectionTitle
            eyebrow="Pressure"
            title="Budget Pulse"
            description="The categories closest to going over limit this month."
            action={
              <button
                type="button"
                onClick={() => setActiveView('budget')}
                className="text-sm font-medium text-blue-600 dark:text-blue-400"
              >
                Open budgets
              </button>
            }
          />
          <div className="space-y-4 mt-5">
            {budgetInsights.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-2xl border border-gray-200 dark:border-zinc-800 p-4 bg-gray-50 dark:bg-zinc-950/40">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-xl" style={{ backgroundColor: `${item.color}18` }}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(item.spent)} of {formatCurrency(item.limit)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${item.status === 'over' ? 'text-red-500' : item.status === 'watch' ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {item.percentage.toFixed(0)}%
                  </span>
                </div>
                <ProgressBar value={Math.min(100, item.percentage)} tone={item.status === 'over' ? 'red' : item.status === 'watch' ? 'amber' : 'emerald'} />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Forecast month-end spend: {formatCurrency(item.forecast)}
                </p>
              </div>
            ))}
            {budgetInsights.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 p-5 text-sm text-gray-500 dark:text-gray-400">
                Add category budgets to see pressure, pace, and forecasted overspend here.
              </div>
            )}
          </div>
        </InvestCard>

        <InvestCard className="p-5">
          <SectionTitle
            eyebrow="Future"
            title="Goals In Motion"
            description="The nearest targets and how much pressure they put on current cashflow."
            action={
              <button
                type="button"
                onClick={() => setActiveView('goals')}
                className="text-sm font-medium text-blue-600 dark:text-blue-400"
              >
                Open goals
              </button>
            }
          />
          <div className="space-y-4 mt-5">
            {activeGoals.slice(0, 3).map((goal) => (
              <div key={goal.id} className="rounded-2xl border border-gray-200 dark:border-zinc-800 p-4 bg-gray-50 dark:bg-zinc-950/40">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-words font-semibold text-gray-900 dark:text-white">{goal.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {goal.daysLeft > 0 ? `${goal.daysLeft} days left` : 'Past deadline'}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold ${goal.status === 'behind' || goal.status === 'overdue' ? 'text-red-500' : goal.status === 'watch' ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {goal.progress.toFixed(0)}%
                  </span>
                </div>
                <ProgressBar
                  value={Math.min(100, goal.progress)}
                  tone={goal.status === 'behind' || goal.status === 'overdue' ? 'red' : goal.status === 'watch' ? 'amber' : 'emerald'}
                />
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <MetricPill label="Saved" value={formatCurrency(goal.currentAmount)} />
                  <MetricPill label="Needed / Month" value={formatCurrency(goal.monthlyNeeded)} tone="warning" />
                </div>
              </div>
            ))}
            {goals.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 p-5 text-sm text-gray-500 dark:text-gray-400">
                Create savings goals to track runway, target pressure, and funding progress.
              </div>
            )}
          </div>
        </InvestCard>
      </div>

      <InvestCard className="p-5">
        <SectionTitle
          eyebrow="Recent"
          title="Latest Activity"
          description="Your newest transactions with category context and direction."
          action={
            <button
              type="button"
              onClick={() => setActiveView('transactions')}
              className="text-sm font-medium text-blue-600 dark:text-blue-400"
            >
              See all
            </button>
          }
        />
        <div className="space-y-3 mt-5">
          {recentTransactions.map((transaction) => {
            const category = categories.find((item) => item.id === transaction.category);
            return (
              <div key={transaction.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gray-200 text-xl dark:border-zinc-700" style={{ backgroundColor: `${category?.color || '#64748b'}18` }}>
                      {category?.icon || '📦'}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900 dark:text-white">{transaction.description || category?.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {category?.name} · {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`font-semibold sm:shrink-0 ${transaction.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              </div>
            );
          })}
          {recentTransactions.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">No transactions yet.</p>
              <button
                type="button"
                onClick={() => setShowTransactionModal(true)}
                className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400"
              >
                Add your first transaction
              </button>
            </div>
          )}
        </div>
      </InvestCard>
    </div>
  );
};
