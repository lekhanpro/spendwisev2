
import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Icons } from './Icons';
import { Modal } from './Modal';
import { SUPPORTED_CURRENCIES } from '../constants';

export const Settings: React.FC = () => {
  const { darkMode, setDarkMode, resetData, categories, handleLogout, session, currency, setCurrency } = useContext(AppContext)!;
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="p-4 pb-24 space-y-4 animate-slide-up">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h1>
      
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="font-medium text-slate-800 dark:text-white">Account</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{session?.user?.email}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-md rounded-2xl divide-y divide-slate-100 dark:divide-slate-700">
        {/* Dark Mode */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="text-slate-500 dark:text-slate-400">{darkMode ? <Icons.Moon /> : <Icons.Sun />}</div>
            <div>
              <p className="font-medium text-slate-800 dark:text-white">Dark Mode</p>
              <p className="text-sm text-slate-400">Switch between light and dark theme</p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-blue-500' : 'bg-slate-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Currency Selector */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="text-slate-500 dark:text-slate-400 text-xl">💱</div>
            <div>
              <p className="font-medium text-slate-800 dark:text-white">Currency</p>
              <p className="text-sm text-slate-400">Select your preferred currency</p>
            </div>
          </div>
          <select
            value={currency.code}
            onChange={(e) => {
              const selected = SUPPORTED_CURRENCIES.find(c => c.code === e.target.value);
              if (selected) setCurrency(selected);
            }}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SUPPORTED_CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
            ))}
          </select>
        </div>

        {/* Categories */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xl">📁</span>
            <div>
              <p className="font-medium text-slate-800 dark:text-white">Categories</p>
              <p className="text-sm text-slate-400">{categories.length} categories available</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 10).map(cat => (
              <span key={cat.id} className="px-3 py-1 rounded-full text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {cat.icon} {cat.name}
              </span>
            ))}
            {categories.length > 10 && (
              <span className="px-3 py-1 rounded-full text-sm bg-slate-100 dark:bg-slate-700 text-slate-400">
                +{categories.length - 10} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-2xl p-4">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Data Management</h3>
        <div className="space-y-3">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-3 rounded-xl font-medium bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
          >
            Reset All Data
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-2xl p-4">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-2">About SpendWise</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          SpendWise is your personal finance companion. Track expenses, manage budgets, and achieve your financial goals with ease.
        </p>
        <p className="text-xs text-slate-400 mt-3">Version 1.0.0</p>
      </div>

      {/* Privacy */}
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-2xl p-4">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-2">🔒 Privacy</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          All your data is stored locally on your device. We don't collect, store, or transmit any of your financial information.
        </p>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)} title="Reset All Data?">
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300">
            This will permanently delete all your transactions, budgets, and goals. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="flex-1 py-3 rounded-xl font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={() => { resetData(); setShowResetConfirm(false); }}
              className="flex-1 py-3 rounded-xl font-medium bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
            >
              Reset Everything
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
