import React, { useEffect, useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';

export const Toast: React.FC = () => {
  const { notifications } = useNotifications();
  const [visibleToast, setVisibleToast] = useState<string | null>(null);

  useEffect(() => {
    const highPriorityNotifications = notifications.filter(
      n => n.priority === 'high' && !n.read
    );

    if (highPriorityNotifications.length > 0 && !visibleToast) {
      const latest = highPriorityNotifications[0];
      setVisibleToast(latest.id);

      const timer = setTimeout(() => {
        setVisibleToast(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notifications, visibleToast]);

  const currentNotification = notifications.find(n => n.id === visibleToast);

  if (!currentNotification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <span className="text-2xl">
            {currentNotification.type === 'sip_reminder' && '💰'}
            {currentNotification.type === 'savings_milestone' && '🎉'}
            {currentNotification.type === 'budget_alert' && '⚠️'}
            {currentNotification.type === 'scheme_deadline' && '📅'}
          </span>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 dark:text-white">
              {currentNotification.title}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {currentNotification.message}
            </p>
          </div>
          <button
            onClick={() => setVisibleToast(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
