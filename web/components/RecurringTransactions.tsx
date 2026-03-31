import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Icons } from './Icons';
import { generateId } from '../constants';

interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDue: number;
  autoAdd: boolean;
  reminderDays: number;
}

export const RecurringTransactions: React.FC = () => {
  const { categories, formatCurrency, addTransaction } = useContext(AppContext)!;
  const [recurring, setRecurring] = useState<RecurringTransaction[]>(() => {
    const saved = localStorage.getItem('recurringTransactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RecurringTransaction | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    amount: 0,
    category: 'bills',
    frequency: 'monthly' as const,
    nextDue: Date.now(),
    autoAdd: true,
    reminderDays: 3
  });

  const saveRecurring = (data: RecurringTransaction[]) => {
    setRecurring(data);
    localStorage.setItem('recurringTransactions', JSON.stringify(data));
  };

  const handleSave = () => {
    const newItem: RecurringTransaction = {
      id: editing?.id || generateId(),
      ...formData
    };

    if (editing) {
      saveRecurring(recurring.map(r => r.id === editing.id ? newItem : r));
    } else {
      saveRecurring([...recurring, newItem]);
    }

    setShowForm(false);
    setEditing(null);
    setFormData({
      name: '',
      amount: 0,
      category: 'bills',
      frequency: 'monthly',
      nextDue: Date.now(),
      autoAdd: true,
      reminderDays: 3
    });
  };

  const handleDelete = (id: string) => {
    saveRecurring(recurring.filter(r => r.id !== id));
  };

  const handlePayNow = (item: RecurringTransaction) => {
    addTransaction({
      id: generateId(),
      type: 'expense',
      amount: item.amount,
      category: item.category,
      paymentMethod: 'bank',
      date: Date.now(),
      description: item.name,
      tags: ['recurring']
    });

    // Update next due date
    const nextDue = getNextDueDate(item.nextDue, item.frequency);
    saveRecurring(recurring.map(r => r.id === item.id ? { ...r, nextDue } : r));
    alert('Transaction added!');
  };

  const getNextDueDate = (current: number, frequency: string) => {
    const date = new Date(current);
    switch (frequency) {
      case 'daily': date.setDate(date.getDate() + 1); break;
      case 'weekly': date.setDate(date.getDate() + 7); break;
      case 'monthly': date.setMonth(date.getMonth() + 1); break;
      case 'yearly': date.setFullYear(date.getFullYear() + 1); break;
    }
    return date.getTime();
  };

  const getDaysUntilDue = (dueDate: number) => {
    return Math.ceil((dueDate - Date.now()) / 86400000);
  };

  const upcomingItems = recurring
    .filter(r => getDaysUntilDue(r.nextDue) <= r.reminderDays)
    .sort((a, b) => a.nextDue - b.nextDue);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">🔄 Recurring Transactions</h2>
        <button
          onClick={() => { setEditing(null); setShowForm(!showForm); }}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600"
        >
          {showForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {/* Upcoming Payments Alert */}
      {upcomingItems.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <p className="text-sm font-semibold text-yellow-300 mb-2">⚠️ Upcoming Payments</p>
          {upcomingItems.map(item => (
            <div key={item.id} className="flex items-center justify-between text-sm text-yellow-200 mb-1">
              <span>{item.name}</span>
              <span>{getDaysUntilDue(item.nextDue)} days</span>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 space-y-3">
          <input
            type="text"
            placeholder="Name (e.g., Netflix Subscription)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
          />
          <input
            type="number"
            placeholder="Amount"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
          />
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
          >
            {categories.filter(c => c.type === 'expense').map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
          <select
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <input
            type="date"
            value={new Date(formData.nextDue).toISOString().split('T')[0]}
            onChange={(e) => setFormData({ ...formData, nextDue: new Date(e.target.value).getTime() })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.autoAdd}
              onChange={(e) => setFormData({ ...formData, autoAdd: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-sm text-gray-300">Auto-add transaction on due date</label>
          </div>
          <button
            onClick={handleSave}
            className="w-full py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
          >
            {editing ? 'Update' : 'Add'} Recurring Transaction
          </button>
        </div>
      )}

      {/* Recurring List */}
      <div className="space-y-3">
        {recurring.map(item => {
          const cat = categories.find(c => c.id === item.category);
          const daysUntil = getDaysUntilDue(item.nextDue);
          const isOverdue = daysUntil < 0;
          const isDueSoon = daysUntil <= item.reminderDays && daysUntil >= 0;

          return (
            <div key={item.id} className={`bg-zinc-900/50 backdrop-blur-md border rounded-2xl p-4 ${isOverdue ? 'border-red-500/50' : isDueSoon ? 'border-yellow-500/50' : 'border-zinc-800'}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border border-zinc-700" style={{ backgroundColor: cat?.color + '15' }}>
                    {cat?.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-sm text-gray-400 capitalize">{item.frequency}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{formatCurrency(item.amount)}</p>
                  <p className={`text-xs ${isOverdue ? 'text-red-400' : isDueSoon ? 'text-yellow-400' : 'text-gray-500'}`}>
                    {isOverdue ? `${Math.abs(daysUntil)} days overdue` : `Due in ${daysUntil} days`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePayNow(item)}
                  className="flex-1 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg text-sm hover:bg-green-500/30"
                >
                  Pay Now
                </button>
                <button
                  onClick={() => { setEditing(item); setFormData(item); setShowForm(true); }}
                  className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-gray-300 rounded-lg text-sm hover:bg-zinc-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm hover:bg-red-500/30"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
        {recurring.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No recurring transactions yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-blue-400 font-medium hover:text-blue-300"
            >
              Add your first recurring transaction
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
