import React from 'react';
import { vi } from 'vitest';

// Prevent firebase analytics init during tests
vi.mock('../../lib/firebase', () => ({
  app: {},
  getAnalytics: () => undefined,
}));

// Provide a mocked AppContext to avoid initializing real AppContext (which imports firebase/auth)
vi.mock('../../context/AppContext', () => {
  const React = require('react');
  return { AppContext: React.createContext(null) };
});
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Settings } from '../../components/Settings';
import { AppContext } from '../../context/AppContext';

const makeContext = (overrides = {}) => {
  const base = {
    transactions: [], budgets: [], goals: [], categories: [], darkMode: false,
    activeView: 'settings', setDarkMode: () => {}, setActiveView: () => {},
    addTransaction: vi.fn(), updateTransaction: vi.fn(), deleteTransaction: vi.fn(),
    addBudget: vi.fn(), updateBudget: vi.fn(), deleteBudget: vi.fn(),
    addGoal: vi.fn(), updateGoal: vi.fn(), deleteGoal: vi.fn(),
    resetData: vi.fn(), showTransactionModal: false, setShowTransactionModal: vi.fn(),
    editingTransaction: null, setEditingTransaction: vi.fn(), session: { user: { displayName: 'Test', email: 't@test' } },
    handleLogout: vi.fn(), currency: { code: 'USD', symbol: '$', name: 'USD', locale: 'en-US' }, setCurrency: vi.fn(), formatCurrency: (a: number) => `$${a}`
  } as any;
  return { ...base, ...overrides };
};

describe('Settings UI import flow', () => {
  it('opens import preview and allows edit + import selected', async () => {
    const addTransaction = vi.fn();
    const context = makeContext({ addTransaction, transactions: [{ id: 'ex', amount: 10, date: Date.now(), description: 'Sample' }] });

    render(
      <AppContext.Provider value={context}>
        <Settings />
      </AppContext.Provider>
    );

    // find the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();

    // prepare CSV and file
    const csv = 'id,type,amount,category,paymentMethod,date,description,tags\nimp1,expense,5,Food,Card,2025-01-01T00:00:00.000Z,Lunch,food';
    const file = new File([csv], 'test.csv', { type: 'text/csv' });

    // trigger change
    await waitFor(() => fireEvent.change(fileInput, { target: { files: [file] } }));

    // modal should open with preview
    expect(await screen.findByText(/Import Preview/i)).toBeInTheDocument();

    // ensure description input exists
    const descInput = screen.getByPlaceholderText('Description') as HTMLInputElement;
    expect(descInput).toBeInTheDocument();

    // edit description
    fireEvent.change(descInput, { target: { value: 'Edited Lunch' } });

    // Click Import Selected
    const importBtn = screen.getByRole('button', { name: /Import Selected/i });
    fireEvent.click(importBtn);

    await waitFor(() => expect(addTransaction).toHaveBeenCalled());
  });
});
