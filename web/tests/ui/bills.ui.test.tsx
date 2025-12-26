import React from 'react';
import { vi } from 'vitest';

// Prevent firebase analytics init during tests
vi.mock('../../lib/firebase', () => ({
  app: {},
  getAnalytics: () => undefined,
}));

// Provide a mocked AppContext to avoid importing real AppContext which initializes firebase auth
vi.mock('../../context/AppContext', () => {
  const React = require('react');
  return { AppContext: React.createContext(null) };
});
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Bills from '../../components/Bills';
import { AppContext } from '../../context/AppContext';

const makeContext = (overrides = {}) => {
  const base = {
    transactions: [], budgets: [], goals: [], categories: [], darkMode: false,
    activeView: 'bills', setDarkMode: () => {}, setActiveView: () => {},
    addTransaction: () => {}, updateTransaction: () => {}, deleteTransaction: () => {},
    addBudget: () => {}, updateBudget: () => {}, deleteBudget: () => {},
    addGoal: () => {}, updateGoal: () => {}, deleteGoal: () => {},
    resetData: () => {}, showTransactionModal: false, setShowTransactionModal: () => {},
    editingTransaction: null, setEditingTransaction: () => {}, session: null,
    handleLogout: () => {}, currency: { code: 'USD', symbol: '$', name: 'USD', locale: 'en-US' }, setCurrency: () => {}, formatCurrency: (a: number) => `$${a}`
  } as any;
  return { ...base, ...overrides };
};

describe('Bills UI', () => {
  it('shows no bills message when no recurring detected', () => {
    const context = makeContext({ transactions: [] });
    render(
      <AppContext.Provider value={context}>
        <Bills />
      </AppContext.Provider>
    );

    expect(screen.getByText(/No recurring bills detected yet/i)).toBeInTheDocument();
  });

  it('detects recurring simple pattern', () => {
    const now = Date.now();
    const transactions = [
      { id: 't1', type: 'expense', amount: 9.99, category: 'Sub', paymentMethod: '', date: now - 30*24*60*60*1000, description: 'sub' },
      { id: 't2', type: 'expense', amount: 9.99, category: 'Sub', paymentMethod: '', date: now, description: 'sub' }
    ];
    const context = makeContext({ transactions });
    render(
      <AppContext.Provider value={context}>
        <Bills />
      </AppContext.Provider>
    );

    expect(screen.queryByText(/No recurring bills detected yet/i)).not.toBeInTheDocument();
    expect(screen.getByText(/sub/i)).toBeInTheDocument();
  });
});
