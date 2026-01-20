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
    { id: 'bills', label: 'Bills', Icon: Icons.Calendar },
    { id: 'transactions', label: 'Transactions', Icon: Icons.List },
    { id: 'budget', label: 'Budget', Icon: Icons.Budget },
    { id: 'reports', label: 'Reports', Icon: Icons.Chart },
    { id: 'goals', label: 'Goals', Icon: Icons.Target },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg bg-white p-1">
              <img src="/logo.png" alt="SpendWise Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">SpendWise</span>
          </div>
          <button
            onClick={() => setActiveView('settings')}
            className={`p-2 rounded-xl transition-colors ${activeView === 'settings'
              ? 'bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-white'
              : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <Icons.Settings />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 px-4 pt-4 max-w-lg mx-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 px-4 py-2 safe-area-inset-bottom">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${activeView === item.id
                ? 'text-gray-900 dark:text-white bg-gray-200 dark:bg-zinc-800'
                : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              <item.Icon />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Floating Action Button */}
      <button
        onClick={() => {
          setEditingTransaction(null);
          setShowTransactionModal(true);
        }}
        className="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 hover:bg-blue-700 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-30"
        aria-label="Add Transaction"
      >
        <Icons.Plus />
      </button>
    </div>
  );
};
