// context/AppContext.tsx - React Native compatible AppContext
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Transaction, Budget, Goal, Category, ViewType, Currency } from '../types';
import { DEFAULT_CATEGORIES, SUPPORTED_CURRENCIES } from '../constants/app';
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

export interface AppContextType {
    transactions: Transaction[];
    budgets: Budget[];
    goals: Goal[];
    categories: Category[];
    darkMode: boolean;
    activeView: ViewType;
    setDarkMode: (mode: boolean) => void;
    setActiveView: (view: ViewType) => void;
    addTransaction: (t: Transaction) => void;
    updateTransaction: (t: Transaction) => void;
    deleteTransaction: (id: string) => void;
    addBudget: (b: Budget) => void;
    updateBudget: (b: Budget) => void;
    deleteBudget: (id: string) => void;
    addGoal: (g: Goal) => void;
    updateGoal: (g: Goal) => void;
    deleteGoal: (id: string) => void;
    resetData: () => void;
    showTransactionModal: boolean;
    setShowTransactionModal: (show: boolean) => void;
    editingTransaction: Transaction | null;
    setEditingTransaction: (t: Transaction | null) => void;
    user: User | null;
    isLoading: boolean;
    handleLogout: () => Promise<void>;
    currency: Currency;
    setCurrency: (c: Currency) => void;
    formatCurrency: (amount: number) => string;
}

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
    const [user, setUser] = useState<User | null>(null);
    const [currency, setCurrency] = useState<Currency>(SUPPORTED_CURRENCIES[0]);
    const [isSyncing, setIsSyncing] = useState(false);

    // Firebase Auth listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            if (!firebaseUser) {
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
        if (!user) {
            setIsLoading(false);
            return;
        }

        const userId = user.uid;
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
                setDarkMode(settings.darkMode ?? false);
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
    }, [user]);

    // Save functions
    const syncTransactions = useCallback(async (newTransactions: Transaction[]) => {
        if (user && !isSyncing) {
            try {
                await saveTransactions(user.uid, newTransactions);
            } catch (error) {
                console.error('Failed to sync transactions:', error);
            }
        }
    }, [user, isSyncing]);

    const syncBudgets = useCallback(async (newBudgets: Budget[]) => {
        if (user && !isSyncing) {
            try {
                await saveBudgets(user.uid, newBudgets);
            } catch (error) {
                console.error('Failed to sync budgets:', error);
            }
        }
    }, [user, isSyncing]);

    const syncGoals = useCallback(async (newGoals: Goal[]) => {
        if (user && !isSyncing) {
            try {
                await saveGoals(user.uid, newGoals);
            } catch (error) {
                console.error('Failed to sync goals:', error);
            }
        }
    }, [user, isSyncing]);

    const syncSettings = useCallback(async (newDarkMode: boolean, newCurrency: Currency) => {
        if (user) {
            try {
                await saveSettings(user.uid, { darkMode: newDarkMode, currency: newCurrency });
            } catch (error) {
                console.error('Failed to sync settings:', error);
            }
        }
    }, [user]);

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
        if (user) {
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
            setUser(null);
            setActiveView('dashboard');
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

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
        user, isLoading,
        handleLogout,
        currency, setCurrency: handleSetCurrency, formatCurrency
    };

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useApp = () => {
    const context = React.useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
