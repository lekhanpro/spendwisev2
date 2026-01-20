
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type Selector */}
      <div className="flex gap-3 p-1.5 bg-gray-100 dark:bg-zinc-800/50 rounded-2xl border border-gray-200 dark:border-zinc-700/50">
        {['expense', 'income'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFormData({ ...formData, type: type as TransactionType, category: type === 'expense' ? 'food' : 'salary' })}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${formData.type === type
              ? type === 'expense' 
                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30' 
                : 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30'
              : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-zinc-700/50 hover:text-gray-900 dark:hover:text-white'}`}
          >
            {type === 'expense' ? '💸 Expense' : '💰 Income'}
          </button>
        ))}
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Amount</label>
        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400 dark:text-gray-500">$</span>
          <input
            type="number"
            step="0.01"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            className="w-full pl-12 pr-5 py-4 text-3xl font-bold bg-gray-50 dark:bg-zinc-800/50 border-2 border-gray-200 dark:border-zinc-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      {/* Category Grid */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Category</label>
        <div className="grid grid-cols-4 gap-3">
          {filteredCategories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFormData({ ...formData, category: cat.id })}
              className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border-2 ${formData.category === cat.id
                ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/20 scale-105'
                : 'bg-gray-50 dark:bg-zinc-800/30 border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600 hover:scale-105'}`}
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className={`text-xs font-medium truncate w-full text-center ${formData.category === cat.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                {cat.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Payment Method</label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {PAYMENT_METHODS.map(pm => (
            <button
              key={pm.id}
              type="button"
              onClick={() => setFormData({ ...formData, paymentMethod: pm.id })}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl whitespace-nowrap transition-all border-2 font-medium ${formData.paymentMethod === pm.id
                ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400 shadow-md'
                : 'bg-gray-50 dark:bg-zinc-800/30 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600'}`}
            >
              <span className="text-lg">{pm.icon}</span>
              <span className="text-sm">{pm.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date</label>
        <input
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800/50 border-2 border-gray-200 dark:border-zinc-700 rounded-2xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all [color-scheme:dark]"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description (Optional)</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800/50 border-2 border-gray-200 dark:border-zinc-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="Add a note..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button 
          type="button" 
          onClick={onCancel} 
          className="flex-1 py-4 rounded-2xl font-semibold bg-gray-100 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 transition-all"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className={`flex-1 py-4 rounded-2xl font-semibold text-white transition-all shadow-lg ${
            formData.type === 'expense' 
              ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/30' 
              : 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-500/30'
          }`}
        >
          {transaction ? 'Update' : 'Add'} {formData.type === 'expense' ? 'Expense' : 'Income'}
        </button>
      </div>
    </form>
  );
};
