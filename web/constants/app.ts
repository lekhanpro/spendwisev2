// constants/app.ts
import { Category, PaymentMethod, Currency } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
    { id: 'food', name: 'Food & Dining', icon: '🍕', color: '#f59e0b', type: 'expense' },
    { id: 'rent', name: 'Rent & Housing', icon: '🏠', color: '#2563eb', type: 'expense' },
    { id: 'home', name: 'Home Essentials', icon: '🛋️', color: '#0f766e', type: 'expense' },
    { id: 'transport', name: 'Transport', icon: '🚗', color: '#3b82f6', type: 'expense' },
    { id: 'fuel', name: 'Fuel', icon: '⛽', color: '#1d4ed8', type: 'expense' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#8b5cf6', type: 'expense' },
    { id: 'bills', name: 'Bills & Utilities', icon: '💡', color: '#ef4444', type: 'expense' },
    { id: 'subscriptions', name: 'Subscriptions', icon: '📺', color: '#7c3aed', type: 'expense' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#ec4899', type: 'expense' },
    { id: 'electronics', name: 'Electronics', icon: '💻', color: '#6366f1', type: 'expense' },
    { id: 'health', name: 'Health & Fitness', icon: '💪', color: '#10b981', type: 'expense' },
    { id: 'insurance', name: 'Insurance', icon: '🛡️', color: '#0ea5e9', type: 'expense' },
    { id: 'personal', name: 'Personal Care', icon: '🧴', color: '#db2777', type: 'expense' },
    { id: 'education', name: 'Education', icon: '📚', color: '#6366f1', type: 'expense' },
    { id: 'travel', name: 'Travel', icon: '✈️', color: '#14b8a6', type: 'expense' },
    { id: 'groceries', name: 'Groceries', icon: '🛒', color: '#84cc16', type: 'expense' },
    { id: 'family', name: 'Family & Kids', icon: '👨‍👩‍👧', color: '#f97316', type: 'expense' },
    { id: 'gifts-expense', name: 'Gifts & Donations', icon: '🎁', color: '#d97706', type: 'expense' },
    { id: 'pets', name: 'Pets', icon: '🐾', color: '#16a34a', type: 'expense' },
    { id: 'taxes', name: 'Taxes & Fees', icon: '🧾', color: '#b91c1c', type: 'expense' },
    { id: 'investing-expense', name: 'Investing & SIP', icon: '📊', color: '#0284c7', type: 'expense' },
    { id: 'other', name: 'Other', icon: '📦', color: '#64748b', type: 'expense' },
    { id: 'salary', name: 'Salary', icon: '💰', color: '#10b981', type: 'income' },
    { id: 'freelance', name: 'Freelance', icon: '💻', color: '#3b82f6', type: 'income' },
    { id: 'business', name: 'Business Income', icon: '🏢', color: '#0ea5e9', type: 'income' },
    { id: 'bonus', name: 'Bonus', icon: '🏅', color: '#f59e0b', type: 'income' },
    { id: 'investments', name: 'Investments', icon: '📈', color: '#8b5cf6', type: 'income' },
    { id: 'dividends', name: 'Dividends', icon: '💹', color: '#7c3aed', type: 'income' },
    { id: 'interest', name: 'Interest', icon: '🏦', color: '#14b8a6', type: 'income' },
    { id: 'rental', name: 'Rental Income', icon: '🏘️', color: '#2563eb', type: 'income' },
    { id: 'refunds', name: 'Refunds', icon: '↩️', color: '#06b6d4', type: 'income' },
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

// Theme colors for React Native - matching web app design
export const Colors = {
    light: {
        background: '#000000',
        card: 'rgba(24, 24, 27, 0.5)',
        cardSolid: '#18181b',
        text: '#f8fafc',
        textSecondary: '#9ca3af',
        border: '#27272a',
        primary: '#3b82f6',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
    },
    dark: {
        background: '#000000',
        card: 'rgba(24, 24, 27, 0.5)',
        cardSolid: '#18181b',
        text: '#f8fafc',
        textSecondary: '#9ca3af',
        border: '#27272a',
        primary: '#3b82f6',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
    },
};
