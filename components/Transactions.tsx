
import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Icons } from './Icons';
import { PAYMENT_METHODS } from '../constants';

export const Transactions: React.FC = () => {
  const { transactions, categories, deleteTransaction, setEditingTransaction, setShowTransactionModal, formatCurrency } = useContext(AppContext)!;
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('month');

  const getMonthStart = () => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'week': return now.getTime() - 7 * 86400000;
      case 'month': return getMonthStart();
      case '3months': return now.getTime() - 90 * 86400000;
      default: return 0;
    }
  };

  const filteredTransactions = transactions
    .filter(t => {
      if (filter !== 'all' && t.type !== filter) return false;
      if (t.date < getDateRange()) return false;
      if (search) {
        const cat = categories.find(c => c.id === t.category);
        const searchLower = search.toLowerCase();
        return (t.description?.toLowerCase().includes(searchLower)) ||
               (cat?.name.toLowerCase().includes(searchLower));
      }
      return true;
    })
    .sort((a, b) => b.date - a.date);

  const grouped = filteredTransactions.reduce((acc, t) => {
    const date = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(t);
    return acc;
  }, {} as Record<string, typeof transactions>);

  return (
    <div className="p-4 pb-24 space-y-4 animate-slide-up">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Transactions</h1>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transactions..."
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 rounded-xl border-0 shadow-sm focus:ring-2 focus:ring-blue-500 dark:text-white outline-none"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {['all', 'expense', 'income'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${filter === f
              ? 'bg-blue-500 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm'}`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 flex-shrink-0" />
        {[['week', 'Week'], ['month', 'Month'], ['3months', '3 Months']].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setDateRange(value)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${dateRange === value
              ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([date, txns]) => (
          <div key={date}>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{date}</p>
            <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl divide-y divide-slate-100 dark:divide-slate-700">
              {(txns as typeof transactions).map(t => {
                const cat = categories.find(c => c.id === t.category);
                const pm = PAYMENT_METHODS.find(p => p.id === t.paymentMethod);
                return (
                  <div key={t.id} className="flex items-center gap-3 p-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: (cat?.color || '#ccc') + '20' }}>
                      {cat?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 dark:text-white truncate">{t.description || cat?.name}</p>
                      <p className="text-sm text-slate-400">{pm?.icon} {pm?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </p>
                      <div className="flex gap-1 justify-end mt-1">
                        <button
                          onClick={() => { setEditingTransaction(t); setShowTransactionModal(true); }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                        >
                          <Icons.Edit />
                        </button>
                        <button
                          onClick={() => deleteTransaction(t.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400"
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
        ))}
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-slate-500 dark:text-slate-400">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};
