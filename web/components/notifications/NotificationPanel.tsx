import React, { useEffect, useMemo, useState } from 'react';
import { useNotifications, Notification } from '../../context/NotificationContext';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type NotificationFilter = 'all' | 'unread' | 'high' | Notification['type'];

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearReadNotifications,
    clearAllNotifications,
  } = useNotifications();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [filter, setFilter] = useState<NotificationFilter>('all');

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setFilter('all');
    }
  }, [isOpen]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter((notification) => !notification.read);
    if (filter === 'high') return notifications.filter((notification) => notification.priority === 'high');
    return notifications.filter((notification) => notification.type === filter);
  }, [filter, notifications]);

  const groupedNotifications = useMemo(() => {
    const now = Date.now();
    const today: Notification[] = [];
    const thisWeek: Notification[] = [];
    const earlier: Notification[] = [];

    filteredNotifications.forEach((notification) => {
      const age = now - notification.timestamp;
      const dayMs = 24 * 60 * 60 * 1000;

      if (age < dayMs) today.push(notification);
      else if (age < 7 * dayMs) thisWeek.push(notification);
      else earlier.push(notification);
    });

    return { today, thisWeek, earlier };
  }, [filteredNotifications]);

  const summary = useMemo(() => {
    const unread = notifications.filter((notification) => !notification.read).length;
    const high = notifications.filter((notification) => notification.priority === 'high').length;
    const goal = notifications.filter((notification) => notification.type === 'goal').length;
    const market = notifications.filter((notification) => notification.type === 'market').length;

    return { unread, high, goal, market };
  }, [notifications]);

  const handleTouchStart = (event: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(event.targetTouches[0].clientX);
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    setTouchEnd(event.targetTouches[0].clientX);
  };

  const handleTouchEnd = (notificationId: string) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) {
      dismissNotification(notificationId);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'market':
        return '📈';
      case 'portfolio':
        return '🧭';
      case 'goal':
        return '🎯';
      case 'scheme':
        return '🏛️';
      default:
        return '📢';
    }
  };

  const getNotificationTypeLabel = (type: Notification['type']) => {
    switch (type) {
      case 'market':
        return 'Market';
      case 'portfolio':
        return 'Portfolio';
      case 'goal':
        return 'Goals';
      case 'scheme':
        return 'Schemes';
      default:
        return 'System';
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-amber-500';
      default:
        return 'border-l-blue-500';
    }
  };

  const getPriorityBadge = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30';
    }
  };

  const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => (
    <div
      className={`rounded-3xl border-l-4 ${getPriorityColor(notification.priority)} border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-4 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer ${
        !notification.read ? 'ring-1 ring-blue-200 dark:ring-blue-500/30' : ''
      }`}
      onClick={() => markAsRead(notification.id)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => handleTouchEnd(notification.id)}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="break-words font-semibold text-gray-900 dark:text-white">{notification.title}</h4>
                <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${getPriorityBadge(notification.priority)}`}>
                  {notification.priority}
                </span>
                <span className="px-2 py-0.5 rounded-full border text-[11px] font-semibold bg-gray-50 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700">
                  {getNotificationTypeLabel(notification.type)}
                </span>
              </div>
              <p className="mt-2 break-words text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                dismissNotification(notification.id);
              }}
              className="self-start text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            {new Date(notification.timestamp).toLocaleString('en-IN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </div>
  );

  const renderGroup = (title: string, items: Notification[]) => {
    if (!items.length) return null;

    return (
      <div>
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-[0.18em] mb-3">
          {title}
        </h4>
        <div className="space-y-3">
          {items.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-full sm:w-[26rem] bg-slate-50 dark:bg-slate-950 shadow-2xl z-50 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Notifications</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Quiet, panel-only alerts for budgets, goals, portfolio drift, and market tracking.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 p-3 bg-gray-50 dark:bg-zinc-950/50">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Unread</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{summary.unread}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 p-3 bg-gray-50 dark:bg-zinc-950/50">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">High Priority</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{summary.high}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 p-3 bg-gray-50 dark:bg-zinc-950/50">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Goal Alerts</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{summary.goal}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 p-3 bg-gray-50 dark:bg-zinc-950/50">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Market Alerts</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{summary.market}</p>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mt-4">
            {([
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'high', label: 'High' },
              { id: 'goal', label: 'Goals' },
              { id: 'market', label: 'Market' },
              { id: 'portfolio', label: 'Portfolio' },
            ] as Array<{ id: NotificationFilter; label: string }>).map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap border ${
                  filter === item.id
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white dark:bg-zinc-900/60 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            {notifications.some((notification) => !notification.read) && (
              <button type="button" onClick={markAllAsRead} className="text-blue-600 dark:text-blue-400 hover:underline">
                Mark all read
              </button>
            )}
            {notifications.some((notification) => notification.read) && (
              <button type="button" onClick={clearReadNotifications} className="text-gray-600 dark:text-gray-400 hover:underline">
                Clear read
              </button>
            )}
            {notifications.length > 0 && (
              <button type="button" onClick={clearAllNotifications} className="text-red-600 dark:text-red-400 hover:underline">
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <span className="text-6xl mb-4">🔔</span>
              <p className="text-slate-600 dark:text-slate-300 font-medium">No notifications in this view.</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Alerts will appear here only when you opt into them from SpendWise.
              </p>
            </div>
          ) : (
            <>
              {renderGroup('Today', groupedNotifications.today)}
              {renderGroup('This Week', groupedNotifications.thisWeek)}
              {renderGroup('Earlier', groupedNotifications.earlier)}
            </>
          )}
        </div>
      </div>
    </>
  );
};
