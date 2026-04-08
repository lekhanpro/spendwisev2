// components/NotificationCenter.tsx - In-app notification bell + toasts
import React, { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { AppNotification } from '../types';

// ─── Toast Portal ─────────────────────────────────────────────────────────────

interface Toast extends AppNotification {
  removing?: boolean;
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  const toastColors: Record<string, string> = {
    budget_exceeded: 'border-red-500 bg-red-50 dark:bg-red-950/40',
    budget_alert: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30',
    goal_achieved: 'border-green-500 bg-green-50 dark:bg-green-950/30',
    goal_progress: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30',
    savings_milestone: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
    tip: 'border-amber-400 bg-amber-50 dark:bg-amber-950/30',
    info: 'border-gray-400 bg-gray-50 dark:bg-zinc-800',
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[92vw] max-w-sm pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3 rounded-xl border-l-4 shadow-lg backdrop-blur-sm transition-all duration-300 animate-slide-down ${toastColors[toast.type] || toastColors.info}`}
        >
          <span className="text-xl flex-shrink-0 mt-0.5">{toast.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{toast.title}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{toast.message}</p>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mt-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

// ─── Notification Bell + Dropdown ─────────────────────────────────────────────

export const NotificationBell: React.FC = () => {
  const { notifications, markNotificationsRead, unreadCount } = useContext(AppContext)!;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen(v => !v);
    if (!open && unreadCount > 0) markNotificationsRead();
  };

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const typeColors: Record<string, string> = {
    budget_exceeded: 'text-red-500',
    budget_alert: 'text-yellow-500',
    goal_achieved: 'text-green-500',
    goal_progress: 'text-blue-500',
    savings_milestone: 'text-emerald-500',
    tip: 'text-amber-500',
    info: 'text-gray-500',
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className={`relative p-2 rounded-xl transition-colors ${open ? 'bg-blue-100 dark:bg-zinc-800 text-blue-600 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-400'}`}
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-zinc-800">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={markNotificationsRead}
                className="text-xs text-blue-500 hover:text-blue-600 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-800">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <span className="text-3xl">🔔</span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 20).map(n => (
                <div key={n.id} className={`flex gap-3 px-4 py-3 ${!n.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}>
                  <span className="text-lg flex-shrink-0">{n.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${typeColors[n.type] || 'text-gray-700 dark:text-gray-300'}`}>{n.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{timeAgo(n.timestamp)}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
