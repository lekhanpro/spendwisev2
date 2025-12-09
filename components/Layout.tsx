import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Icons } from './Icons';
import { ViewType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { activeView, setActiveView, setShowTransactionModal, setEditingTransaction } = useContext(AppContext)!;

  const navItems: { id: ViewType; label: string; Icon: any }[] = [
    { id: 'dashboard', label: 'Home', Icon: Icons.Home },
    { id: 'transactions', label: 'Transactions', Icon: Icons.List },
    { id: 'budget', label: 'Budget', Icon: Icons.Budget },
    { id: 'reports', label: 'Reports', Icon: Icons.Chart },
    { id: 'goals', label: 'Goals', Icon: Icons.Target },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg bg-white p-1">
              <img src="/logo.png" alt="SpendWise Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-slate-800 dark:text-white text-lg">SpendWise</span>
          </div>
          <button
            onClick={() => setActiveView('settings')}
            className={`p-2 rounded-xl transition-colors ${activeView === 'settings'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
          >
            <Icons.Settings />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 safe-area-inset-bottom">
        <div className="flex items-center justify-around max-w-lg mx-auto py-2">
          {navItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${activeView === id
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
            >
              <Icon />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Floating Action Button */}
      <button
        onClick={() => { setEditingTransaction(null); setShowTransactionModal(true); }}
        className="fixed right-4 bottom-24 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        <Icons.Plus />
      </button>
    </div>
  );
};
