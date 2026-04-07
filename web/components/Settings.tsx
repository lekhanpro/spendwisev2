import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { SUPPORTED_CURRENCIES } from '../constants';
import { detectFuzzyDuplicates } from '../lib/dedupe';
import { exportTransactionsCSV, exportTransactionsOFX, parseTransactionsCSV } from '../lib/export';
import { generatePDFReport } from '../lib/pdfExport';
import { Achievements } from './Achievements';
import { Bills } from './Bills';
import { CategoryCreator } from './CategoryCreator';
import { CategoryTrends } from './CategoryTrends';
import { CustomAlerts } from './CustomAlerts';
import { InvestCard, MetricPill, QuietToggle, SectionTitle } from './investment/InvestUI';
import { Modal } from './Modal';
import { ReceiptScanner } from './ReceiptScanner';
import { RecurringTransactions } from './RecurringTransactions';
import { SavingsCalculator } from './SavingsCalculator';

export const Settings: React.FC = () => {
  const {
    darkMode,
    setDarkMode,
    resetData,
    categories,
    customCategories,
    removeCustomCategory,
    handleLogout,
    session,
    currency,
    setCurrency,
    transactions,
    addTransaction,
    budgets,
    goals,
    formatCurrency,
  } = useContext(AppContext)!;

  const [importPreviewOpen, setImportPreviewOpen] = useState(false);
  const [previewItems, setPreviewItems] = useState<any[]>([]);
  const [selectedImportIds, setSelectedImportIds] = useState<Record<string, boolean>>({});
  const [duplicateMap, setDuplicateMap] = useState<Record<string, string>>({});
  const [fuzzyThreshold, setFuzzyThreshold] = useState(0.8);
  const [dateWindowDays, setDateWindowDays] = useState(3);
  const [amountTolerancePercent, setAmountTolerancePercent] = useState(20);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSavingsCalculator, setShowSavingsCalculator] = useState(false);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
  const [showRecurringTransactions, setShowRecurringTransactions] = useState(false);
  const [showCategoryTrends, setShowCategoryTrends] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showCustomAlerts, setShowCustomAlerts] = useState(false);
  const [showBills, setShowBills] = useState(false);

  const expenseCategories = useMemo(() => categories.filter((category) => category.type === 'expense'), [categories]);
  const incomeCategories = useMemo(() => categories.filter((category) => category.type === 'income'), [categories]);
  const customUsage = useMemo(() => {
    const usage = new Map<string, number>();
    customCategories.forEach((category) => usage.set(category.id, 0));
    transactions.forEach((transaction) => usage.set(transaction.category, (usage.get(transaction.category) ?? 0) + 1));
    budgets.forEach((budget) => usage.set(budget.category, (usage.get(budget.category) ?? 0) + 1));
    return usage;
  }, [budgets, customCategories, transactions]);

  const notifyUser = (message: string) => {
    if (typeof window !== 'undefined' && /jsdom/i.test(window.navigator.userAgent)) {
      console.info(message);
      return;
    }

    try {
      window.alert(message);
    } catch {
      console.info(message);
    }
  };

  const toolActions = [
    { label: 'Savings calculator', description: 'Projection support for savings targets', icon: '🧮', onClick: () => setShowSavingsCalculator(true) },
    { label: 'Receipt scanner', description: 'Extract transactions from receipts', icon: '📸', onClick: () => setShowReceiptScanner(true) },
    { label: 'Recurring transactions', description: 'Manage subscriptions and repeated spends', icon: '🔄', onClick: () => setShowRecurringTransactions(true) },
    { label: 'Bills and reminders', description: 'Track upcoming due dates and bills', icon: '📅', onClick: () => setShowBills(true) },
    { label: 'Category trends', description: 'See which categories are heating up', icon: '📈', onClick: () => setShowCategoryTrends(true) },
    { label: 'Achievements', description: 'Review milestone progress and badges', icon: '🏆', onClick: () => setShowAchievements(true) },
    { label: 'Custom alerts', description: 'Panel-only alerts tuned to your preferences', icon: '🔔', onClick: () => setShowCustomAlerts(true) },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <InvestCard className="overflow-hidden">
        <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-900 p-6 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_38%)]" />
          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.22em] text-white/75">Workspace Controls</p>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Settings and data studio</h1>
              <p className="mt-3 text-white/85">
                Theme, data tools, imports, category management, and account controls in the same SpendWise dashboard language.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                {session?.user?.photoURL ? (
                  <img src={session.user.photoURL} alt="Profile" className="h-11 w-11 rounded-full border border-white/20 object-cover" />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg">👤</div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold">{session?.user?.displayName || 'SpendWise User'}</p>
                  <p className="truncate text-sm text-white/70">{session?.user?.email || 'No email connected'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/15"
              >
                Sign out
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricPill label="Transactions" value={`${transactions.length}`} />
            <MetricPill label="Budgets" value={`${budgets.length}`} />
            <MetricPill label="Goals" value={`${goals.length}`} tone="positive" />
            <MetricPill label="Custom Categories" value={`${customCategories.length}`} tone="warning" />
          </div>
        </div>
      </InvestCard>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <InvestCard className="p-5">
          <SectionTitle eyebrow="Preferences" title="Workspace preferences" description="Theme, currency, and quiet-alert behavior." />
          <div className="mt-4 divide-y divide-gray-200 dark:divide-zinc-800">
            <QuietToggle
              label="Dark mode"
              description="Switch the full SpendWise workspace between dark and light."
              checked={darkMode}
              onChange={setDarkMode}
            />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Currency</p>
              <select
                value={currency.code}
                onChange={(event) => {
                  const selected = SUPPORTED_CURRENCIES.find((item) => item.code === event.target.value);
                  if (selected) {
                    setCurrency(selected);
                  }
                }}
                className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
              >
                {SUPPORTED_CURRENCIES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.code} ({item.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Notifications</p>
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                SpendWise no longer auto-pops recurring alerts. Investment preferences stay opt-in and surface only inside the notification panel.
              </p>
            </div>
          </div>
        </InvestCard>

        <InvestCard className="p-5">
          <SectionTitle eyebrow="Category Studio" title="Built-in and custom categories" description="Add custom expense or income categories and reuse them in transactions and budgets." />
          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Expense categories</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {expenseCategories.map((category) => (
                    <span key={category.id} className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300">
                      {category.icon} {category.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Income categories</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {incomeCategories.map((category) => (
                    <span key={category.id} className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300">
                      {category.icon} {category.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <CategoryCreator defaultOpen title="Add a custom category" description="Use this for personal buckets like tuition, side hustle, or pet care." />
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Custom categories</p>
                <div className="mt-3 space-y-3">
                  {customCategories.length === 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">No custom categories yet. Add one above and it will show up in both transaction and budget flows.</p>
                  )}
                  {customCategories.map((category) => {
                    const usageCount = customUsage.get(category.id) ?? 0;
                    return (
                      <div key={category.id} className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl" style={{ backgroundColor: `${category.color}20` }}>
                            {category.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900 dark:text-white">{category.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{category.type} · {usageCount} linked items</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={usageCount > 0}
                          onClick={() => removeCustomCategory(category.id)}
                          className={`rounded-xl px-3 py-2 text-sm font-medium ${
                            usageCount > 0
                              ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-gray-500'
                              : 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300'
                          }`}
                        >
                          {usageCount > 0 ? 'In use' : 'Remove'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </InvestCard>
      </div>

      <InvestCard className="p-5">
        <SectionTitle eyebrow="Toolkit" title="SpendWise tools" description="All helper tools remain available, but now live inside the same card system as the rest of the app." />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {toolActions.map((tool) => (
            <button
              key={tool.label}
              type="button"
              onClick={tool.onClick}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left transition-colors hover:border-blue-500 hover:bg-white dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:bg-zinc-900"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{tool.icon}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{tool.label}</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{tool.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </InvestCard>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <InvestCard className="p-5">
          <SectionTitle eyebrow="Data Management" title="Import, export, and reporting" description="Bring in CSV files, export data, or generate a monthly PDF snapshot." />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => exportTransactionsCSV(transactions)}
              className="rounded-2xl bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => exportTransactionsOFX(transactions)}
              className="rounded-2xl bg-indigo-600 px-4 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Export OFX
            </button>
            <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 transition-colors hover:border-blue-500 hover:text-blue-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300 dark:hover:text-blue-400">
              Import CSV
              <input
                type="file"
                accept="text/csv"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    return;
                  }

                  let text = '';
                  if (typeof (file as any).text === 'function') {
                    text = await (file as any).text();
                  } else {
                    text = await new Promise<string>((resolve, reject) => {
                      const reader = new FileReader();
                      reader.onload = () => resolve(String(reader.result || ''));
                      reader.onerror = () => reject(new Error('Failed reading file'));
                      reader.readAsText(file);
                    });
                  }

                  const imported = parseTransactionsCSV(text);
                  if (imported.length === 0) {
                    notifyUser('No transactions found in CSV');
                    (event.target as HTMLInputElement).value = '';
                    return;
                  }

                  const dupMap = detectFuzzyDuplicates(transactions, imported, {
                    threshold: fuzzyThreshold,
                    dateWindowDays,
                    amountTolerancePercent,
                  });

                  const selection: Record<string, boolean> = {};
                  imported.forEach((item: any) => {
                    selection[item.id] = !dupMap[item.id];
                  });

                  setPreviewItems(imported);
                  setDuplicateMap(dupMap);
                  setSelectedImportIds(selection);
                  setImportPreviewOpen(true);
                  (event.target as HTMLInputElement).value = '';
                }}
                className="hidden"
              />
            </label>
            <button
              type="button"
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
                  end: monthEnd.getTime(),
                });
              }}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 transition-colors hover:border-blue-500 hover:text-blue-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300 dark:hover:text-blue-400"
            >
              Generate PDF report
            </button>
          </div>
        </InvestCard>

        <div className="space-y-4">
          <InvestCard className="p-5">
            <SectionTitle eyebrow="Security" title="Account and reset" description="Use reset carefully. It permanently removes transactions, budgets, and goals." />
            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full rounded-2xl bg-red-600 px-4 py-3 font-medium text-white transition-colors hover:bg-red-700"
              >
                Reset all data
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 transition-colors hover:border-gray-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300"
              >
                Sign out
              </button>
            </div>
          </InvestCard>

          <InvestCard className="p-5">
            <SectionTitle eyebrow="About" title="SpendWise" description="A focused finance workspace for tracking, planning, and investing without noisy popups." />
            <div className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p>Version 1.0.0</p>
              <p>All data is stored securely with Firebase, and alerts remain panel-only unless you explicitly opt into them.</p>
            </div>
          </InvestCard>
        </div>
      </div>

      <Modal isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)} title="Reset All Data?">
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            This will permanently delete all transactions, budgets, and goals. Custom categories stay in settings until you remove them separately.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300 sm:flex-1"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                resetData();
                setShowResetConfirm(false);
              }}
              className="w-full rounded-2xl bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700 sm:flex-1"
            >
              Reset everything
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showSavingsCalculator} onClose={() => setShowSavingsCalculator(false)} title="Savings Calculator">
        <SavingsCalculator />
      </Modal>

      <Modal isOpen={showReceiptScanner} onClose={() => setShowReceiptScanner(false)} title="Receipt Scanner">
        <ReceiptScanner />
      </Modal>

      <Modal isOpen={showRecurringTransactions} onClose={() => setShowRecurringTransactions(false)} title="Recurring Transactions">
        <RecurringTransactions />
      </Modal>

      <Modal isOpen={showCategoryTrends} onClose={() => setShowCategoryTrends(false)} title="Category Trends">
        <CategoryTrends />
      </Modal>

      <Modal isOpen={showAchievements} onClose={() => setShowAchievements(false)} title="Achievements">
        <Achievements />
      </Modal>

      <Modal isOpen={showCustomAlerts} onClose={() => setShowCustomAlerts(false)} title="Custom Alerts">
        <CustomAlerts />
      </Modal>

      <Modal isOpen={showBills} onClose={() => setShowBills(false)} title="Bills & Reminders">
        <Bills />
      </Modal>

      <Modal isOpen={importPreviewOpen} onClose={() => setImportPreviewOpen(false)} title={`Import Preview (${previewItems.length})`}>
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">Review imported transactions. Duplicates are detected and unchecked by default.</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_auto_auto_auto_auto] xl:items-center">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700 dark:text-gray-300">Fuzzy threshold</span>
              <input type="range" min={0.5} max={0.98} step={0.02} value={fuzzyThreshold} onChange={(event) => setFuzzyThreshold(parseFloat(event.target.value))} />
              <span className="text-sm text-gray-700 dark:text-gray-300">{Math.round(fuzzyThreshold * 100)}%</span>
            </div>
            <input
              type="number"
              min={0}
              max={30}
              value={dateWindowDays}
              onChange={(event) => setDateWindowDays(parseInt(event.target.value || '0', 10))}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
            <input
              type="number"
              min={0}
              max={100}
              value={amountTolerancePercent}
              onChange={(event) => setAmountTolerancePercent(parseInt(event.target.value || '0', 10))}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() => {
                const dupMap = detectFuzzyDuplicates(transactions, previewItems, { threshold: fuzzyThreshold, dateWindowDays, amountTolerancePercent });
                const selection: Record<string, boolean> = {};
                previewItems.forEach((item: any) => {
                  selection[item.id] = !dupMap[item.id];
                });
                setDuplicateMap(dupMap);
                setSelectedImportIds(selection);
              }}
              className="rounded-xl bg-gray-900 px-4 py-2 text-white dark:bg-white dark:text-black"
            >
              Re-run
            </button>
          </div>

          <div className="max-h-72 space-y-3 overflow-y-auto">
            {previewItems.map((item) => (
              <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
                <input
                  type="checkbox"
                  checked={!!selectedImportIds[item.id]}
                  onChange={(event) => setSelectedImportIds((current) => ({ ...current, [item.id]: event.target.checked }))}
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <div className="grid gap-2 sm:grid-cols-[1fr_9rem]">
                    <input
                      type="text"
                      value={item.description || item.category || ''}
                      onChange={(event) => setPreviewItems((current) => current.map((preview) => (preview.id === item.id ? { ...preview, description: event.target.value } : preview)))}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                      placeholder="Description"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={String(item.amount || '')}
                      onChange={(event) => setPreviewItems((current) => current.map((preview) => (preview.id === item.id ? { ...preview, amount: parseFloat(event.target.value || '0') } : preview)))}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    />
                  </div>

                  <div className="grid gap-2 sm:grid-cols-[11rem_1fr_10rem]">
                    <input
                      type="date"
                      value={new Date(item.date).toISOString().slice(0, 10)}
                      onChange={(event) => setPreviewItems((current) => current.map((preview) => (preview.id === item.id ? { ...preview, date: Date.parse(event.target.value) } : preview)))}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={item.category || ''}
                      onChange={(event) => setPreviewItems((current) => current.map((preview) => (preview.id === item.id ? { ...preview, category: event.target.value } : preview)))}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                      placeholder="Category"
                    />
                    <input
                      type="text"
                      value={(item.tags || []).join(';')}
                      onChange={(event) => setPreviewItems((current) => current.map((preview) => (preview.id === item.id ? { ...preview, tags: event.target.value.split(';').map((tag: string) => tag.trim()).filter(Boolean) } : preview)))}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                      placeholder="tags;semi;colon"
                    />
                  </div>

                  {duplicateMap[item.id] && <div className="text-xs text-amber-600 dark:text-amber-400">{duplicateMap[item.id]}</div>}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setImportPreviewOpen(false)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300 sm:flex-1"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                const toImport = previewItems.filter((item) => selectedImportIds[item.id]);
                if (toImport.length === 0) {
                  notifyUser('No items selected for import');
                  return;
                }
                toImport.forEach((transaction) => addTransaction(transaction));
                notifyUser(`Imported ${toImport.length} transactions`);
                setImportPreviewOpen(false);
                setPreviewItems([]);
                setSelectedImportIds({});
                setDuplicateMap({});
              }}
              className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 sm:flex-1"
            >
              Import Selected
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
