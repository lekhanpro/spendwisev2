
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Icons } from './Icons';
import { Modal } from './Modal';
import { SUPPORTED_CURRENCIES } from '../constants';
import { requestNotificationPermission, scheduleDailyReminder } from '../lib/notifications';

export const Settings: React.FC = () => {
  const { darkMode, setDarkMode, resetData, categories, handleLogout, session, currency, setCurrency } = useContext(AppContext)!;
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);

  useEffect(() => {
    // Check notification permission status
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
    // Load saved preferences
    const savedReminder = localStorage.getItem('dailyReminderEnabled');
    if (savedReminder) setDailyReminderEnabled(savedReminder === 'true');
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (granted) {
      alert('Notifications enabled! You will receive budget alerts and reminders.');
    }
  };

  const handleToggleDailyReminder = async () => {
    const newValue = !dailyReminderEnabled;
    setDailyReminderEnabled(newValue);
    localStorage.setItem('dailyReminderEnabled', String(newValue));

    if (newValue) {
      await scheduleDailyReminder(20, 0); // 8 PM reminder
      alert('Daily reminder set for 8:00 PM');
    }
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* Account Card - Glass Effect */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 shadow-md rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="font-medium text-white">Account</p>
          <p className="text-sm text-gray-400">{session?.user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Settings Options - Glass Card */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 shadow-md rounded-2xl divide-y divide-zinc-800">
        {/* Dark Mode */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="text-gray-400">{darkMode ? <Icons.Moon /> : <Icons.Sun />}</div>
            <div>
              <p className="font-medium text-white">Dark Mode</p>
              <p className="text-sm text-gray-500">Always enabled for modern look</p>
            </div>
          </div>
          <div className="w-12 h-6 rounded-full bg-blue-500">
            <div className="w-5 h-5 bg-white rounded-full shadow transform translate-x-6 mt-0.5" />
          </div>
        </div>

        {/* Currency Selector */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="text-gray-400 text-xl">💱</div>
            <div>
              <p className="font-medium text-white">Currency</p>
              <p className="text-sm text-gray-500">Select your preferred currency</p>
            </div>
          </div>
          <select
            value={currency.code}
            onChange={(e) => {
              const selected = SUPPORTED_CURRENCIES.find(c => c.code === e.target.value);
              if (selected) setCurrency(selected);
            }}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm font-medium text-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SUPPORTED_CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
            ))}
          </select>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="text-gray-400 text-xl">🔔</div>
            <div>
              <p className="font-medium text-white">Notifications</p>
              <p className="text-sm text-gray-500">{notificationsEnabled ? 'Enabled' : 'Enable alerts & reminders'}</p>
            </div>
          </div>
          <button
            onClick={handleEnableNotifications}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${notificationsEnabled
                ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
          >
            {notificationsEnabled ? 'Enabled ✓' : 'Enable'}
          </button>
        </div>

        {/* Daily Reminder */}
        {notificationsEnabled && (
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="text-gray-400 text-xl">⏰</div>
              <div>
                <p className="font-medium text-white">Daily Reminder</p>
                <p className="text-sm text-gray-500">Get reminded at 8 PM daily</p>
              </div>
            </div>
            <button
              onClick={handleToggleDailyReminder}
              className={`w-12 h-6 rounded-full transition-colors ${dailyReminderEnabled ? 'bg-blue-500' : 'bg-zinc-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${dailyReminderEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        )}

        {/* Categories */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xl">📁</span>
            <div>
              <p className="font-medium text-white">Categories</p>
              <p className="text-sm text-gray-500">{categories.length} categories available</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 10).map(cat => (
              <span key={cat.id} className="px-3 py-1 rounded-full text-sm bg-zinc-800 border border-zinc-700 text-gray-300">
                {cat.icon} {cat.name}
              </span>
            ))}
            {categories.length > 10 && (
              <span className="px-3 py-1 rounded-full text-sm bg-zinc-800 border border-zinc-700 text-gray-500">
                +{categories.length - 10} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Data Management - Glass Card */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 shadow-md rounded-2xl p-4">
        <h3 className="font-semibold text-white mb-3">Data Management</h3>
        <div className="space-y-3">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-3 rounded-xl font-medium bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-colors"
          >
            Reset All Data
          </button>
        </div>
      </div>

      {/* About - Glass Card */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 shadow-md rounded-2xl p-4">
        <h3 className="font-semibold text-white mb-2">About SpendWise</h3>
        <p className="text-sm text-gray-400">
          SpendWise is your personal finance companion. Track expenses, manage budgets, and achieve your financial goals with ease.
        </p>
        <p className="text-xs text-gray-500 mt-3">Version 1.0.0</p>
      </div>

      {/* Privacy - Glass Card */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 shadow-md rounded-2xl p-4">
        <h3 className="font-semibold text-white mb-2">🔒 Privacy</h3>
        <p className="text-sm text-gray-400">
          All your data is stored securely with Firebase. We use industry-standard encryption to protect your financial information.
        </p>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)} title="Reset All Data?">
        <div className="space-y-4">
          <p className="text-gray-300">
            This will permanently delete all your transactions, budgets, and goals. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="flex-1 py-3 rounded-xl font-medium bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700"
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
