import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { PAYMENT_METHODS, generateId } from '../constants';
import { Transaction, TransactionType } from '../types';
import { CategoryCreator } from './CategoryCreator';

interface TransactionFormProps {
  transaction: Transaction | null;
  onSave: (transaction: Transaction) => void;
  onCancel: () => void;
}

const getDefaultCategory = (type: TransactionType, categoryIds: { id: string; type: TransactionType }[]) =>
  categoryIds.find((category) => category.type === type)?.id ?? '';

export const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, onSave, onCancel }) => {
  const { categories, currency } = useContext(AppContext)!;
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: 'expense',
    amount: 0,
    category: getDefaultCategory('expense', categories),
    paymentMethod: 'cash',
    date: Date.now(),
    description: '',
    tags: [],
  });
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === formData.type),
    [categories, formData.type]
  );

  useEffect(() => {
    if (transaction) {
      setFormData(transaction);
      setDateInput(new Date(transaction.date).toISOString().split('T')[0]);
      return;
    }

    const nextType: TransactionType = 'expense';
    setFormData({
      type: nextType,
      amount: 0,
      category: getDefaultCategory(nextType, categories),
      paymentMethod: 'cash',
      date: Date.now(),
      description: '',
      tags: [],
    });
    setDateInput(new Date().toISOString().split('T')[0]);
  }, [transaction]);

  useEffect(() => {
    if (!filteredCategories.find((category) => category.id === formData.category)) {
      setFormData((current) => ({
        ...current,
        category: getDefaultCategory((current.type as TransactionType) ?? 'expense', categories),
      }));
    }
  }, [categories, filteredCategories, formData.category]);

  const handleTypeChange = (type: TransactionType) => {
    setFormData((current) => ({
      ...current,
      type,
      category: getDefaultCategory(type, categories),
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.amount || formData.amount <= 0 || !formData.category || !formData.type) {
      return;
    }

    onSave({
      ...(formData as Transaction),
      id: transaction?.id || generateId(),
      amount: Number(formData.amount),
      date: new Date(dateInput).getTime(),
      description: formData.description?.trim() ?? '',
      tags: formData.tags ?? [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {(['expense', 'income'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => handleTypeChange(type)}
            className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
              formData.type === type
                ? type === 'expense'
                  ? 'border-red-500 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-500/10 dark:text-red-300'
                  : 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-300'
                : 'border-gray-200 bg-white text-gray-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300'
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{type}</p>
            <p className="mt-2 text-lg font-semibold">{type === 'expense' ? 'Spend money' : 'Receive money'}</p>
          </button>
        ))}
      </div>

      <div>
        <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</label>
        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400 dark:text-gray-500">
            {currency.symbol}
          </span>
          <input
            type="number"
            step="0.01"
            value={formData.amount || ''}
            onChange={(event) => setFormData((current) => ({ ...current, amount: parseFloat(event.target.value) }))}
            className="w-full rounded-3xl border border-gray-200 bg-gray-50 py-5 pl-14 pr-5 text-3xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-white"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">Category</label>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {filteredCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setFormData((current) => ({ ...current, category: category.id }))}
              className={`min-w-0 rounded-2xl border px-3 py-4 text-center transition-all ${
                formData.category === category.id
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-500/10'
                  : 'border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
              }`}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ backgroundColor: `${category.color}20` }}>
                {category.icon}
              </div>
              <p className="mt-2 break-words text-xs font-medium text-gray-700 dark:text-gray-300">{category.name}</p>
            </button>
          ))}
        </div>
      </div>

      <CategoryCreator
        type={(formData.type as TransactionType) ?? 'expense'}
        title="Need a different category?"
        description="Create a custom category right here and select it instantly."
        buttonLabel="Custom category"
        onCreated={(category) => setFormData((current) => ({ ...current, category: category.id }))}
      />

      <div>
        <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">Payment method</label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PAYMENT_METHODS.map((paymentMethod) => (
            <button
              key={paymentMethod.id}
              type="button"
              onClick={() => setFormData((current) => ({ ...current, paymentMethod: paymentMethod.id }))}
              className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                formData.paymentMethod === paymentMethod.id
                  ? 'border-violet-500 bg-violet-50 dark:border-violet-500 dark:bg-violet-500/10'
                  : 'border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{paymentMethod.icon}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{paymentMethod.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{paymentMethod.id}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">Date</label>
          <input
            type="date"
            value={dateInput}
            onChange={(event) => setDateInput(event.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white [color-scheme:dark]"
          />
        </div>
        <div>
          <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
          <input
            type="text"
            value={formData.description || ''}
            onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            placeholder="Coffee with client, April rent, bonus payout..."
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 transition-colors hover:border-gray-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300 sm:w-auto sm:flex-1"
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`w-full rounded-2xl px-4 py-3 font-medium text-white transition-colors sm:w-auto sm:flex-1 ${
            formData.type === 'expense' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {transaction ? 'Save transaction' : `Add ${formData.type === 'expense' ? 'expense' : 'income'}`}
        </button>
      </div>
    </form>
  );
};
