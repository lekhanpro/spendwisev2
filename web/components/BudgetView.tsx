import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Budget } from '../types';
import { buildBudgetInsights, buildCategoryBreakdown, getMonthRange } from '../lib/financeInsights';
import { Icons } from './Icons';
import { BudgetForm } from './BudgetForm';
import { Modal } from './Modal';
import { InvestCard, MetricPill, ProgressBar, SectionTitle } from './investment/InvestUI';

export const BudgetView: React.FC = () => {
  const { budgets, transactions, categories, deleteBudget, addBudget, updateBudget, formatCurrency } = useContext(AppContext)!;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);

  const { start: monthStart, end: monthEnd } = useMemo(() => getMonthRange(), []);
  const budgetInsights = useMemo(
    () => buildBudgetInsights(budgets, transactions, categories, monthStart, monthEnd),
    [budgets, categories, monthEnd, monthStart, transactions]
  );
  const monthExpenses = useMemo(
    () => transactions.filter((transaction) => transaction.type === 'expense' && transaction.date >= monthStart && transaction.date <= monthEnd),
    [monthEnd, monthStart, transactions]
  );
  const totalBudget = budgetInsights.reduce((sum, item) => sum + item.limit, 0);
  const totalSpent = budgetInsights.reduce((sum, item) => sum + item.spent, 0);
  const totalForecast = budgetInsights.reduce((sum, item) => sum + item.forecast, 0);
  const remaining = totalBudget - totalSpent;
  const atRiskCount = budgetInsights.filter((item) => item.status === 'watch').length;
  const overCount = budgetInsights.filter((item) => item.status === 'over').length;
  const onTrackCount = budgetInsights.filter((item) => item.status === 'on-track').length;
  const budgetedCategoryIds = new Set(budgets.map((budget) => budget.category));
  const uncoveredSpend = buildCategoryBreakdown(
    monthExpenses.filter((transaction) => !budgetedCategoryIds.has(transaction.category)),
    categories
  );

  const handleSave = (budget: Budget) => {
    if (editing) {
      updateBudget(budget);
    } else {
      addBudget(budget);
    }
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Monthly controls</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h1>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2 font-medium text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-600 sm:w-auto"
        >
          <Icons.Plus /> Add
        </button>
      </div>

      <InvestCard className="overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 dark:from-zinc-900 dark:via-emerald-950 dark:to-cyan-950 p-6 text-white relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%)]" />
          <div className="relative z-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.2em] text-white/75">Budget Control</p>
                <h2 className="mt-2 break-words text-3xl font-bold sm:text-4xl">{formatCurrency(totalBudget)}</h2>
                <p className="text-white/85 mt-3">
                  {formatCurrency(totalSpent)} already spent with a month-end pace projecting {formatCurrency(totalForecast)}.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <MetricPill label="Remaining" value={formatCurrency(remaining)} tone={remaining >= 0 ? 'positive' : 'negative'} />
                <MetricPill label="Forecast Gap" value={formatCurrency(totalBudget - totalForecast)} tone={totalForecast > totalBudget ? 'negative' : 'positive'} />
                <MetricPill label="At Risk" value={`${atRiskCount + overCount}`} tone={atRiskCount + overCount > 0 ? 'warning' : 'positive'} />
                <MetricPill label="On Track" value={`${onTrackCount}`} tone="positive" />
              </div>
            </div>
          </div>
        </div>
      </InvestCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricPill label="Active Budgets" value={`${budgets.length}`} />
        <MetricPill label="Spent" value={formatCurrency(totalSpent)} tone="negative" />
        <MetricPill label="Projected" value={formatCurrency(totalForecast)} tone={totalForecast > totalBudget ? 'warning' : 'neutral'} />
        <MetricPill label="Unbudgeted" value={formatCurrency(uncoveredSpend.reduce((sum, item) => sum + item.value, 0))} tone="warning" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.68fr_0.32fr]">
        <InvestCard className="p-5">
          <SectionTitle
            eyebrow="Allocation"
            title="Budget Lines"
            description="Each category shows current spend, remaining room, and end-of-month forecast."
          />
          <div className="space-y-4 mt-5">
            {budgetInsights.map((item) => (
              <div key={item.id} className="rounded-3xl border border-gray-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900/60">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-12 h-12 rounded-2xl border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${item.color}18` }}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(item.spent)} of {formatCurrency(item.limit)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 self-start shrink-0 sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        const base = budgets.find((budget) => budget.id === item.id);
                        if (!base) return;
                        setEditing(base);
                        setShowForm(true);
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <Icons.Edit />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteBudget(item.id)}
                      className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <MetricPill label="Remaining" value={formatCurrency(item.remaining)} tone={item.remaining >= 0 ? 'positive' : 'negative'} />
                  <MetricPill
                    label="Forecast"
                    value={formatCurrency(item.forecast)}
                    tone={item.status === 'over' ? 'negative' : item.status === 'watch' ? 'warning' : 'neutral'}
                  />
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Spent</span>
                    <span className={`font-semibold ${item.status === 'over' ? 'text-red-500' : item.status === 'watch' ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {item.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <ProgressBar value={Math.min(100, item.percentage)} tone={item.status === 'over' ? 'red' : item.status === 'watch' ? 'amber' : 'emerald'} />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    Forecast utilization: {item.forecastPercentage.toFixed(0)}%
                  </p>
                </div>
              </div>
            ))}
            {budgetInsights.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-zinc-800">
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400">No budgets set yet.</p>
                <button type="button" onClick={() => setShowForm(true)} className="mt-4 text-blue-600 dark:text-blue-400 font-medium">
                  Create your first budget
                </button>
              </div>
            )}
          </div>
        </InvestCard>

        <div className="space-y-4">
          <InvestCard className="p-5">
            <SectionTitle eyebrow="Pressure" title="Status Mix" />
            <div className="grid grid-cols-1 gap-3 mt-5">
              <MetricPill label="Over Limit" value={`${overCount}`} tone={overCount > 0 ? 'negative' : 'neutral'} />
              <MetricPill label="Close To Limit" value={`${atRiskCount}`} tone={atRiskCount > 0 ? 'warning' : 'neutral'} />
              <MetricPill label="Healthy" value={`${onTrackCount}`} tone="positive" />
            </div>
          </InvestCard>

          <InvestCard className="p-5">
            <SectionTitle
              eyebrow="Blind Spots"
              title="Unbudgeted Spend"
              description="Expense categories with activity this month but no budget line."
            />
            <div className="space-y-3 mt-5">
              {uncoveredSpend.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-2xl border border-gray-200 dark:border-zinc-800 p-3 bg-gray-50 dark:bg-zinc-950/40">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.icon} {item.name}
                    </p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {formatCurrency(item.value)}
                    </p>
                  </div>
                </div>
              ))}
              {uncoveredSpend.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  All spending categories with activity this month already have a budget line.
                </p>
              )}
            </div>
          </InvestCard>
        </div>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Budget' : 'New Budget'}>
        <BudgetForm budget={editing} onSave={handleSave} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  );
};
