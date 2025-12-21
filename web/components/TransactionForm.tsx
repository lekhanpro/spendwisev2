
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
      <div className="flex gap-2 p-1 bg-zinc-800 rounded-xl border border-zinc-700">
        {['expense', 'income'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFormData({ ...formData, type: type as TransactionType, category: type === 'expense' ? 'food' : 'salary' })}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${formData.type === type
              ? type === 'expense' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-green-500 text-white shadow-lg shadow-green-500/20'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-500">$</span>
          <input
            type="number"
            step="0.01"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            className="w-full pl-10 pr-4 py-3 text-2xl font-semibold bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
        <div className="grid grid-cols-4 gap-2">
          {filteredCategories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFormData({ ...formData, category: cat.id })}
              className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all border ${formData.category === cat.id
                ? 'bg-blue-500/20 border-blue-500/50 ring-1 ring-blue-500/50'
                : 'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600'}`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className={`text-xs truncate w-full text-center ${formData.category === cat.id ? 'text-blue-200' : 'text-gray-400'}`}>{cat.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Payment Method</label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {PAYMENT_METHODS.map(pm => (
            <button
              key={pm.id}
              type="button"
              onClick={() => setFormData({ ...formData, paymentMethod: pm.id })}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all border ${formData.paymentMethod === pm.id
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-200'
                : 'bg-zinc-800/50 border-zinc-700 text-gray-400 hover:bg-zinc-800 hover:text-white'}`}
            >
              <span>{pm.icon}</span>
              <span className="text-sm">{pm.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
        <input
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all [color-scheme:dark]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Description (Optional)</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          placeholder="Add a note..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-medium bg-zinc-800 border border-zinc-700 text-gray-300 hover:bg-zinc-700 hover:text-white transition-colors">
          Cancel
        </button>
        <button type="submit" className={`flex-1 py-3 rounded-xl font-medium text-white transition-colors shadow-lg ${formData.type === 'expense' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-green-500 hover:bg-green-600 shadow-green-500/20'}`}>
          {transaction ? 'Update' : 'Add'} {formData.type === 'expense' ? 'Expense' : 'Income'}
        </button>
      </div>
    </form>
  );
};
