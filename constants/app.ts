// constants/app.ts
import { Category, PaymentMethod, Currency } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
    { id: 'food', name: 'Food & Dining', icon: '🍕', color: '#f59e0b', type: 'expense' },
    { id: 'transport', name: 'Transport', icon: '🚗', color: '#3b82f6', type: 'expense' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#8b5cf6', type: 'expense' },
    { id: 'bills', name: 'Bills & Utilities', icon: '💡', color: '#ef4444', type: 'expense' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#ec4899', type: 'expense' },
    { id: 'health', name: 'Health & Fitness', icon: '💪', color: '#10b981', type: 'expense' },
    { id: 'education', name: 'Education', icon: '📚', color: '#6366f1', type: 'expense' },
    { id: 'travel', name: 'Travel', icon: '✈️', color: '#14b8a6', type: 'expense' },
    { id: 'groceries', name: 'Groceries', icon: '🛒', color: '#84cc16', type: 'expense' },
    { id: 'other', name: 'Other', icon: '📦', color: '#64748b', type: 'expense' },
    { id: 'salary', name: 'Salary', icon: '💰', color: '#10b981', type: 'income' },
    { id: 'freelance', name: 'Freelance', icon: '💻', color: '#3b82f6', type: 'income' },
    { id: 'investments', name: 'Investments', icon: '📈', color: '#8b5cf6', type: 'income' },
    { id: 'gifts', name: 'Gifts', icon: '🎁', color: '#f59e0b', type: 'income' },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
    { id: 'cash', name: 'Cash', icon: '💵' },
    { id: 'credit', name: 'Credit Card', icon: '💳' },
    { id: 'debit', name: 'Debit Card', icon: '🏧' },
    { id: 'digital', name: 'Digital Wallet', icon: '📱' },
    { id: 'bank', name: 'Bank Transfer', icon: '🏦' },
];

export const SUPPORTED_CURRENCIES: Currency[] = [
    { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
    { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
    { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
    { code: 'AED', symbol: 'AED', name: 'UAE Dirham', locale: 'en-AE' },
];

export const generateId = (): string => Math.random().toString(36).substr(2, 9);

// Theme colors for React Native
export const Colors = {
    light: {
        background: '#f8fafc',
        card: '#ffffff',
        text: '#0f172a',
        textSecondary: '#64748b',
        border: '#e2e8f0',
        primary: '#3b82f6',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
    },
    dark: {
        background: '#0f172a',
        card: '#1e293b',
        text: '#f8fafc',
        textSecondary: '#94a3b8',
        border: '#334155',
        primary: '#60a5fa',
        success: '#34d399',
        danger: '#f87171',
        warning: '#fbbf24',
    },
};
