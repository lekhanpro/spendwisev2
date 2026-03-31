
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
    <div className="space-y-4 animate-slide-up">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"><Icons.Search /></span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transactions..."
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {['all', 'expense', 'income'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all border ${filter === f
              ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20'
              : 'bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-zinc-700'}`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div className="h-8 w-px bg-gray-200 dark:bg-zinc-800 mx-1 flex-shrink-0" />
        {[['week', 'Week'], ['month', 'Month'], ['3months', '3 Months']].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setDateRange(value)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all border ${dateRange === value
              ? 'bg-gray-900 dark:bg-white text-white dark:text-black border-gray-900 dark:border-white'
              : 'bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-zinc-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([date, txns]) => (
          <div key={date}>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-500 mb-2 ml-1">{date}</p>
            <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-gray-200 dark:border-zinc-800 shadow-lg rounded-2xl divide-y divide-gray-200 dark:divide-zinc-800">
              {(txns as typeof transactions).map(t => {
                const cat = categories.find(c => c.id === t.category);
                const pm = PAYMENT_METHODS.find(p => p.id === t.paymentMethod);
                return (
                  <div key={t.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border-2 border-gray-200 dark:border-zinc-700" style={{ backgroundColor: (cat?.color || '#ccc') + '15' }}>
                      {cat?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{t.description || cat?.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 flex items-center gap-1">
                        {pm?.icon} {pm?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </p>
                      <div className="flex gap-1 justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditingTransaction(t); setShowTransactionModal(true); }}
                          className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          <Icons.Edit />
                        </button>
                        <button
                          onClick={() => deleteTransaction(t.id)}
                          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 text-gray-400 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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
            <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-gray-200 dark:border-zinc-800">
              <span className="text-2xl">📭</span>
            </div>
            <p className="text-gray-500">No transactions found</p>
            <button
              onClick={() => setShowTransactionModal(true)}
              className="mt-4 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300"
            >
              Add a new transaction
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
