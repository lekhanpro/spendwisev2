import React, { useState, useEffect } from 'react';
import { useNotifications, Notification } from '../../context/NotificationContext';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead, dismissNotification } = useNotifications();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (notificationId: string) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    if (isLeftSwipe) {
      dismissNotification(notificationId);
    }
  };

  const groupNotifications = () => {
    const now = Date.now();
    const today: Notification[] = [];
    const thisWeek: Notification[] = [];
    const earlier: Notification[] = [];

    notifications.forEach(notification => {
      const age = now - notification.timestamp;
      const dayInMs = 24 * 60 * 60 * 1000;

      if (age < dayInMs) {
        today.push(notification);
      } else if (age < 7 * dayInMs) {
        thisWeek.push(notification);
      } else {
        earlier.push(notification);
      }
    });

    return { today, thisWeek, earlier };
  };

  const { today, thisWeek, earlier } = groupNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'sip_reminder':
        return '💰';
      case 'savings_milestone':
        return '🎉';
      case 'budget_alert':
        return '⚠️';
      case 'learn_streak':
        return '🔥';
      case 'scheme_deadline':
        return '📅';
      case 'weekly_scheme_tip':
        return '💡';
      default:
        return '📢';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      default:
        return 'border-l-blue-500';
    }
  };

  const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => (
    <div
      className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer ${
        !notification.read ? 'bg-blue-50 dark:bg-slate-700' : ''
      }`}
      onClick={() => markAsRead(notification.id)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => handleTouchEnd(notification.id)}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-slate-900 dark:text-white">
              {notification.title}
            </h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissNotification(notification.id);
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            {notification.message}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            {new Date(notification.timestamp).toLocaleString('en-IN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-slate-50 dark:bg-slate-900 shadow-2xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {notifications.some(n => !n.read) && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <span className="text-6xl mb-4">🔔</span>
              <p className="text-slate-500 dark:text-slate-400">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {today.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                    Today
                  </h4>
                  <div className="space-y-2">
                    {today.map(notification => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </div>
                </div>
              )}

              {thisWeek.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                    This Week
                  </h4>
                  <div className="space-y-2">
                    {thisWeek.map(notification => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </div>
                </div>
              )}

              {earlier.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                    Earlier
                  </h4>
                  <div className="space-y-2">
                    {earlier.map(notification => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
