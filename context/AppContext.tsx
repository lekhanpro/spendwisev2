
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AppContextType, Transaction, Budget, Goal, Category, ViewType, Currency } from '../types';
import { DEFAULT_CATEGORIES, SAMPLE_TRANSACTIONS, SAMPLE_BUDGETS, SAMPLE_GOALS, SUPPORTED_CURRENCIES } from '../constants';
import { auth } from '../lib/auth';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  saveTransactions,
  saveBudgets,
  saveGoals,
  saveSettings,
  subscribeToTransactions,
  subscribeToBudgets,
  subscribeToGoals,
  subscribeToSettings
} from '../lib/database';

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [currency, setCurrency] = useState<Currency>(SUPPORTED_CURRENCIES[0]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) {
        // Clear data on logout
        setTransactions([]);
        setBudgets([]);
        setGoals([]);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to realtime data when user is logged in
  useEffect(() => {
    if (!firebaseUser) {
      setIsLoading(false);
      return;
    }

    const userId = firebaseUser.uid;
    setIsLoading(true);

    // Subscribe to transactions
    const unsubTransactions = subscribeToTransactions(userId, (data) => {
      setTransactions(Array.isArray(data) ? data : []);
    });

    // Subscribe to budgets
    const unsubBudgets = subscribeToBudgets(userId, (data) => {
      setBudgets(Array.isArray(data) ? data : []);
    });

    // Subscribe to goals
    const unsubGoals = subscribeToGoals(userId, (data) => {
      setGoals(Array.isArray(data) ? data : []);
    });

    // Subscribe to settings
    const unsubSettings = subscribeToSettings(userId, (settings) => {
      if (settings) {
        setDarkMode(settings.darkMode ?? false);
        setCurrency(settings.currency ?? SUPPORTED_CURRENCIES[0]);
      }
      setIsLoading(false);
    });

    // Set a timeout for loading state
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

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Save transactions to Firebase
  const syncTransactions = useCallback(async (newTransactions: Transaction[]) => {
    if (firebaseUser && !isSyncing) {
      try {
        await saveTransactions(firebaseUser.uid, newTransactions);
      } catch (error) {
        console.error('Failed to sync transactions:', error);
      }
    }
  }, [firebaseUser, isSyncing]);

  // Save budgets to Firebase
  const syncBudgets = useCallback(async (newBudgets: Budget[]) => {
    if (firebaseUser && !isSyncing) {
      try {
        await saveBudgets(firebaseUser.uid, newBudgets);
      } catch (error) {
        console.error('Failed to sync budgets:', error);
      }
    }
  }, [firebaseUser, isSyncing]);

  // Save goals to Firebase
  const syncGoals = useCallback(async (newGoals: Goal[]) => {
    if (firebaseUser && !isSyncing) {
      try {
        await saveGoals(firebaseUser.uid, newGoals);
      } catch (error) {
        console.error('Failed to sync goals:', error);
      }
    }
  }, [firebaseUser, isSyncing]);

  // Save settings to Firebase
  const syncSettings = useCallback(async (newDarkMode: boolean, newCurrency: Currency) => {
    if (firebaseUser) {
      try {
        await saveSettings(firebaseUser.uid, { darkMode: newDarkMode, currency: newCurrency });
      } catch (error) {
        console.error('Failed to sync settings:', error);
      }
    }
  }, [firebaseUser]);

  // Transaction operations
  const addTransaction = (transaction: Transaction) => {
    const newTransactions = [transaction, ...transactions];
    setTransactions(newTransactions);
    syncTransactions(newTransactions);
  };

  const updateTransaction = (transaction: Transaction) => {
    const newTransactions = transactions.map(t => t.id === transaction.id ? transaction : t);
    setTransactions(newTransactions);
    syncTransactions(newTransactions);
  };

  const deleteTransaction = (id: string) => {
    const newTransactions = transactions.filter(t => t.id !== id);
    setTransactions(newTransactions);
    syncTransactions(newTransactions);
  };

  // Budget operations
  const addBudget = (budget: Budget) => {
    const newBudgets = [...budgets.filter(b => b.category !== budget.category), budget];
    setBudgets(newBudgets);
    syncBudgets(newBudgets);
  };

  const updateBudget = (budget: Budget) => {
    const newBudgets = budgets.map(b => b.id === budget.id ? budget : b);
    setBudgets(newBudgets);
    syncBudgets(newBudgets);
  };

  const deleteBudget = (id: string) => {
    const newBudgets = budgets.filter(b => b.id !== id);
    setBudgets(newBudgets);
    syncBudgets(newBudgets);
  };

  // Goal operations
  const addGoal = (goal: Goal) => {
    const newGoals = [...goals, goal];
    setGoals(newGoals);
    syncGoals(newGoals);
  };

  const updateGoal = (goal: Goal) => {
    const newGoals = goals.map(g => g.id === goal.id ? goal : g);
    setGoals(newGoals);
    syncGoals(newGoals);
  };

  const deleteGoal = (id: string) => {
    const newGoals = goals.filter(g => g.id !== id);
    setGoals(newGoals);
    syncGoals(newGoals);
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
      setFirebaseUser(null);
      setActiveView('dashboard');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Settings update with sync
  const handleSetDarkMode = (mode: boolean) => {
    setDarkMode(mode);
    syncSettings(mode, currency);
  };

  const handleSetCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    syncSettings(darkMode, newCurrency);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
    }).format(amount);
  };

  const contextValue: AppContextType = {
    transactions, budgets, goals, categories, darkMode, activeView,
    setDarkMode: handleSetDarkMode, setActiveView,
    addTransaction, updateTransaction, deleteTransaction,
    addBudget, updateBudget, deleteBudget,
    addGoal, updateGoal, deleteGoal,
    resetData,
    showTransactionModal, setShowTransactionModal,
    editingTransaction, setEditingTransaction,
    session: firebaseUser ? { user: { id: firebaseUser.uid } } : null,
    handleLogout,
    currency, setCurrency: handleSetCurrency, formatCurrency
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
