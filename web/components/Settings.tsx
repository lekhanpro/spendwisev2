
import React, { useContext, useState, useEffect, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { Icons } from './Icons';
import { Modal } from './Modal';
import { SUPPORTED_CURRENCIES } from '../constants';
import { requestNotificationPermission, scheduleDailyReminder } from '../lib/notifications';
import { exportTransactionsCSV, parseTransactionsCSV, exportTransactionsOFX } from '../lib/export';
import { detectFuzzyDuplicates } from '../lib/dedupe';
import { SavingsCalculator } from './SavingsCalculator';
import { ReceiptScanner } from './ReceiptScanner';
import { RecurringTransactions } from './RecurringTransactions';
import { CategoryTrends } from './CategoryTrends';
import { Achievements } from './Achievements';
import { CustomAlerts } from './CustomAlerts';
import { Bills } from './Bills';
import { generatePDFReport } from '../lib/pdfExport';

export const Settings: React.FC = () => {
  const { darkMode, setDarkMode, resetData, categories, handleLogout, session, currency, setCurrency, transactions, addTransaction, budgets, goals, formatCurrency } = useContext(AppContext)!;
  const [importPreviewOpen, setImportPreviewOpen] = useState(false);
  const [previewItems, setPreviewItems] = useState<any[]>([]);
  const [selectedImportIds, setSelectedImportIds] = useState<Record<string, boolean>>({});
  const [duplicateMap, setDuplicateMap] = useState<Record<string, string>>({});
  const [fuzzyThreshold, setFuzzyThreshold] = useState(0.8);
  const [dateWindowDays, setDateWindowDays] = useState(3);
  const [amountTolerancePercent, setAmountTolerancePercent] = useState(20);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);
  const [showSavingsCalculator, setShowSavingsCalculator] = useState(false);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
  const [showRecurringTransactions, setShowRecurringTransactions] = useState(false);
  const [showCategoryTrends, setShowCategoryTrends] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showCustomAlerts, setShowCustomAlerts] = useState(false);
  const [showBills, setShowBills] = useState(false);

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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      {/* Account Card - Glass Effect */}
      <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-gray-200 dark:border-zinc-800 shadow-lg rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {session?.user?.photoURL ? (
            <img
              src={session.user.photoURL}
              alt="Profile"
              className="w-12 h-12 rounded-full border-2 border-blue-200 dark:border-zinc-700"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-zinc-800 border-2 border-blue-200 dark:border-zinc-700 flex items-center justify-center text-xl">
              👤
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{session?.user?.displayName || 'User'}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{session?.user?.email || 'No email'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-50 dark:bg-zinc-800 border border-red-200 dark:border-zinc-700 text-red-600 dark:text-white rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-zinc-700 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Settings Options - Glass Card */}
      <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-gray-200 dark:border-zinc-800 shadow-lg rounded-2xl divide-y divide-gray-200 dark:divide-zinc-800">
        {/* Dark Mode */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{darkMode ? '🌙' : '☀️'}</div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
              <p className="text-sm text-gray-600 dark:text-gray-500">Toggle dark/light theme</p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-blue-500' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Currency Selector */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="text-gray-600 dark:text-gray-400 text-xl">💱</div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Currency</p>
              <p className="text-sm text-gray-600 dark:text-gray-500">Select your preferred currency</p>
            </div>
          </div>
          <select
            value={currency.code}
            onChange={(e) => {
              const selected = SUPPORTED_CURRENCIES.find(c => c.code === e.target.value);
              if (selected) setCurrency(selected);
            }}
            className="px-3 py-2 bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SUPPORTED_CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
            ))}
          </select>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="text-gray-600 dark:text-gray-400 text-xl">🔔</div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-500">{notificationsEnabled ? 'Enabled' : 'Enable alerts & reminders'}</p>
            </div>
          </div>
          <button
            onClick={handleEnableNotifications}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${notificationsEnabled
              ? 'bg-green-500/20 border border-green-500/50 text-green-600 dark:text-green-400'
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
              <div className="text-gray-600 dark:text-gray-400 text-xl">⏰</div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Daily Reminder</p>
                <p className="text-sm text-gray-600 dark:text-gray-500">Get reminded at 8 PM daily</p>
              </div>
            </div>
            <button
              onClick={handleToggleDailyReminder}
              className={`w-12 h-6 rounded-full transition-colors ${dailyReminderEnabled ? 'bg-blue-500' : 'bg-gray-400 dark:bg-zinc-700'}`}
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
              <p className="font-medium text-gray-900 dark:text-white">Categories</p>
              <p className="text-sm text-gray-600 dark:text-gray-500">{categories.length} categories available</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 10).map(cat => (
              <span key={cat.id} className="px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-800 dark:text-gray-300">
                {cat.icon} {cat.name}
              </span>
            ))}
            {categories.length > 10 && (
              <span className="px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-gray-500">
                +{categories.length - 10} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tools - Glass Card */}
      <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-gray-200 dark:border-zinc-800 shadow-lg rounded-2xl divide-y divide-gray-200 dark:divide-zinc-800">
        <button
          onClick={() => setShowSavingsCalculator(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-gray-600 dark:text-gray-400 text-xl">🧮</div>
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Savings Calculator</p>
              <p className="text-sm text-gray-600 dark:text-gray-500">Calculate time to reach your goals</p>
            </div>
          </div>
          <Icons.ChevronRight />
        </button>

        <button
          onClick={() => setShowReceiptScanner(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-gray-600 dark:text-gray-400 text-xl">📸</div>
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Receipt Scanner</p>
              <p className="text-sm text-gray-600 dark:text-gray-500">Scan and add receipts automatically</p>
            </div>
          </div>
          <Icons.ChevronRight />
        </button>

        <button
          onClick={() => setShowRecurringTransactions(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-gray-600 dark:text-gray-400 text-xl">🔄</div>
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Recurring Transactions</p>
              <p className="text-sm text-gray-600 dark:text-gray-500">Manage subscriptions and bills</p>
            </div>
          </div>
          <Icons.ChevronRight />
        </button>

        <button
          onClick={() => setShowBills(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-gray-600 dark:text-gray-400 text-xl">📅</div>
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Bills & Reminders</p>
              <p className="text-sm text-gray-600 dark:text-gray-500">Track upcoming bills and payments</p>
            </div>
          </div>
          <Icons.ChevronRight />
        </button>

        <button
          onClick={() => setShowCategoryTrends(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-gray-600 dark:text-gray-400 text-xl">📈</div>
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Category Trends</p>
              <p className="text-sm text-gray-600 dark:text-gray-500">Track spending patterns over time</p>
            </div>
          </div>
          <Icons.ChevronRight />
        </button>

        <button
          onClick={() => setShowAchievements(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-gray-600 dark:text-gray-400 text-xl">🏆</div>
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Achievements</p>
              <p className="text-sm text-gray-600 dark:text-gray-500">View your badges and progress</p>
            </div>
          </div>
          <Icons.ChevronRight />
        </button>

        <button
          onClick={() => setShowCustomAlerts(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-gray-600 dark:text-gray-400 text-xl">🔔</div>
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Custom Alerts</p>
              <p className="text-sm text-gray-600 dark:text-gray-500">Set personalized spending alerts</p>
            </div>
          </div>
          <Icons.ChevronRight />
        </button>

        <button
          onClick={() => {
            const monthStart = new Date();
            monthStart.setDate(1);
            monthStart.setHours(0, 0, 0, 0);
            const monthEnd = new Date();
            monthEnd.setMonth(monthEnd.getMonth() + 1);
            monthEnd.setDate(0);
            monthEnd.setHours(23, 59, 59, 999);
            generatePDFReport(transactions, budgets, goals, categories, formatCurrency, {
              start: monthStart.getTime(),
              end: monthEnd.getTime()
            });
          }}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-gray-600 dark:text-gray-400 text-xl">📄</div>
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">PDF Report</p>
              <p className="text-sm text-gray-600 dark:text-gray-500">Generate monthly financial report</p>
            </div>
          </div>
          <Icons.ChevronRight />
        </button>
      </div>

      {/* Data Management - Glass Card */}
      <div className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md border border-gray-200 dark:border-zinc-800 shadow-md rounded-2xl p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Data Management</h3>
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => exportTransactionsCSV(transactions)}
                className="w-full py-3 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Icons.Download /> Export CSV
              </button>

              <button
                onClick={() => exportTransactionsOFX(transactions)}
                className="w-full py-3 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Icons.Download /> Export OFX
              </button>

              <label className="w-full py-3 rounded-xl font-medium bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                Import CSV
                <input
                  type="file"
                  accept="text/csv"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    let text = '';
                    if (typeof (file as any).text === 'function') {
                      text = await (file as any).text();
                    } else {
                      // File.text may not be available in some test environments — fallback to FileReader
                      text = await new Promise<string>((res, rej) => {
                        const reader = new FileReader();
                        reader.onload = () => res(String(reader.result || ''));
                        reader.onerror = () => rej(new Error('Failed reading file'));
                        reader.readAsText(file);
                      });
                    }
                    const imported = parseTransactionsCSV(text);
                    if (imported.length === 0) {
                      alert('No transactions found in CSV');
                      (e.target as HTMLInputElement).value = '';
                      return;
                    }

                    // Detect duplicates using fuzzy logic
                    const dupMap = detectFuzzyDuplicates(transactions, imported, { threshold: fuzzyThreshold, dateWindowDays, amountTolerancePercent });

                    // Initialize selection (unchecked if flagged)
                    const sel: Record<string, boolean> = {};
                    imported.forEach((it: any) => {
                      sel[it.id] = !dupMap[it.id];
                    });

                    setPreviewItems(imported);
                    setDuplicateMap(dupMap);
                    setSelectedImportIds(sel);
                    setImportPreviewOpen(true);

                    // clear input value so same file can be reselected later
                    (e.target as HTMLInputElement).value = '';
                  }}
                  className="hidden"
                />
              </label>

              <label className="w-full py-3 rounded-xl font-medium bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 cursor-not-allowed opacity-60">
                Import OFX
              </label>
            </div>
        </div>
      </div>

      {/* About - Glass Card */}
      <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-gray-200 dark:border-zinc-800 shadow-lg rounded-2xl p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">About SpendWise</h3>
        <p className="text-sm text-gray-700 dark:text-gray-400">
          SpendWise is your personal finance companion. Track expenses, manage budgets, and achieve your financial goals with ease.
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-500 mt-3">Version 1.0.0</p>
      </div>

      {/* About Me Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-zinc-800 shadow-lg rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
            LH
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Lekhan HR</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Developer & Creator</p>
          </div>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
          Built with ❤️ by Lekhan HR. SpendWise helps you take control of your finances with smart tracking, AI insights, and beautiful design.
        </p>
        <div className="flex gap-3">
          <a 
            href="https://github.com/lekhanpro" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium text-center hover:scale-105 transition-transform shadow-md flex items-center justify-center gap-2"
          >
            <span>🐙</span> GitHub
          </a>
          <a 
            href="https://www.linkedin.com/in/lekhan-hr-507b89371/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-xl font-medium text-center hover:scale-105 transition-transform shadow-md flex items-center justify-center gap-2"
          >
            <span>💼</span> LinkedIn
          </a>
        </div>
      </div>

      {/* Privacy - Glass Card */}
      <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-md border border-gray-200 dark:border-zinc-800 shadow-lg rounded-2xl p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🔒 Privacy</h3>
        <p className="text-sm text-gray-700 dark:text-gray-400">
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
      {/* Savings Calculator Modal */}
      <Modal isOpen={showSavingsCalculator} onClose={() => setShowSavingsCalculator(false)} title="Savings Calculator">
        <SavingsCalculator />
      </Modal>

      {/* Receipt Scanner Modal */}
      <Modal isOpen={showReceiptScanner} onClose={() => setShowReceiptScanner(false)} title="Receipt Scanner">
        <ReceiptScanner />
      </Modal>

      {/* Recurring Transactions Modal */}
      <Modal isOpen={showRecurringTransactions} onClose={() => setShowRecurringTransactions(false)} title="Recurring Transactions">
        <RecurringTransactions />
      </Modal>

      {/* Category Trends Modal */}
      <Modal isOpen={showCategoryTrends} onClose={() => setShowCategoryTrends(false)} title="Category Trends">
        <CategoryTrends />
      </Modal>

      {/* Achievements Modal */}
      <Modal isOpen={showAchievements} onClose={() => setShowAchievements(false)} title="Achievements">
        <Achievements />
      </Modal>

      {/* Custom Alerts Modal */}
      <Modal isOpen={showCustomAlerts} onClose={() => setShowCustomAlerts(false)} title="Custom Alerts">
        <CustomAlerts />
      </Modal>

      {/* Bills Modal */}
      <Modal isOpen={showBills} onClose={() => setShowBills(false)} title="Bills & Reminders">
        <Bills />
      </Modal>

      {/* Import Preview Modal */}
      <Modal isOpen={importPreviewOpen} onClose={() => setImportPreviewOpen(false)} title={`Import Preview (${previewItems.length})`}>
        <div className="space-y-3">
          <p className="text-sm text-gray-300">Review imported transactions. Duplicates are detected and unchecked by default.</p>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-300">Fuzzy threshold:</div>
            <input type="range" min={0.5} max={0.98} step={0.02} value={fuzzyThreshold} onChange={(e) => setFuzzyThreshold(parseFloat(e.target.value))} />
            <div className="text-sm text-gray-300">{Math.round(fuzzyThreshold * 100)}%</div>
            <div className="ml-4 text-sm text-gray-300">Date window (days):</div>
            <input type="number" min={0} max={30} value={dateWindowDays} onChange={(e) => setDateWindowDays(parseInt(e.target.value || '0'))} className="w-16 bg-zinc-800 text-white rounded px-2" />
            <div className="ml-4 text-sm text-gray-300">Amount tol %:</div>
            <input type="number" min={0} max={100} value={amountTolerancePercent} onChange={(e) => setAmountTolerancePercent(parseInt(e.target.value || '0'))} className="w-16 bg-zinc-800 text-white rounded px-2" />
            <button
              onClick={() => {
                const dupMap = detectFuzzyDuplicates(transactions, previewItems, { threshold: fuzzyThreshold, dateWindowDays, amountTolerancePercent });
                const sel: Record<string, boolean> = {};
                previewItems.forEach((it: any) => { sel[it.id] = !dupMap[it.id]; });
                setDuplicateMap(dupMap);
                setSelectedImportIds(sel);
              }}
              className="ml-3 px-3 py-1 rounded bg-zinc-800 text-white"
            >Re-run</button>
          </div>
          <div className="max-h-72 overflow-y-auto mt-2 space-y-2">
            {previewItems.map((it) => (
              <div key={it.id} className="flex items-start gap-3 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <input
                  type="checkbox"
                  checked={!!selectedImportIds[it.id]}
                  onChange={(e) => setSelectedImportIds(prev => ({ ...prev, [it.id]: e.target.checked }))}
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={it.description || it.category || ''}
                      onChange={(e) => setPreviewItems(prev => prev.map(p => p.id === it.id ? { ...p, description: e.target.value } : p))}
                      className="flex-1 bg-zinc-800 text-white rounded px-2 py-1 text-sm"
                      placeholder="Description"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={String(it.amount || '')}
                      onChange={(e) => setPreviewItems(prev => prev.map(p => p.id === it.id ? { ...p, amount: parseFloat(e.target.value || '0') } : p))}
                      className="w-28 bg-zinc-800 text-white rounded px-2 py-1 text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={new Date(it.date).toISOString().slice(0,10)}
                      onChange={(e) => setPreviewItems(prev => prev.map(p => p.id === it.id ? { ...p, date: Date.parse(e.target.value) } : p))}
                      className="bg-zinc-800 text-white rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="text"
                      value={it.category || ''}
                      onChange={(e) => setPreviewItems(prev => prev.map(p => p.id === it.id ? { ...p, category: e.target.value } : p))}
                      className="flex-1 bg-zinc-800 text-white rounded px-2 py-1 text-sm"
                      placeholder="Category"
                    />
                    <input
                      type="text"
                      value={(it.tags || []).join(';')}
                      onChange={(e) => setPreviewItems(prev => prev.map(p => p.id === it.id ? { ...p, tags: e.target.value.split(';').map((s: string) => s.trim()).filter(Boolean) } : p))}
                      className="w-40 bg-zinc-800 text-white rounded px-2 py-1 text-sm"
                      placeholder="tags;semi;colon"
                    />
                  </div>

                  {duplicateMap[it.id] && (
                    <div className="text-xs text-yellow-300">{duplicateMap[it.id]}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-3">
            <button
              onClick={() => setImportPreviewOpen(false)}
              className="flex-1 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const toImport = previewItems.filter(it => selectedImportIds[it.id]);
                if (toImport.length === 0) {
                  alert('No items selected for import');
                  return;
                }
                toImport.forEach(t => addTransaction(t));
                alert(`Imported ${toImport.length} transactions`);
                setImportPreviewOpen(false);
                setPreviewItems([]);
                setSelectedImportIds({});
                setDuplicateMap({});
              }}
              className="flex-1 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              Import Selected
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
