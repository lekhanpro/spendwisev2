
import { Category, PaymentMethod, Transaction, Budget, Goal, Currency } from './types';

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

export const CATEGORY_ICON_PRESETS: Record<Transaction['type'], string[]> = {
  expense: ['🍕', '🏠', '🚗', '🛒', '💡', '🧾', '📚', '🎬', '💪', '🛍️', '🐾', '📦'],
  income: ['💰', '📈', '💹', '🏦', '🏢', '🏅', '🏘️', '🎁', '💻', '↩️', '📱', '✨'],
};

export const CATEGORY_COLOR_SWATCHES = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#6366f1',
  '#84cc16',
  '#f97316',
  '#0ea5e9',
  '#64748b',
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

export const SAMPLE_TRANSACTIONS: Transaction[] = [
  { id: generateId(), type: 'expense', amount: 45.50, category: 'food', paymentMethod: 'credit', date: Date.now() - 86400000, description: 'Dinner at Italian restaurant', tags: [] },
  { id: generateId(), type: 'expense', amount: 120, category: 'groceries', paymentMethod: 'debit', date: Date.now() - 172800000, description: 'Weekly groceries', tags: [] },
  { id: generateId(), type: 'income', amount: 5000, category: 'salary', paymentMethod: 'bank', date: Date.now() - 259200000, description: 'Monthly salary', tags: [] },
  { id: generateId(), type: 'expense', amount: 35, category: 'transport', paymentMethod: 'digital', date: Date.now() - 345600000, description: 'Uber rides', tags: [] },
  { id: generateId(), type: 'expense', amount: 89.99, category: 'entertainment', paymentMethod: 'credit', date: Date.now() - 432000000, description: 'Concert tickets', tags: [] },
  { id: generateId(), type: 'expense', amount: 150, category: 'bills', paymentMethod: 'bank', date: Date.now() - 518400000, description: 'Electricity bill', tags: [] },
];

export const SAMPLE_BUDGETS: Budget[] = [
  { id: generateId(), category: 'food', limit: 500, period: 'monthly', startDate: Date.now(), notifications: true },
  { id: generateId(), category: 'transport', limit: 200, period: 'monthly', startDate: Date.now(), notifications: true },
];

export const SAMPLE_GOALS: Goal[] = [
  { id: generateId(), name: 'Emergency Fund', targetAmount: 10000, currentAmount: 3500, deadline: Date.now() + 86400000 * 180, priority: 'high' },
  { id: generateId(), name: 'Vacation to Japan', targetAmount: 5000, currentAmount: 1200, deadline: Date.now() + 86400000 * 365, priority: 'medium' },
];
