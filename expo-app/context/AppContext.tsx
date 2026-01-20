import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AppContextType, Transaction, Budget, Goal, Category, Currency } from '../types';
import { DEFAULT_CATEGORIES, SUPPORTED_CURRENCIES } from '../constants';
import { auth } from '../lib/firebase';
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [currency, setCurrency] = useState<Currency>(SUPPORTED_CURRENCIES[0]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (!user) {
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
        setCurrency(settings.currency ?? SUPPORTED_CURRENCIES[0]);
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
  const syncSettings = useCallback(async (newCurrency: Currency) => {
    if (firebaseUser) {
      try {
        await saveSettings(firebaseUser.uid, { darkMode: true, currency: newCurrency });
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

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      setFirebaseUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleSetCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    syncSettings(newCurrency);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
    }).format(amount);
  };

  const contextValue: AppContextType = {
    transactions,
    budgets,
    goals,
    categories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    addGoal,
    updateGoal,
    deleteGoal,
    session: firebaseUser ? { 
      user: { 
        id: firebaseUser.uid, 
        email: firebaseUser.email, 
        displayName: firebaseUser.displayName, 
        photoURL: firebaseUser.photoURL 
      } 
    } : null,
    handleLogout,
    currency,
    setCurrency: handleSetCurrency,
    formatCurrency
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
