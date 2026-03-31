export type TransactionType = 'income' | 'expense';
export type Period = 'weekly' | 'monthly';
export type Priority = 'low' | 'medium' | 'high';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  paymentMethod: string;
  date: number;
  description: string;
  tags: string[];
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  period: Period;
  startDate: number;
  notifications: boolean;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: number;
  priority: Priority;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export interface AppContextType {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  categories: Category[];
  addTransaction: (t: Transaction) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (b: Budget) => void;
  updateBudget: (b: Budget) => void;
  deleteBudget: (id: string) => void;
  addGoal: (g: Goal) => void;
  updateGoal: (g: Goal) => void;
  deleteGoal: (id: string) => void;
  session: any;
  handleLogout: () => Promise<void>;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatCurrency: (amount: number) => string;
}
