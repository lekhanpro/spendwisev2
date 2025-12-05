import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Transaction, TransactionType } from '../types';
import { PAYMENT_METHODS, generateId } from '../constants';

interface TransactionFormProps {
  transaction: Transaction | null;
  onSave: (t: Transaction) => void;
  onCancel: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, onSave, onCancel }) => {
  const { categories } = useContext(AppContext)!;
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: 'expense',
    amount: 0,
    category: 'food',
    paymentMethod: 'cash',
    date: new Date().getTime(),
    description: '',
    tags: []
  });
  
  // Format date for input field
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (transaction) {
      setFormData(transaction);
      setDateInput(new Date(transaction.date).toISOString().split('T')[0]);
    }
  }, [transaction]);

  const filteredCategories = categories.filter(c => c.type === formData.type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) return;
    onSave({
      ...(formData as Transaction),
      id: transaction?.id || generateId(),
      amount: Number(formData.amount),
      date: new Date(dateInput).getTime()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-700 rounded-xl">
        {['expense', 'income'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFormData({ ...formData, type: type as TransactionType, category: type === 'expense' ? 'food' : 'salary' })}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${formData.type === type
              ? type === 'expense' ? 'bg-red-500 text-white shadow-md' : 'bg-green-500 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-600'}`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">$</span>
          <input
            type="number"
            step="0.01"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            className="w-full pl-10 pr-4 py-3 text-2xl font-semibold bg-slate-100 dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition-shadow"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
        <div className="grid grid-cols-4 gap-2">
          {filteredCategories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFormData({ ...formData, category: cat.id })}
              className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${formData.category === cat.id
                ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500'
                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs text-slate-600 dark:text-slate-300 truncate w-full text-center">{cat.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {PAYMENT_METHODS.map(pm => (
            <button
              key={pm.id}
              type="button"
              onClick={() => setFormData({ ...formData, paymentMethod: pm.id })}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${formData.paymentMethod === pm.id
                ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500'
                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
            >
              <span>{pm.icon}</span>
              <span className="text-sm text-slate-700 dark:text-slate-300">{pm.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
        <input
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 dark:text-white outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 dark:text-white outline-none"
          placeholder="Add a note..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
          Cancel
        </button>
        <button type="submit" className={`flex-1 py-3 rounded-xl font-medium text-white transition-colors shadow-lg ${formData.type === 'expense' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
          {transaction ? 'Update' : 'Add'} {formData.type === 'expense' ? 'Expense' : 'Income'}
        </button>
      </div>
    </form>
  );
};
