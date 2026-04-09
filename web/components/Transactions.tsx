import React, { useContext, useDeferredValue, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import {
  buildCategoryBreakdown,
  buildPaymentMethodBreakdown,
  getDateRangeStart,
  getLargestTransaction,
  groupTransactionsByDay,
  RangePreset,
  sumTransactions,
} from '../lib/financeInsights';
import { PAYMENT_METHODS } from '../constants';
import { Icons } from './Icons';
import { InvestCard, MetricPill, ProgressBar, SectionTitle } from './investment/InvestUI';

const rangeOptions: Array<{ id: RangePreset; label: string }> = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: '3months', label: '3 Months' },
  { id: 'year', label: 'Year' },
];

export const Transactions: React.FC = () => {
  const { transactions, categories, deleteTransaction, setEditingTransaction, setShowTransactionModal, formatCurrency } = useContext(AppContext)!;
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<RangePreset>('month');
  const deferredSearch = useDeferredValue(search);

  const rangeStart = useMemo(() => getDateRangeStart(dateRange), [dateRange]);
  const filteredTransactions = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return transactions
      .filter((transaction) => {
        if (typeFilter !== 'all' && transaction.type !== typeFilter) return false;
        if (categoryFilter !== 'all' && transaction.category !== categoryFilter) return false;
        if (transaction.date < rangeStart) return false;

        if (!query) return true;

        const category = categories.find((item) => item.id === transaction.category);
        return (
          transaction.description?.toLowerCase().includes(query) ||
          category?.name.toLowerCase().includes(query) ||
          transaction.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      })
      .sort((left, right) => right.date - left.date);
  }, [categories, categoryFilter, deferredSearch, rangeStart, transactions, typeFilter]);

  const groupedTransactions = useMemo(() => groupTransactionsByDay(filteredTransactions), [filteredTransactions]);
  const totalIncome = useMemo(() => sumTransactions(filteredTransactions, 'income'), [filteredTransactions]);
  const totalExpense = useMemo(() => sumTransactions(filteredTransactions, 'expense'), [filteredTransactions]);
  const netFlow = totalIncome - totalExpense;
  const averageTicket =
    filteredTransactions.length > 0
      ? filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0) / filteredTransactions.length
      : 0;
  const largestTransaction = useMemo(() => getLargestTransaction(filteredTransactions), [filteredTransactions]);
  const categoryBreakdown = useMemo(
    () => buildCategoryBreakdown(filteredTransactions, categories),
    [categories, filteredTransactions]
  );
  const paymentMethodBreakdown = useMemo(
    () => buildPaymentMethodBreakdown(filteredTransactions, PAYMENT_METHODS),
    [filteredTransactions]
  );

  const availableCategoryFilters = useMemo(() => {
    const ids = new Set(filteredTransactions.map((transaction) => transaction.category));
    return categories.filter((category) => ids.has(category.id));
  }, [categories, filteredTransactions]);

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Activity ledger</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        </div>
        <button
          type="button"
          onClick={() => setShowTransactionModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2 font-medium text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-600 sm:w-auto"
        >
          <Icons.Plus /> Add
        </button>
      </div>

      <InvestCard className="p-5">
        <SectionTitle
          eyebrow="Filters"
          title="Slice the ledger"
          description="Search by description or category, then focus by date, type, or expense bucket."
        />
        <div className="relative mt-5">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <Icons.Search />
          </span>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search transactions, categories, or tags"
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 mt-4">
          {(['all', 'expense', 'income'] as const).map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => setTypeFilter(value)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all border ${
                typeFilter === value
                  ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {value === 'all' ? 'All types' : value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
          <div className="h-8 w-px bg-gray-200 dark:bg-zinc-800 mx-1 flex-shrink-0" />
          {rangeOptions.map((option) => (
            <button
              type="button"
              key={option.id}
              onClick={() => setDateRange(option.id)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all border ${
                dateRange === option.id
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-black border-gray-900 dark:border-white'
                  : 'bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {availableCategoryFilters.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mt-4">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border ${
                categoryFilter === 'all'
                  ? 'bg-cyan-500 text-white border-cyan-500'
                  : 'bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              All categories
            </button>
            {availableCategoryFilters.slice(0, 8).map((category) => (
              <button
                type="button"
                key={category.id}
                onClick={() => setCategoryFilter(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border ${
                  categoryFilter === category.id
                    ? 'text-white border-transparent'
                    : 'bg-white dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400'
                }`}
                style={categoryFilter === category.id ? { backgroundColor: category.color } : undefined}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        )}
      </InvestCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricPill label="Inflow" value={formatCurrency(totalIncome)} tone="positive" />
        <MetricPill label="Outflow" value={formatCurrency(totalExpense)} tone="negative" />
        <MetricPill label="Net" value={formatCurrency(netFlow)} tone={netFlow >= 0 ? 'positive' : 'negative'} />
        <MetricPill label="Avg Ticket" value={formatCurrency(averageTicket)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.72fr_0.28fr]">
        <InvestCard className="p-5">
          <SectionTitle
            eyebrow="Ledger"
            title="Grouped Activity"
            description={`${filteredTransactions.length} transactions in the selected window.`}
          />
          <div className="space-y-4 mt-5">
            {groupedTransactions.map((bucket) => (
              <div key={bucket.id}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{bucket.label}</p>
                  <p className={`text-sm font-semibold ${bucket.net >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {bucket.net >= 0 ? '+' : ''}
                    {formatCurrency(bucket.net)}
                  </p>
                </div>
                <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 overflow-hidden divide-y divide-gray-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900/60">
                  {bucket.transactions.map((transaction) => {
                    const category = categories.find((item) => item.id === transaction.category);
                    const paymentMethod = PAYMENT_METHODS.find((item) => item.id === transaction.paymentMethod);

                    return (
                      <div key={transaction.id} className="p-4 transition-colors hover:bg-gray-50 dark:hover:bg-zinc-950/40">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gray-200 text-xl dark:border-zinc-700"
                              style={{ backgroundColor: `${category?.color || '#64748b'}18` }}
                            >
                              {category?.icon || '📦'}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-gray-900 dark:text-white">
                                {transaction.description || category?.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {category?.name} · {paymentMethod?.icon} {paymentMethod?.name}
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0 sm:text-right">
                            <p className={`font-semibold ${transaction.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                              {transaction.type === 'income' ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </p>
                            <div className="mt-2 flex gap-1 sm:justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingTransaction(transaction);
                                  setShowTransactionModal(true);
                                }}
                                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                              >
                                <Icons.Edit />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteTransaction(transaction.id)}
                                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              >
                                <Icons.Trash />
                              </button>
                            </div>
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
                <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-zinc-800">
                  <span className="text-2xl">📭</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400">No transactions found for the current filters.</p>
              </div>
            )}
          </div>
        </InvestCard>

        <div className="space-y-4">
          <InvestCard className="p-5">
            <SectionTitle eyebrow="Signal" title="Range Highlights" />
            <div className="grid grid-cols-1 gap-3 mt-5">
              <MetricPill
                label="Largest"
                value={largestTransaction ? formatCurrency(largestTransaction.amount) : 'No data'}
                tone={largestTransaction?.type === 'income' ? 'positive' : 'warning'}
              />
              <MetricPill
                label="Top Category"
                value={categoryBreakdown[0] ? categoryBreakdown[0].name : 'No data'}
                tone="warning"
              />
              <MetricPill
                label="Top Payment"
                value={paymentMethodBreakdown[0] ? paymentMethodBreakdown[0].name : 'No data'}
              />
            </div>
          </InvestCard>

          <InvestCard className="p-5">
            <SectionTitle eyebrow="Mix" title="Category Share" />
            <div className="space-y-3 mt-5">
              {categoryBreakdown.slice(0, 4).map((item) => (
                <div key={item.id}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate text-gray-900 dark:text-white">{item.icon} {item.name}</span>
                    <span className="text-gray-500 dark:text-gray-400">{item.percentage.toFixed(0)}%</span>
                  </div>
                  <ProgressBar value={item.percentage} tone="blue" />
                </div>
              ))}
              {categoryBreakdown.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No expense mix to show yet.</p>
              )}
            </div>
          </InvestCard>

          <InvestCard className="p-5">
            <SectionTitle eyebrow="Payment" title="Method Split" />
            <div className="space-y-3 mt-5">
              {paymentMethodBreakdown.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-2xl border border-gray-200 dark:border-zinc-800 p-3 bg-gray-50 dark:bg-zinc-950/40">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.icon} {item.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.count} txns</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{formatCurrency(item.value)}</p>
                </div>
              ))}
              {paymentMethodBreakdown.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No payment split to show yet.</p>
              )}
            </div>
          </InvestCard>
        </div>
      </div>
    </div>
  );
};
