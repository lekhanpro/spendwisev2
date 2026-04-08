import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/auth';
import {
  saveBudgets,
  saveGoals,
  saveSettings,
  saveTransactions,
  subscribeToBudgets,
  subscribeToGoals,
  subscribeToSettings,
  subscribeToTransactions,
} from '../lib/database';
import { DEFAULT_CATEGORIES, SUPPORTED_CURRENCIES, generateId } from '../constants';
import { AppContextType, AppNotification, Budget, Category, Currency, Goal, Transaction, UserSettings, ViewType } from '../types';

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [currency, setCurrency] = useState<Currency>(SUPPORTED_CURRENCIES[0]);
  const [isSyncing] = useState(false);

  const categories = useMemo(() => [...DEFAULT_CATEGORIES, ...customCategories], [customCategories]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setFirebaseUser(user);
      if (!user) {
        setTransactions([]);
        setBudgets([]);
        setGoals([]);
        setCustomCategories([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!firebaseUser) {
      setIsLoading(false);
      return;
    }

    const userId = firebaseUser.uid;
    setIsLoading(true);

    const unsubTransactions = subscribeToTransactions(userId, (data) => {
      setTransactions(Array.isArray(data) ? data : []);
    });

    const unsubBudgets = subscribeToBudgets(userId, (data) => {
      setBudgets(Array.isArray(data) ? data : []);
    });

    const unsubGoals = subscribeToGoals(userId, (data) => {
      setGoals(Array.isArray(data) ? data : []);
    });

    const unsubSettings = subscribeToSettings(userId, (settings) => {
      if (settings) {
        setDarkMode(settings.darkMode ?? true);
        setCurrency(settings.currency ?? SUPPORTED_CURRENCIES[0]);
        setCustomCategories(Array.isArray(settings.customCategories) ? settings.customCategories : []);
      } else {
        setDarkMode(true);
        setCurrency(SUPPORTED_CURRENCIES[0]);
        setCustomCategories([]);
      }
      setIsLoading(false);
    });

    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => {
      unsubTransactions();
      unsubBudgets();
      unsubGoals();
      unsubSettings();
      clearTimeout(timeout);
    };
  }, [firebaseUser]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const syncTransactions = useCallback(async (nextTransactions: Transaction[]) => {
    if (firebaseUser && !isSyncing) {
      try {
        await saveTransactions(firebaseUser.uid, nextTransactions);
      } catch (error) {
        console.error('Failed to sync transactions:', error);
      }
    }
  }, [firebaseUser, isSyncing]);

  const syncBudgets = useCallback(async (nextBudgets: Budget[]) => {
    if (firebaseUser && !isSyncing) {
      try {
        await saveBudgets(firebaseUser.uid, nextBudgets);
      } catch (error) {
        console.error('Failed to sync budgets:', error);
      }
    }
  }, [firebaseUser, isSyncing]);

  const syncGoals = useCallback(async (nextGoals: Goal[]) => {
    if (firebaseUser && !isSyncing) {
      try {
        await saveGoals(firebaseUser.uid, nextGoals);
      } catch (error) {
        console.error('Failed to sync goals:', error);
      }
    }
  }, [firebaseUser, isSyncing]);

  const syncSettings = useCallback(async (settings: UserSettings) => {
    if (firebaseUser) {
      try {
        await saveSettings(firebaseUser.uid, settings);
      } catch (error) {
        console.error('Failed to sync settings:', error);
      }
    }
  }, [firebaseUser]);

  const addTransaction = async (transaction: Transaction) => {
    const nextTransactions = [transaction, ...transactions];
    setTransactions(nextTransactions);
    syncTransactions(nextTransactions);
  };

  const updateTransaction = (transaction: Transaction) => {
    const nextTransactions = transactions.map((item) => (item.id === transaction.id ? transaction : item));
    setTransactions(nextTransactions);
    syncTransactions(nextTransactions);
  };

  const deleteTransaction = (id: string) => {
    const nextTransactions = transactions.filter((item) => item.id !== id);
    setTransactions(nextTransactions);
    syncTransactions(nextTransactions);
  };

  const addBudget = (budget: Budget) => {
    const nextBudgets = [...budgets.filter((item) => item.category !== budget.category), budget];
    setBudgets(nextBudgets);
    syncBudgets(nextBudgets);
  };

  const updateBudget = (budget: Budget) => {
    const nextBudgets = budgets.map((item) => (item.id === budget.id ? budget : item));
    setBudgets(nextBudgets);
    syncBudgets(nextBudgets);
  };

  const deleteBudget = (id: string) => {
    const nextBudgets = budgets.filter((item) => item.id !== id);
    setBudgets(nextBudgets);
    syncBudgets(nextBudgets);
  };

  const addGoal = (goal: Goal) => {
    const nextGoals = [...goals, goal];
    setGoals(nextGoals);
    syncGoals(nextGoals);
  };

  const updateGoal = (goal: Goal) => {
    const nextGoals = goals.map((item) => (item.id === goal.id ? goal : item));
    setGoals(nextGoals);
    syncGoals(nextGoals);
  };

  const deleteGoal = (id: string) => {
    const nextGoals = goals.filter((item) => item.id !== id);
    setGoals(nextGoals);
    syncGoals(nextGoals);
  };

  const addCustomCategory = (categoryInput: Omit<Category, 'id'>) => {
    const normalizedName = categoryInput.name.trim();
    if (!normalizedName) {
      return null;
    }

    const existing = categories.find(
      (category) => category.type === categoryInput.type && category.name.trim().toLowerCase() === normalizedName.toLowerCase()
    );

    if (existing) {
      return existing;
    }

    const nextCategory: Category = {
      ...categoryInput,
      id: `custom-${generateId()}`,
      name: normalizedName,
      isCustom: true,
    };

    const nextCustomCategories = [...customCategories, nextCategory];
    setCustomCategories(nextCustomCategories);
    syncSettings({ darkMode, currency, customCategories: nextCustomCategories });
    return nextCategory;
  };

  const removeCustomCategory = (id: string) => {
    const nextCustomCategories = customCategories.filter((category) => category.id !== id);
    setCustomCategories(nextCustomCategories);
    syncSettings({ darkMode, currency, customCategories: nextCustomCategories });
  };

  const resetData = () => {
    if (firebaseUser) {
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      syncTransactions([]);
      syncBudgets([]);
      syncGoals([]);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      setCustomCategories([]);
      setFirebaseUser(null);
      setActiveView('dashboard');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSetDarkMode = (mode: boolean) => {
    setDarkMode(mode);
    syncSettings({ darkMode: mode, currency, customCategories });
  };

  const handleSetCurrency = (nextCurrency: Currency) => {
    setCurrency(nextCurrency);
    syncSettings({ darkMode, currency: nextCurrency, customCategories });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
    }).format(amount);

  const [appNotifications, setAppNotifications] = useState<AppNotification[]>([]);

  const unreadCount = appNotifications.filter(n => !n.read).length;

  const addNotification = useCallback((n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    setAppNotifications(prev => [
      { ...n, id: generateId(), timestamp: Date.now(), read: false },
      ...prev.slice(0, 49),
    ]);
  }, []);

  const markNotificationsRead = useCallback(() => {
    setAppNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const contextValue: AppContextType = {
    transactions,
    budgets,
    goals,
    categories,
    customCategories,
    darkMode,
    activeView,
    setDarkMode: handleSetDarkMode,
    setActiveView,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    addGoal,
    updateGoal,
    deleteGoal,
    resetData,
    showTransactionModal,
    setShowTransactionModal,
    editingTransaction,
    setEditingTransaction,
    session: firebaseUser
      ? {
          user: {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          },
        }
      : null,
    handleLogout,
    currency,
    setCurrency: handleSetCurrency,
    formatCurrency,
    addCustomCategory,
    removeCustomCategory,
    notifications: appNotifications,
    unreadCount,
    addNotification,
    markNotificationsRead,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center animate-pulse">
          <div className="text-6xl mb-4">💰</div>
          <p className="text-slate-500 dark:text-slate-400">Loading SpendWise...</p>
        </div>
      </div>
    );
  }

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
