// lib/database.ts - Firebase Realtime Database service
import { app } from "./firebase";
import { getDatabase, ref, set, get, onValue, off, DataSnapshot } from "firebase/database";
import { Transaction, Budget, Goal, Currency } from "../types";

// Initialize Realtime Database
export const database = getDatabase(app);

// Helper to get user data path
const getUserPath = (userId: string) => `users/${userId}`;

// ============ TRANSACTIONS ============
export const saveTransactions = async (userId: string, transactions: Transaction[]) => {
    const transactionsRef = ref(database, `${getUserPath(userId)}/transactions`);
    await set(transactionsRef, transactions);
};

export const getTransactions = async (userId: string): Promise<Transaction[]> => {
    const transactionsRef = ref(database, `${getUserPath(userId)}/transactions`);
    const snapshot = await get(transactionsRef);
    return snapshot.exists() ? snapshot.val() : [];
};

export const subscribeToTransactions = (
    userId: string,
    callback: (transactions: Transaction[]) => void
) => {
    const transactionsRef = ref(database, `${getUserPath(userId)}/transactions`);
    onValue(transactionsRef, (snapshot: DataSnapshot) => {
        callback(snapshot.exists() ? snapshot.val() : []);
    });
    return () => off(transactionsRef);
};

// ============ BUDGETS ============
export const saveBudgets = async (userId: string, budgets: Budget[]) => {
    const budgetsRef = ref(database, `${getUserPath(userId)}/budgets`);
    await set(budgetsRef, budgets);
};

export const getBudgets = async (userId: string): Promise<Budget[]> => {
    const budgetsRef = ref(database, `${getUserPath(userId)}/budgets`);
    const snapshot = await get(budgetsRef);
    return snapshot.exists() ? snapshot.val() : [];
};

export const subscribeToBudgets = (
    userId: string,
    callback: (budgets: Budget[]) => void
) => {
    const budgetsRef = ref(database, `${getUserPath(userId)}/budgets`);
    onValue(budgetsRef, (snapshot: DataSnapshot) => {
        callback(snapshot.exists() ? snapshot.val() : []);
    });
    return () => off(budgetsRef);
};

// ============ GOALS ============
export const saveGoals = async (userId: string, goals: Goal[]) => {
    const goalsRef = ref(database, `${getUserPath(userId)}/goals`);
    await set(goalsRef, goals);
};

export const getGoals = async (userId: string): Promise<Goal[]> => {
    const goalsRef = ref(database, `${getUserPath(userId)}/goals`);
    const snapshot = await get(goalsRef);
    return snapshot.exists() ? snapshot.val() : [];
};

export const subscribeToGoals = (
    userId: string,
    callback: (goals: Goal[]) => void
) => {
    const goalsRef = ref(database, `${getUserPath(userId)}/goals`);
    onValue(goalsRef, (snapshot: DataSnapshot) => {
        callback(snapshot.exists() ? snapshot.val() : []);
    });
    return () => off(goalsRef);
};

// ============ SETTINGS ============
export const saveSettings = async (
    userId: string,
    settings: { darkMode: boolean; currency: Currency }
) => {
    const settingsRef = ref(database, `${getUserPath(userId)}/settings`);
    await set(settingsRef, settings);
};

export const getSettings = async (
    userId: string
): Promise<{ darkMode: boolean; currency: Currency } | null> => {
    const settingsRef = ref(database, `${getUserPath(userId)}/settings`);
    const snapshot = await get(settingsRef);
    return snapshot.exists() ? snapshot.val() : null;
};

export const subscribeToSettings = (
    userId: string,
    callback: (settings: { darkMode: boolean; currency: Currency } | null) => void
) => {
    const settingsRef = ref(database, `${getUserPath(userId)}/settings`);
    onValue(settingsRef, (snapshot: DataSnapshot) => {
        callback(snapshot.exists() ? snapshot.val() : null);
    });
    return () => off(settingsRef);
};
