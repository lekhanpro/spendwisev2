
import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Icons } from './Icons';
import { PAYMENT_METHODS } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const Reports: React.FC = () => {
  const { transactions, categories, formatCurrency, currency } = useContext(AppContext)!;
  const [period, setPeriod] = useState('month');

  const getMonthStart = (date = new Date()) => {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  const getMonthEnd = (date = new Date()) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  };

  const getDateRange = () => {
    const now = new Date();
    switch (period) {
      case 'week': return now.getTime() - 7 * 86400000;
      case 'month': return getMonthStart();
      case '3months': return now.getTime() - 90 * 86400000;
      case 'year': return now.getTime() - 365 * 86400000;
      default: return 0;
    }
  };

  const filtered = transactions.filter(t => t.date >= getDateRange());
  const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const expensesByCategory = filtered
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.entries(expensesByCategory)
    .map(([catId, amount]) => {
      const value = amount as number;
      const cat = categories.find(c => c.id === catId);
      return {
        name: cat?.name || catId,
        value,
        color: cat?.color || '#64748b',
        icon: cat?.icon || '📦',
        id: catId,
        percentage: (value / expenses) * 100
      };
    })
    .sort((a, b) => b.value - a.value);

  // Comparison Data
  const comparisonData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const start = getMonthStart(d);
    const end = getMonthEnd(d);
    const monthTxns = transactions.filter(t => t.date >= start && t.date <= end);
    return {
      name: d.toLocaleDateString('en-US', { month: 'short' }),
      Income: monthTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
      Expenses: monthTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    };
  });

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Currency', 'Description', 'Payment Method'];
    const rows = transactions.map(t => {
      const cat = categories.find(c => c.id === t.category);
      const pm = PAYMENT_METHODS.find(p => p.id === t.paymentMethod);
      return [
        new Date(t.date).toLocaleDateString(),
        t.type,
        cat?.name || t.category,
        t.amount,
        currency.code,
        `"${t.description || ''}"`,
        pm?.name || t.paymentMethod
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spendwise-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <button onClick={exportCSV} className="p-2 bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
          <Icons.Download />
        </button>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {[['week', 'Week'], ['month', 'Month'], ['3months', '3 Months'], ['year', 'Year']].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setPeriod(value)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all border ${period === value
              ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20'
              : 'bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-zinc-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-500/20 backdrop-blur-md border-2 border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-4 shadow-lg">
          <p className="text-sm text-emerald-700 dark:text-emerald-200/70">Total Income</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(income)}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-500/20 backdrop-blur-md border-2 border-red-200 dark:border-red-500/30 rounded-2xl p-4 shadow-lg">
          <p className="text-sm text-red-700 dark:text-red-200/70">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(expenses)}</p>
        </div>
      </div>

      {/* Spending Breakdown - Glass Card */}
      <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-gray-200 dark:border-zinc-800 shadow-lg rounded-2xl p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Spending Breakdown</h3>
        <div className="flex gap-4 items-center">
          <div className="w-40 h-40 flex-shrink-0">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={60} innerRadius={0} stroke="none">
                    {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-800 rounded-full border border-zinc-700">
                <p className="text-xs text-gray-500">No data</p>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            {categoryData.map(cat => (
              <div key={cat.id} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="flex-1 text-sm text-gray-300 truncate">{cat.name}</span>
                <span className="text-sm font-medium text-white">{cat.percentage.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Details - Glass Card */}
      <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-gray-200 dark:border-zinc-800 shadow-lg rounded-2xl p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Category Details</h3>
        <div className="space-y-3">
          {categoryData.map(cat => (
            <div key={cat.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border border-zinc-700" style={{ backgroundColor: cat.color + '15' }}>
                {cat.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-200">{cat.name}</span>
                  <span className="font-semibold text-white">{formatCurrency(cat.value)}</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div className="h-1.5 rounded-full" style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }} />
                </div>
              </div>
            </div>
          ))}
          {categoryData.length === 0 && (
            <p className="text-center text-gray-500 py-4">No expenses in this period</p>
          )}
        </div>
      </div>

      {/* Monthly Comparison - Glass Card */}
      <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-gray-200 dark:border-zinc-800 shadow-lg rounded-2xl p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">6-Month Comparison</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.9)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff' }}
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
              <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights - Glass Card */}
      <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-gray-200 dark:border-zinc-800 shadow-lg rounded-2xl p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">💡 Insights</h3>
        <div className="space-y-2">
          {categoryData[0] && (
            <p className="text-sm text-gray-300">
              <span className="font-medium text-white">{categoryData[0].name}</span> is your biggest expense category at {formatCurrency(categoryData[0].value)} ({categoryData[0].percentage.toFixed(0)}% of total).
            </p>
          )}
          {income > expenses && (
            <p className="text-sm text-green-400">
              Great job! You saved {formatCurrency(income - expenses)} this period.
            </p>
          )}
          {expenses > income && (
            <p className="text-sm text-red-400">
              Watch out! You spent {formatCurrency(expenses - income)} more than you earned.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};