
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
  const { categories, currency } = useContext(AppContext)!;
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
  const currencySymbol = currency?.symbol || '$';

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
      {/* Type Selector - Enhanced */}
      <div className="flex gap-3 p-2 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-zinc-800/50 dark:to-zinc-800/30 rounded-2xl border-2 border-gray-200 dark:border-zinc-700/50 shadow-inner">
        {['expense', 'income'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFormData({ ...formData, type: type as TransactionType, category: type === 'expense' ? 'food' : 'salary' })}
            className={`flex-1 py-3.5 rounded-xl font-bold text-base transition-all duration-200 ${formData.type === type
              ? type === 'expense' 
                ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white shadow-xl shadow-red-500/40 scale-105' 
                : 'bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white shadow-xl shadow-green-500/40 scale-105'
              : 'text-gray-500 dark:text-gray-500 hover:bg-white/80 dark:hover:bg-zinc-700/50 hover:text-gray-900 dark:hover:text-white hover:scale-105'}`}
          >
            <span className="text-xl mr-2">{type === 'expense' ? '💸' : '💰'}</span>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Amount Input - Enhanced */}
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <span className="text-lg">💵</span>
          Amount
        </label>
        <div className="relative group">
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors">
            {currencySymbol}
          </span>
          <input
            type="number"
            step="0.01"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            className="w-full pl-16 pr-6 py-5 text-4xl font-black bg-gradient-to-br from-gray-50 to-white dark:from-zinc-800/50 dark:to-zinc-800/30 border-2 border-gray-300 dark:border-zinc-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-inner"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      {/* Category Grid - Enhanced */}
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <span className="text-lg">📁</span>
          Category
        </label>
        <div className="grid grid-cols-4 gap-3">
          {filteredCategories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFormData({ ...formData, category: cat.id })}
              className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all duration-200 border-2 ${formData.category === cat.id
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 border-blue-600 dark:border-blue-500 ring-4 ring-blue-500/30 scale-110 shadow-xl shadow-blue-500/30'
                : 'bg-white dark:bg-zinc-800/40 border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600 hover:scale-105 shadow-md'}`}
            >
              <span className="text-3xl drop-shadow-lg">{cat.icon}</span>
              <span className={`text-xs font-bold truncate w-full text-center ${formData.category === cat.id ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                {cat.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Method - Enhanced */}
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <span className="text-lg">💳</span>
          Payment Method
        </label>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {PAYMENT_METHODS.map(pm => (
            <button
              key={pm.id}
              type="button"
              onClick={() => setFormData({ ...formData, paymentMethod: pm.id })}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-xl whitespace-nowrap transition-all duration-200 border-2 font-semibold shadow-md ${formData.paymentMethod === pm.id
                ? 'bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 border-purple-600 dark:border-purple-500 text-white shadow-purple-500/30 scale-105'
                : 'bg-white dark:bg-zinc-800/40 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600 hover:scale-105'}`}
            >
              <span className="text-xl">{pm.icon}</span>
              <span className="text-sm">{pm.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date Input - Enhanced */}
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <span className="text-lg">📅</span>
          Date
        </label>
        <input
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          className="w-full px-5 py-4 bg-white dark:bg-zinc-800/40 border-2 border-gray-300 dark:border-zinc-700 rounded-2xl text-gray-900 dark:text-white font-medium outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-md [color-scheme:dark]"
        />
      </div>

      {/* Description - Enhanced */}
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <span className="text-lg">📝</span>
          Description <span className="text-xs font-normal text-gray-500">(Optional)</span>
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-5 py-4 bg-white dark:bg-zinc-800/40 border-2 border-gray-300 dark:border-zinc-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 font-medium outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-md"
          placeholder="Add a note..."
        />
      </div>

      {/* Action Buttons - Enhanced */}
      <div className="flex gap-4 pt-4">
        <button 
          type="button" 
          onClick={onCancel} 
          className="flex-1 py-4 rounded-2xl font-bold text-base bg-white dark:bg-zinc-800 border-2 border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 hover:border-gray-400 dark:hover:border-zinc-600 transition-all shadow-lg hover:scale-105 active:scale-95"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className={`flex-1 py-4 rounded-2xl font-bold text-base text-white transition-all shadow-xl hover:scale-105 active:scale-95 ${
            formData.type === 'expense' 
              ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 shadow-red-500/40' 
              : 'bg-gradient-to-br from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 shadow-green-500/40'
          }`}
        >
          {transaction ? '✓ Update' : '+ Add'} {formData.type === 'expense' ? 'Expense' : 'Income'}
        </button>
      </div>
    </form>
  );
};
