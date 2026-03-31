import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Icons } from './Icons';

const MS_IN_DAY = 24 * 60 * 60 * 1000;

function formatDate(ts: number) {
  try {
    return new Date(ts).toLocaleDateString();
  } catch {
    return '-';
  }
}

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: number;
  frequency: 'monthly' | 'weekly' | 'yearly';
  category: string;
}

export const Bills: React.FC = () => {
  const { transactions, formatCurrency } = useContext(AppContext)!;
  const [showAddBill, setShowAddBill] = useState(false);
  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem('spendwise-bills');
    return saved ? JSON.parse(saved) : [];
  });
  const [newBill, setNewBill] = useState<Partial<Bill>>({
    name: '',
    amount: 0,
    dueDate: Date.now(),
    frequency: 'monthly',
    category: 'bills'
  });

  const saveBills = (updatedBills: Bill[]) => {
    setBills(updatedBills);
    localStorage.setItem('spendwise-bills', JSON.stringify(updatedBills));
  };

  const handleAddBill = () => {
    if (!newBill.name || !newBill.amount) return;
    const bill: Bill = {
      id: Date.now().toString(),
      name: newBill.name,
      amount: newBill.amount,
      dueDate: newBill.dueDate || Date.now(),
      frequency: newBill.frequency || 'monthly',
      category: newBill.category || 'bills'
    };
    saveBills([...bills, bill]);
    setNewBill({ name: '', amount: 0, dueDate: Date.now(), frequency: 'monthly', category: 'bills' });
    setShowAddBill(false);
  };

  const handleDeleteBill = (id: string) => {
    saveBills(bills.filter(b => b.id !== id));
  };

  const recurring = useMemo(() => {
    // Group transactions by key (merchant/category/description)
    const groups: Record<string, number[]> = {};
    const amounts: Record<string, number[]> = {};

    transactions.forEach((t) => {
      const key = (t.description || t.category || 'Unknown').toLowerCase();
      if (!groups[key]) groups[key] = [];
      if (!amounts[key]) amounts[key] = [];
      groups[key].push(t.date);
      amounts[key].push(t.amount);
    });

    const results: Array<{
      name: string;
      count: number;
      avgAmount: number;
      lastDate: number;
      avgIntervalDays: number;
      nextDue: number;
    }> = [];

    Object.keys(groups).forEach((k) => {
      const dates = groups[k].slice().sort((a, b) => a - b);
      if (dates.length < 2) return;

      let totalInterval = 0;
      for (let i = 1; i < dates.length; i++) {
        totalInterval += (dates[i] - dates[i - 1]);
      }
      const avgIntervalMs = totalInterval / (dates.length - 1);
      const avgIntervalDays = Math.round(avgIntervalMs / MS_IN_DAY);
      const lastDate = dates[dates.length - 1];
      const nextDue = lastDate + avgIntervalMs;
      const avgAmount = Math.round((amounts[k].reduce((s, v) => s + v, 0) / amounts[k].length) * 100) / 100;

      results.push({ name: k, count: dates.length, avgAmount, lastDate, avgIntervalDays, nextDue });
    });

    results.sort((a, b) => a.nextDue - b.nextDue);
    return results;
  }, [transactions]);

  const now = Date.now();

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-2xl">📅</span> Bills & Reminders
        </h2>
        <button
          onClick={() => setShowAddBill(!showAddBill)}
          className="px-4 py-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg hover:scale-105 transition-all flex items-center gap-2"
        >
          <Icons.Plus /> Add Bill
        </button>
      </div>

      {/* Add Bill Form */}
      {showAddBill && (
        <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Add New Bill</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Bill name (e.g., Netflix, Rent)"
              value={newBill.name}
              onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Amount"
              value={newBill.amount || ''}
              onChange={(e) => setNewBill({ ...newBill, amount: parseFloat(e.target.value) })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={new Date(newBill.dueDate || Date.now()).toISOString().split('T')[0]}
              onChange={(e) => setNewBill({ ...newBill, dueDate: new Date(e.target.value).getTime() })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
            />
            <select
              value={newBill.frequency}
              onChange={(e) => setNewBill({ ...newBill, frequency: e.target.value as any })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddBill(false)}
                className="flex-1 py-3 bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBill}
                className="flex-1 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
              >
                Add Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Bills */}
      {bills.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Your Bills</h3>
          <div className="space-y-3">
            {bills.map((bill) => {
              const daysUntil = Math.round((bill.dueDate - now) / MS_IN_DAY);
              const isOverdue = daysUntil < 0;
              return (
                <div key={bill.id} className={`bg-white dark:bg-zinc-900/50 border-2 ${isOverdue ? 'border-red-500' : 'border-gray-200 dark:border-zinc-800'} rounded-2xl p-4 shadow-md`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white capitalize">{bill.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {bill.frequency.charAt(0).toUpperCase() + bill.frequency.slice(1)} • Due: {formatDate(bill.dueDate)}
                      </div>
                      <div className={`text-xs font-medium mt-1 ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                        {isOverdue ? `Overdue by ${Math.abs(daysUntil)} days` : `Due in ${daysUntil} days`}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-lg text-gray-900 dark:text-white">{formatCurrency(bill.amount)}</div>
                      </div>
                      <button
                        onClick={() => handleDeleteBill(bill.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Auto-detected Recurring */}
      {recurring.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Auto-Detected Recurring</h3>
          <div className="space-y-3">
            {recurring.map((r) => {
              const daysUntil = Math.round((r.nextDue - now) / MS_IN_DAY);
              return (
                <div key={r.name} className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white capitalize">{r.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Detected {r.count}× • ~{r.avgIntervalDays} day interval
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-white">{formatCurrency(r.avgAmount)}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Next: {formatDate(r.nextDue)} {daysUntil >= 0 ? `(${daysUntil}d)` : '(overdue)'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {bills.length === 0 && recurring.length === 0 && !showAddBill && (
        <div className="text-center py-12 bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-2xl">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">No bills added yet</p>
          <button
            onClick={() => setShowAddBill(true)}
            className="px-6 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:scale-105 transition-all"
          >
            Add Your First Bill
          </button>
        </div>
      )}
    </div>
  );
};

export default Bills;
