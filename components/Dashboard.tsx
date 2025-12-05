import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Icons } from './Icons';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const Dashboard: React.FC = () => {
  const { transactions, budgets, goals, categories, setActiveView, setShowTransactionModal, formatCurrency } = useContext(AppContext)!;

  const getMonthStart = () => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  const getMonthEnd = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  };

  const monthStart = getMonthStart();
  const monthEnd = getMonthEnd();

  const monthlyTransactions = transactions.filter(t => t.date >= monthStart && t.date <= monthEnd);
  const totalIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;

  // Pie Chart Data
  const expensesByCategory = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(expensesByCategory).map(([catId, amount]) => {
    const value = amount as number;
    const cat = categories.find(c => c.id === catId);
    return { name: cat?.name || catId, value, color: cat?.color || '#64748b', id: catId };
  }).sort((a, b) => b.value - a.value);

  // Trend Chart Data (Last 7 Days)
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    const dayStart = date.getTime();
    const dayEnd = dayStart + 86400000 - 1;
    
    const dayExpenses = transactions
      .filter(t => t.type === 'expense' && t.date >= dayStart && t.date <= dayEnd)
      .reduce((sum, t) => sum + t.amount, 0);
      
    return {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      amount: dayExpenses
    };
  });

  const budgetAlerts = budgets.map(budget => {
    const spent = monthlyTransactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((sum, t) => sum + t.amount, 0);
    const percentage = (spent / budget.limit) * 100;
    const cat = categories.find(c => c.id === budget.category);
    return { ...budget, spent, percentage, category: cat };
  }).filter(b => b.percentage >= 80);

  return (
    <div className="p-4 pb-24 space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 dark:text-slate-400">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}!</p>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Your Finances</h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <p className="text-blue-100 text-sm font-medium">Current Balance</p>
        <p className="text-4xl font-bold mt-1">{formatCurrency(balance)}</p>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Icons.TrendUp />
            </div>
            <div>
              <p className="text-xs text-blue-100">Income</p>
              <p className="font-semibold">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Icons.TrendDown />
            </div>
            <div>
              <p className="text-xs text-blue-100">Expenses</p>
              <p className="font-semibold">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-100">Savings Rate</span>
            <span className="font-semibold">{savingsRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 mt-2">
            <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${Math.max(0, Math.min(100, savingsRate))}%` }} />
          </div>
        </div>
      </div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="space-y-2">
          {budgetAlerts.map(alert => (
            <div key={alert.id} className={`flex items-center gap-3 p-3 rounded-xl ${alert.percentage >= 100 ? 'bg-red-50 dark:bg-red-900/30' : 'bg-yellow-50 dark:bg-yellow-900/30'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${alert.percentage >= 100 ? 'bg-red-100 dark:bg-red-900' : 'bg-yellow-100 dark:bg-yellow-900'}`}>
                <Icons.AlertCircle />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${alert.percentage >= 100 ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
                  {alert.category?.name} budget {alert.percentage >= 100 ? 'exceeded!' : 'warning'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formatCurrency(alert.spent)} of {formatCurrency(alert.limit)} ({alert.percentage.toFixed(0)}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-2xl p-4 backdrop-blur-sm bg-opacity-70">
          <p className="text-sm text-slate-500 dark:text-slate-400">Transactions</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{monthlyTransactions.length}</p>
          <p className="text-xs text-slate-400 mt-1">This month</p>
        </div>
        <div className="bg-white dark:bg-slate-800 shadow-md rounded-2xl p-4 backdrop-blur-sm bg-opacity-70">
          <p className="text-sm text-slate-500 dark:text-slate-400">Active Budgets</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{budgets.length}</p>
          <p className="text-xs text-slate-400 mt-1">Categories tracked</p>
        </div>
      </div>

      {/* Spending by Category */}
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-2xl p-4">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Spending by Category</h3>
        <div className="flex items-center gap-4">
          <div className="w-32 h-32 relative flex-shrink-0">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-full">
                <p className="text-xs text-slate-400">No data</p>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2 overflow-hidden">
            {pieData.slice(0, 5).map(item => (
              <div key={item.id} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="flex-1 text-sm text-slate-600 dark:text-slate-300 truncate">{item.name}</span>
                <span className="text-sm font-medium text-slate-800 dark:text-white">{formatCurrency(item.value)}</span>
              </div>
            ))}
            {pieData.length === 0 && (
              <p className="text-sm text-slate-400">No expenses this month</p>
            )}
          </div>
        </div>
      </div>

      {/* Spending Trend */}
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-2xl p-4">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">7-Day Spending Trend</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 dark:text-white">Recent Transactions</h3>
          <button onClick={() => setActiveView('transactions')} className="text-sm text-blue-500 font-medium">See all</button>
        </div>
        <div className="space-y-3">
          {transactions.slice(0, 5).map(t => {
            const cat = categories.find(c => c.id === t.category);
            return (
              <div key={t.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: (cat?.color || '#ccc') + '20' }}>
                  {cat?.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 dark:text-white truncate">{t.description || cat?.name}</p>
                  <p className="text-xs text-slate-400">{new Date(t.date).toLocaleDateString()}</p>
                </div>
                <span className={`font-semibold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
              </div>
            );
          })}
          {transactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-400">No transactions yet</p>
              <button onClick={() => setShowTransactionModal(true)} className="mt-2 text-blue-500 font-medium">Add your first</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};