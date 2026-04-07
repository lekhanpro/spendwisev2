import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AppContext } from './AppContext';
import { FinanceContext } from './FinanceContext';

export type NotificationType = 
  | 'sip_reminder' 
  | 'savings_milestone' 
  | 'budget_alert' 
  | 'learn_streak' 
  | 'scheme_deadline' 
  | 'weekly_scheme_tip';

export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  timestamp: number;
  read: boolean;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

const MAX_NOTIFICATIONS = 50;

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const appContext = useContext(AppContext);
  const financeContext = useContext(FinanceContext);

  // Load notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('spendwise_notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('spendwise_notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      read: false
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      return updated.slice(0, MAX_NOTIFICATIONS);
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Check and generate notifications
  useEffect(() => {
    if (!appContext || !financeContext) return;

    const checkAndGenerateNotifications = () => {
      const now = new Date();
      const today = now.getDate();
      const month = now.getMonth();

      // SIP Reminder (1st of month)
      if (today === 1) {
        const lastSipReminder = notifications.find(
          n => n.type === 'sip_reminder' && 
          new Date(n.timestamp).getMonth() === month
        );
        
        if (!lastSipReminder) {
          addNotification({
            type: 'sip_reminder',
            title: 'SIP Reminder',
            message: 'Time to invest! Don\'t forget your monthly SIP contributions.',
            priority: 'high'
          });
        }
      }

      // Savings Milestone
      const totalSavings = appContext.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) -
        appContext.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const milestones = [10000, 50000, 100000, 200000, 500000];
      milestones.forEach(milestone => {
        if (totalSavings >= milestone) {
          const exists = notifications.find(
            n => n.type === 'savings_milestone' && n.message.includes(`₹${milestone.toLocaleString('en-IN')}`)
          );
          if (!exists) {
            addNotification({
              type: 'savings_milestone',
              title: 'Savings Milestone! 🎉',
              message: `Congratulations! You've saved ₹${milestone.toLocaleString('en-IN')}`,
              priority: 'high'
            });
          }
        }
      });

      // Budget Alert (>80% category spend)
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();

      appContext.budgets.forEach(budget => {
        const spent = appContext.transactions
          .filter(t => 
            t.type === 'expense' && 
            t.category === budget.category && 
            t.date >= monthStart && 
            t.date <= monthEnd
          )
          .reduce((sum, t) => sum + t.amount, 0);

        const percentUsed = (spent / budget.limit) * 100;
        
        if (percentUsed >= 80) {
          const category = appContext.categories.find(c => c.id === budget.category);
          const recentAlert = notifications.find(
            n => n.type === 'budget_alert' && 
            n.message.includes(category?.name || '') &&
            now.getTime() - n.timestamp < 24 * 60 * 60 * 1000
          );
          
          if (!recentAlert) {
            addNotification({
              type: 'budget_alert',
              title: 'Budget Alert',
              message: `You've used ${percentUsed.toFixed(0)}% of your ${category?.name} budget`,
              priority: 'high'
            });
          }
        }
      });

      // Learn Streak
      if (financeContext.learnStreak > 0 && financeContext.learnStreak % 7 === 0) {
        const exists = notifications.find(
          n => n.type === 'learn_streak' && 
          n.message.includes(`${financeContext.learnStreak} days`)
        );
        if (!exists) {
          addNotification({
            type: 'learn_streak',
            title: 'Learning Streak! 🔥',
            message: `Amazing! ${financeContext.learnStreak} days learning streak`,
            priority: 'medium'
          });
        }
      }

      // PPF Deadline (March 31)
      if (month === 2 && today >= 25) {
        const exists = notifications.find(
          n => n.type === 'scheme_deadline' && 
          new Date(n.timestamp).getFullYear() === now.getFullYear()
        );
        if (!exists) {
          addNotification({
            type: 'scheme_deadline',
            title: 'PPF Deadline Approaching',
            message: 'Invest in PPF before March 31 to claim tax benefits for this financial year',
            priority: 'high'
          });
        }
      }

      // Weekly Scheme Tip (Every Monday)
      if (now.getDay() === 1) {
        const lastTip = notifications.find(
          n => n.type === 'weekly_scheme_tip' && 
          now.getTime() - n.timestamp < 6 * 24 * 60 * 60 * 1000
        );
        
        if (!lastTip) {
          const tips = [
            'Start a SIP in Nifty 50 Index Fund for long-term wealth creation',
            'Consider investing in PPF for tax-free returns',
            'Diversify your portfolio across equity, debt, and gold',
            'Review your investment portfolio quarterly',
            'Emergency fund should cover 6 months of expenses'
          ];
          const randomTip = tips[Math.floor(Math.random() * tips.length)];
          
          addNotification({
            type: 'weekly_scheme_tip',
            title: 'Investment Tip',
            message: randomTip,
            priority: 'low'
          });
        }
      }
    };

    checkAndGenerateNotifications();
    const interval = setInterval(checkAndGenerateNotifications, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, [appContext?.transactions, appContext?.budgets, financeContext?.learnStreak]);

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    addNotification
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
