
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AppContextType, Transaction, Budget, Goal, Category, ViewType, Currency } from '../types';
import { DEFAULT_CATEGORIES, SAMPLE_TRANSACTIONS, SAMPLE_BUDGETS, SAMPLE_GOALS, SUPPORTED_CURRENCIES } from '../constants';
import { supabase } from '../lib/supabase';

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
  const [session, setSession] = useState<any>(null);
  const [currency, setCurrency] = useState<Currency>(SUPPORTED_CURRENCIES[0]);

  // Initialize Auth with timeout safety
  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (mounted) setSession(session);
      } catch (err) {
        console.error("Supabase auth error:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    const timeout = setTimeout(() => {
      if (mounted && isLoading) {
        console.warn("Auth initialization timed out, forcing render");
        setIsLoading(false);
      }
    }, 3000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  // Load data
  useEffect(() => {
    if (!session?.user) {
      if (!isLoading) {
        setTransactions([]);
        setBudgets([]);
        setGoals([]);
      }
      return;
    }

    const loadData = () => {
      try {
        const userId = session.user.id;
        const storedTransactions = localStorage.getItem(`spendwise_transactions_${userId}`);
        const storedBudgets = localStorage.getItem(`spendwise_budgets_${userId}`);
        const storedGoals = localStorage.getItem(`spendwise_goals_${userId}`);
        const storedDarkMode = localStorage.getItem(`spendwise_darkMode_${userId}`);
        const storedCurrency = localStorage.getItem(`spendwise_currency_${userId}`);

        setTransactions(storedTransactions ? JSON.parse(storedTransactions) : SAMPLE_TRANSACTIONS);
        setBudgets(storedBudgets ? JSON.parse(storedBudgets) : SAMPLE_BUDGETS);
        setGoals(storedGoals ? JSON.parse(storedGoals) : SAMPLE_GOALS);
        setDarkMode(storedDarkMode ? JSON.parse(storedDarkMode) : false);
        if (storedCurrency) {
          setCurrency(JSON.parse(storedCurrency));
        }
      } catch (e) {
        console.error("Failed to load data", e);
        setTransactions(SAMPLE_TRANSACTIONS);
        setBudgets(SAMPLE_BUDGETS);
        setGoals(SAMPLE_GOALS);
      }
    };
    loadData();
  }, [session, isLoading]);

  // Sync to storage
  useEffect(() => {
    if (!isLoading && session?.user) {
      localStorage.setItem(`spendwise_transactions_${session.user.id}`, JSON.stringify(transactions));
    }
  }, [transactions, isLoading, session]);

  useEffect(() => {
    if (!isLoading && session?.user) {
      localStorage.setItem(`spendwise_budgets_${session.user.id}`, JSON.stringify(budgets));
    }
  }, [budgets, isLoading, session]);

  useEffect(() => {
    if (!isLoading && session?.user) {
      localStorage.setItem(`spendwise_goals_${session.user.id}`, JSON.stringify(goals));
    }
  }, [goals, isLoading, session]);

  useEffect(() => {
    if (!isLoading) {
      if (session?.user) {
        localStorage.setItem(`spendwise_darkMode_${session.user.id}`, JSON.stringify(darkMode));
        localStorage.setItem(`spendwise_currency_${session.user.id}`, JSON.stringify(currency));
      }
      
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [darkMode, currency, isLoading, session]);

  const addTransaction = (transaction: Transaction) => setTransactions(prev => [transaction, ...prev]);
  const updateTransaction = (transaction: Transaction) => setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
  const deleteTransaction = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id));

  const addBudget = (budget: Budget) => setBudgets(prev => [...prev.filter(b => b.category !== budget.category), budget]);
  const updateBudget = (budget: Budget) => setBudgets(prev => prev.map(b => b.id === budget.id ? budget : b));
  const deleteBudget = (id: string) => setBudgets(prev => prev.filter(b => b.id !== id));

  const addGoal = (goal: Goal) => setGoals(prev => [...prev, goal]);
  const updateGoal = (goal: Goal) => setGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
  const deleteGoal = (id: string) => setGoals(prev => prev.filter(g => g.id !== id));

  const resetData = () => {
    if (session?.user) {
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      localStorage.removeItem(`spendwise_transactions_${session.user.id}`);
      localStorage.removeItem(`spendwise_budgets_${session.user.id}`);
      localStorage.removeItem(`spendwise_goals_${session.user.id}`);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      setSession(null);
      setActiveView('dashboard');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
    }).format(amount);
  };

  const contextValue: AppContextType = {
    transactions, budgets, goals, categories, darkMode, activeView,
    setDarkMode, setActiveView,
    addTransaction, updateTransaction, deleteTransaction,
    addBudget, updateBudget, deleteBudget,
    addGoal, updateGoal, deleteGoal,
    resetData, 
    showTransactionModal, setShowTransactionModal,
    editingTransaction, setEditingTransaction,
    session, handleLogout,
    currency, setCurrency, formatCurrency
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
