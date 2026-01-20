import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Icons } from './Icons';
import { ViewType } from '../types';
import { AIChatbot } from './AIChatbot';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { activeView, setActiveView, setShowTransactionModal, setEditingTransaction } = useContext(AppContext)!;
  const [showAIChat, setShowAIChat] = React.useState(false);

  const navItems: { id: ViewType; label: string; Icon: any }[] = [
    { id: 'dashboard', label: 'Home', Icon: Icons.Home },
    { id: 'transactions', label: 'Transactions', Icon: Icons.List },
    { id: 'budget', label: 'Budget', Icon: Icons.Budget },
    { id: 'reports', label: 'Reports', Icon: Icons.Chart },
    { id: 'goals', label: 'Goals', Icon: Icons.Target },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-zinc-900/95 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg bg-white p-1">
              <img src="/logo.png" alt="SpendWise Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">SpendWise</span>
          </div>
          <div className="flex items-center gap-2">
            {/* AI Chatbot Button */}
            <button
              onClick={() => setShowAIChat(!showAIChat)}
              className={`p-2 rounded-xl transition-all ${showAIChat
                ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              title="AI Assistant"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </button>
            {/* Settings Button */}
            <button
              onClick={() => setActiveView('settings')}
              className={`p-2 rounded-xl transition-colors ${activeView === 'settings'
                ? 'bg-blue-100 dark:bg-zinc-800 text-blue-600 dark:text-white'
                : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <Icons.Settings />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 px-4 pt-4 max-w-lg mx-auto">
        {children}
      </main>

      {/* AI Chatbot Modal - Global */}
      {showAIChat && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowAIChat(false)} />
          <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[95vw] max-w-[420px] h-[600px] max-h-[calc(100vh-6rem)] bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#2d2d2d] z-50 overflow-hidden">
            <AIChatbot onClose={() => setShowAIChat(false)} />
          </div>
        </>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 px-4 py-2 safe-area-inset-bottom shadow-lg">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${activeView === item.id
                ? 'text-blue-600 dark:text-white bg-blue-50 dark:bg-zinc-800'
                : 'text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
            >
              <item.Icon />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Floating Action Button - Enhanced */}
      <button
        onClick={() => {
          setEditingTransaction(null);
          setShowTransactionModal(true);
        }}
        className="fixed bottom-20 right-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-600 dark:to-purple-600 dark:hover:from-blue-700 dark:hover:to-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-30 group"
        style={{ boxShadow: '0 8px 32px rgba(59, 130, 246, 0.5)' }}
        aria-label="Add Transaction"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <Icons.Plus className="relative z-10" />
        <div className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-20"></div>
      </button>
    </div>
  );
};
