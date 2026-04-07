import React, { useContext, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
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
  buildCategoryBreakdown,
  buildMonthlyCashflowSeries,
  buildPaymentMethodBreakdown,
  getDateRangeStart,
  RangePreset,
  sumTransactions,
} from '../lib/financeInsights';
import { PAYMENT_METHODS } from '../constants';
import { Icons } from './Icons';
import { InvestCard, MetricPill, ProgressBar, SectionTitle } from './investment/InvestUI';

const periods: Array<{ id: RangePreset; label: string }> = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: '3months', label: '3 Months' },
  { id: 'year', label: 'Year' },
];

export const Reports: React.FC = () => {
  const { transactions, categories, formatCurrency, currency } = useContext(AppContext)!;
  const [period, setPeriod] = useState<RangePreset>('month');

  const rangeStart = useMemo(() => getDateRangeStart(period), [period]);
  const filtered = useMemo(
    () => transactions.filter((transaction) => transaction.date >= rangeStart),
    [rangeStart, transactions]
  );
  const income = useMemo(() => sumTransactions(filtered, 'income'), [filtered]);
  const expenses = useMemo(() => sumTransactions(filtered, 'expense'), [filtered]);
  const net = income - expenses;
  const savingsRate = income > 0 ? (net / income) * 100 : 0;
  const categoryData = useMemo(() => buildCategoryBreakdown(filtered, categories), [categories, filtered]);
  const paymentMethodData = useMemo(
    () => buildPaymentMethodBreakdown(filtered, PAYMENT_METHODS),
    [filtered]
  );
  const comparisonData = useMemo(() => buildMonthlyCashflowSeries(transactions, 6), [transactions]);
  const topCategory = categoryData[0];
  const averageMonthlyExpense =
    comparisonData.length > 0
      ? comparisonData.reduce((sum, item) => sum + item.expense, 0) / comparisonData.length
      : 0;

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Currency', 'Description', 'Payment Method'];
    const rows = transactions.map((transaction) => {
      const category = categories.find((item) => item.id === transaction.category);
      const paymentMethod = PAYMENT_METHODS.find((item) => item.id === transaction.paymentMethod);
      return [
        new Date(transaction.date).toLocaleDateString(),
        transaction.type,
        category?.name || transaction.category,
        transaction.amount,
        currency.code,
        `"${transaction.description || ''}"`,
        paymentMethod?.name || transaction.paymentMethod,
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `spendwise-export-${new Date().toISOString().split('T')[0]}.csv`;
    anchor.click();
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Performance readout</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
        </div>
        <button
          type="button"
          onClick={exportCSV}
          className="rounded-xl border border-gray-200 bg-white p-2 text-gray-600 shadow-lg hover:text-gray-900 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-gray-400 dark:hover:text-white"
        >
          <Icons.Download />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {periods.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => setPeriod(item.id)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all border ${
              period === item.id
                ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                : 'bg-white dark:bg-zinc-900/60 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricPill label="Income" value={formatCurrency(income)} tone="positive" />
        <MetricPill label="Expenses" value={formatCurrency(expenses)} tone="negative" />
        <MetricPill label="Net" value={formatCurrency(net)} tone={net >= 0 ? 'positive' : 'negative'} />
        <MetricPill label="Savings Rate" value={`${savingsRate.toFixed(1)}%`} tone={savingsRate >= 20 ? 'positive' : savingsRate >= 0 ? 'warning' : 'negative'} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.6fr_0.4fr]">
        <InvestCard className="p-5">
          <SectionTitle
            eyebrow="Comparison"
            title="6-Month Cashflow"
            description="Income and expense trends over the latest six monthly closes."
          />
          <div className="h-72 mt-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </InvestCard>

        <InvestCard className="p-5">
          <SectionTitle
            eyebrow="Summary"
            title="Expense Drivers"
            description={topCategory ? `${topCategory.name} is leading spend for the selected period.` : 'Add expenses to build a useful breakdown.'}
          />
          <div className="mt-5 grid grid-cols-1 items-center gap-4 md:grid-cols-[0.46fr_0.54fr]">
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
                <div className="h-full rounded-3xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  No data
                </div>
              )}
            </div>
            <div className="space-y-3">
              <MetricPill label="Top Category" value={topCategory ? topCategory.name : 'No data'} tone="warning" />
              <MetricPill label="Top Spend" value={topCategory ? formatCurrency(topCategory.value) : 'No data'} />
              <MetricPill label="Avg / Month" value={formatCurrency(averageMonthlyExpense)} />
            </div>
          </div>
        </InvestCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.58fr_0.42fr]">
        <InvestCard className="p-5">
          <SectionTitle
            eyebrow="Details"
            title="Category Contribution"
            description="The biggest buckets by amount and share of expense."
          />
          <div className="space-y-4 mt-5">
            {categoryData.map((item) => (
              <div key={item.id} className="rounded-2xl border border-gray-200 dark:border-zinc-800 p-4 bg-gray-50 dark:bg-zinc-950/40">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-xl" style={{ backgroundColor: `${item.color}18` }}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(item.value)}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {item.percentage.toFixed(0)}%
                  </span>
                </div>
                <ProgressBar value={item.percentage} tone="blue" />
              </div>
            ))}
            {categoryData.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-6">
                No expense categories in the selected period.
              </p>
            )}
          </div>
        </InvestCard>

        <div className="space-y-4">
          <InvestCard className="p-5">
            <SectionTitle eyebrow="Payment" title="Method Distribution" />
            <div className="space-y-3 mt-5">
              {paymentMethodData.slice(0, 5).map((item) => (
                <div key={item.id} className="rounded-2xl border border-gray-200 dark:border-zinc-800 p-4 bg-gray-50 dark:bg-zinc-950/40">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.icon} {item.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.count} txns</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{formatCurrency(item.value)}</p>
                </div>
              ))}
              {paymentMethodData.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No payment method data yet.</p>
              )}
            </div>
          </InvestCard>

          <InvestCard className="p-5">
            <SectionTitle eyebrow="Readout" title="Quick Insights" />
            <div className="space-y-3 mt-5">
              {topCategory && (
                <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 p-4 bg-blue-50 dark:bg-blue-500/10">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <span className="font-semibold">{topCategory.name}</span> accounts for {topCategory.percentage.toFixed(0)}% of expense.
                  </p>
                </div>
              )}
              <div className={`rounded-2xl border p-4 ${net >= 0 ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10' : 'border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10'}`}>
                <p className={`text-sm ${net >= 0 ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'}`}>
                  {net >= 0
                    ? `You are positive by ${formatCurrency(net)} in the selected period.`
                    : `You are negative by ${formatCurrency(Math.abs(net))} in the selected period.`}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 p-4 bg-gray-50 dark:bg-zinc-950/40">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Average monthly expense over the last six closes is <span className="font-semibold">{formatCurrency(averageMonthlyExpense)}</span>.
                </p>
              </div>
            </div>
          </InvestCard>
        </div>
      </div>
    </div>
  );
};
