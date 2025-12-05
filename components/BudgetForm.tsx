import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Budget, Period } from '../types';
import { generateId } from '../constants';

interface BudgetFormProps {
  budget: Budget | null;
  onSave: (b: Budget) => void;
  onCancel: () => void;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({ budget, onSave, onCancel }) => {
  const { categories } = useContext(AppContext)!;
  const expenseCategories = categories.filter(c => c.type === 'expense');
  const [formData, setFormData] = useState<Partial<Budget>>(budget || {
    category: 'food',
    limit: 0,
    period: 'monthly',
    notifications: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.limit || formData.limit <= 0) return;
    onSave({
      ...(formData as Budget),
      id: budget?.id || generateId(),
      limit: Number(formData.limit),
      startDate: budget?.startDate || Date.now()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 dark:text-white outline-none"
        >
          {expenseCategories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Budget Limit</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
          <input
            type="number"
            step="0.01"
            value={formData.limit || ''}
            onChange={(e) => setFormData({ ...formData, limit: parseFloat(e.target.value) })}
            className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 dark:text-white outline-none"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Period</label>
        <div className="flex gap-2">
          {['weekly', 'monthly'].map(period => (
            <button
              key={period}
              type="button"
              onClick={() => setFormData({ ...formData, period: period as Period })}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${formData.period === period
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'}`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Enable Notifications</span>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, notifications: !formData.notifications })}
          className={`w-12 h-6 rounded-full transition-colors ${formData.notifications ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}
        >
          <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${formData.notifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200">
          Cancel
        </button>
        <button type="submit" className="flex-1 py-3 rounded-xl font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-lg">
          {budget ? 'Update' : 'Create'} Budget
        </button>
      </div>
    </form>
  );
};
