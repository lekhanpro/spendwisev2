import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { generateId } from '../constants';
import { Budget, Period } from '../types';
import { CategoryCreator } from './CategoryCreator';

interface BudgetFormProps {
  budget: Budget | null;
  onSave: (budget: Budget) => void;
  onCancel: () => void;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({ budget, onSave, onCancel }) => {
  const { categories, currency } = useContext(AppContext)!;
  const expenseCategories = useMemo(() => categories.filter((category) => category.type === 'expense'), [categories]);
  const [formData, setFormData] = useState<Partial<Budget>>({
    category: expenseCategories[0]?.id ?? '',
    limit: 0,
    period: 'monthly',
    notifications: true,
  });

  useEffect(() => {
    if (budget) {
      setFormData(budget);
      return;
    }

    setFormData({
      category: expenseCategories[0]?.id ?? '',
      limit: 0,
      period: 'monthly',
      notifications: true,
    });
  }, [budget]);

  useEffect(() => {
    if (!expenseCategories.find((category) => category.id === formData.category)) {
      setFormData((current) => ({
        ...current,
        category: expenseCategories[0]?.id ?? '',
      }));
    }
  }, [expenseCategories, formData.category]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.limit || formData.limit <= 0 || !formData.category) {
      return;
    }

    onSave({
      ...(formData as Budget),
      id: budget?.id || generateId(),
      limit: Number(formData.limit),
      startDate: budget?.startDate || Date.now(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">Budget category</label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {expenseCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setFormData((current) => ({ ...current, category: category.id }))}
              className={`rounded-2xl border px-3 py-4 text-left transition-colors ${
                formData.category === category.id
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-500/10'
                  : 'border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl" style={{ backgroundColor: `${category.color}20` }}>
                  {category.icon}
                </div>
                <div className="min-w-0">
                  <p className="break-words font-medium text-gray-900 dark:text-white">{category.name}</p>
                  {category.isCustom && <p className="text-xs text-blue-600 dark:text-blue-400">Custom</p>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <CategoryCreator
        type="expense"
        title="Need another expense bucket?"
        description="Create a custom budget category and use it immediately."
        buttonLabel="New category"
        onCreated={(category) => setFormData((current) => ({ ...current, category: category.id }))}
      />

      <div>
        <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">Budget limit</label>
        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400 dark:text-gray-500">
            {currency.symbol}
          </span>
          <input
            type="number"
            step="0.01"
            value={formData.limit || ''}
            onChange={(event) => setFormData((current) => ({ ...current, limit: parseFloat(event.target.value) }))}
            className="w-full rounded-3xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-2xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-white"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">Budget period</label>
        <div className="grid grid-cols-2 gap-3">
          {(['weekly', 'monthly'] as Period[]).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setFormData((current) => ({ ...current, period }))}
              className={`rounded-2xl border px-4 py-3 font-medium transition-colors ${
                formData.period === period
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-300'
                  : 'border-gray-200 bg-white text-gray-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Notifications</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Keep this enabled if you want this budget to feed the panel-only alerts.</p>
          </div>
          <button
            type="button"
            onClick={() => setFormData((current) => ({ ...current, notifications: !current.notifications }))}
            className={`h-6 w-12 shrink-0 rounded-full transition-colors ${formData.notifications ? 'bg-blue-500' : 'bg-gray-300 dark:bg-zinc-700'}`}
          >
            <div className={`mt-0.5 h-5 w-5 rounded-full bg-white transition-transform ${formData.notifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 transition-colors hover:border-gray-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300 sm:w-auto sm:flex-1"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto sm:flex-1"
        >
          {budget ? 'Save budget' : 'Create budget'}
        </button>
      </div>
    </form>
  );
};
