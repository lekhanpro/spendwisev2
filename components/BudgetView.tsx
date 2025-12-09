
import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Icons } from './Icons';
import { Budget } from '../types';
import { BudgetForm } from './BudgetForm';
import { Modal } from './Modal';

export const BudgetView: React.FC = () => {
  const { budgets, transactions, categories, deleteBudget, addBudget, updateBudget, formatCurrency } = useContext(AppContext)!;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);

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

  const budgetsWithProgress = budgets.map(budget => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category && t.date >= monthStart && t.date <= monthEnd)
      .reduce((sum, t) => sum + t.amount, 0);
    const percentage = (spent / budget.limit) * 100;
    const remaining = budget.limit - spent;
    const cat = categories.find(c => c.id === budget.category);
    return { ...budget, spent, percentage, remaining, category: cat };
  });

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgetsWithProgress.reduce((sum, b) => sum + b.spent, 0);

  const handleSave = (b: Budget) => {
    if (editing) {
      updateBudget(b);
    } else {
      addBudget(b);
    }
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Budgets</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-colors"
        >
          <Icons.Plus /> Add
        </button>
      </div>

      {/* Summary Card - Glass Effect */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 shadow-md rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-400">Total Budget</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalBudget)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Spent</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalSpent)}</p>
          </div>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all ${totalSpent / totalBudget > 1 ? 'bg-red-500' : totalSpent / totalBudget > 0.8 ? 'bg-yellow-500' : 'bg-green-500'}`}
            style={{ width: `${Math.min(100, (totalSpent / totalBudget) * 100)}%` }}
          />
        </div>
        <p className="text-sm text-gray-400 mt-2">
          {formatCurrency(Math.max(0, totalBudget - totalSpent))} remaining this month
        </p>
      </div>

      {/* Budget List */}
      <div className="space-y-3">
        {budgetsWithProgress.map(budget => (
          <div key={budget.id} className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 shadow-md rounded-2xl p-4 hover:bg-white/5 transition-colors group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border border-zinc-700" style={{ backgroundColor: (budget.category?.color || '#ccc') + '15' }}>
                {budget.category?.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">{budget.category?.name}</p>
                <p className="text-sm text-gray-500 capitalize">{budget.period}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditing({
                      id: budget.id,
                      category: budget.category?.id || '',
                      limit: budget.limit,
                      period: budget.period,
                      startDate: budget.startDate,
                      notifications: budget.notifications
                    });
                    setShowForm(true);
                  }}
                  className="p-2 rounded-lg hover:bg-zinc-700 text-gray-400 hover:text-white transition-colors"
                >
                  <Icons.Edit />
                </button>
                <button
                  onClick={() => deleteBudget(budget.id)}
                  className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Icons.Trash />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-300">{formatCurrency(budget.spent)} of {formatCurrency(budget.limit)}</span>
              <span className={`font-medium ${budget.percentage > 100 ? 'text-red-400' : budget.percentage > 80 ? 'text-yellow-400' : 'text-green-400'}`}>
                {budget.percentage.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all ${budget.percentage > 100 ? 'bg-red-500' : budget.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(100, budget.percentage)}%` }}
              />
            </div>
            <p className={`text-sm mt-2 ${budget.remaining < 0 ? 'text-red-400' : 'text-gray-400'}`}>
              {budget.remaining < 0 ? `${formatCurrency(Math.abs(budget.remaining))} over budget` : `${formatCurrency(budget.remaining)} left`}
            </p>
          </div>
        ))}
        {budgets.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-gray-500">No budgets set</p>
            <button onClick={() => setShowForm(true)} className="mt-4 text-blue-400 font-medium hover:text-blue-300">Create your first budget</button>
          </div>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Budget' : 'New Budget'}>
        <BudgetForm
          budget={editing}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  );
};
