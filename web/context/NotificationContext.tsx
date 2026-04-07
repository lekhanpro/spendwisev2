import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { InvestmentNotificationType } from '../types/investment';

export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
  id: string;
  type: InvestmentNotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  timestamp: number;
  read: boolean;
  dedupeKey?: string;
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

const STORAGE_KEY = 'spendwise-notification-center-v2';
const MAX_NOTIFICATIONS = 60;

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    } catch {
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    setNotifications((current) => {
      if (notification.dedupeKey) {
        const existing = current.find((item) => item.dedupeKey === notification.dedupeKey);
        if (existing) {
          return current;
        }
      }

      const next: Notification = {
        ...notification,
        id: Math.random().toString(36).slice(2, 10),
        timestamp: Date.now(),
        read: false,
      };

      return [next, ...current].slice(0, MAX_NOTIFICATIONS);
    });
  };

  const markAsRead = (id: string) => {
    setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
  };

  const markAllAsRead = () => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  };

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    addNotification,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
