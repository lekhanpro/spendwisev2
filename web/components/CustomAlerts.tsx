import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Icons } from './Icons';
import { generateId } from '../constants';

interface CustomAlert {
  id: string;
  name: string;
  type: 'spending' | 'balance' | 'category' | 'budget';
  condition: 'exceeds' | 'below' | 'equals';
  amount: number;
  category?: string;
  enabled: boolean;
  frequency: 'instant' | 'daily' | 'weekly';
}

export const CustomAlerts: React.FC = () => {
  const { transactions, categories, formatCurrency } = useContext(AppContext)!;
  const [alerts, setAlerts] = useState<CustomAlert[]>(() => {
    const saved = localStorage.getItem('customAlerts');
    return saved ? JSON.parse(saved) : [];
  });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<CustomAlert, 'id'>>({
    name: '',
    type: 'spending',
    condition: 'exceeds',
    amount: 0,
    enabled: true,
    frequency: 'instant'
  });

  const saveAlerts = (data: CustomAlert[]) => {
    setAlerts(data);
    localStorage.setItem('customAlerts', JSON.stringify(data));
  };

  const handleAdd = () => {
    const newAlert: CustomAlert = {
      id: generateId(),
      ...formData
    };
    saveAlerts([...alerts, newAlert]);
    setShowForm(false);
    setFormData({
      name: '',
      type: 'spending',
      condition: 'exceeds',
      amount: 0,
      enabled: true,
      frequency: 'instant'
    });
  };

  const handleDelete = (id: string) => {
    saveAlerts(alerts.filter(a => a.id !== id));
  };

  const toggleAlert = (id: string) => {
    saveAlerts(alerts.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  // Check alerts
  useEffect(() => {
    alerts.filter(a => a.enabled).forEach(alert => {
      const shouldTrigger = checkAlert(alert);
      if (shouldTrigger) {
        showNotification(alert);
      }
    });
  }, [transactions, alerts]);

  const checkAlert = (alert: CustomAlert): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    switch (alert.type) {
      case 'spending': {
        const todaySpending = transactions
          .filter(t => t.type === 'expense' && t.date >= todayStart)
          .reduce((sum, t) => sum + t.amount, 0);
        return checkCondition(todaySpending, alert.condition, alert.amount);
      }
      case 'category': {
        if (!alert.category) return false;
        const categorySpending = transactions
          .filter(t => t.type === 'expense' && t.category === alert.category && t.date >= todayStart)
          .reduce((sum, t) => sum + t.amount, 0);
        return checkCondition(categorySpending, alert.condition, alert.amount);
      }
      case 'balance': {
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const balance = income - expenses;
        return checkCondition(balance, alert.condition, alert.amount);
      }
      default:
        return false;
    }
  };

  const checkCondition = (value: number, condition: string, threshold: number): boolean => {
    switch (condition) {
      case 'exceeds': return value > threshold;
      case 'below': return value < threshold;
      case 'equals': return Math.abs(value - threshold) < 1;
      default: return false;
    }
  };

  const showNotification = (alert: CustomAlert) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('SpendWise Alert', {
        body: `${alert.name} - Check your spending!`,
        icon: '/logo.png'
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">🔔 Custom Alerts</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600"
        >
          {showForm ? 'Cancel' : '+ Add Alert'}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 space-y-3">
          <input
            type="text"
            placeholder="Alert Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
          />
          
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="spending">Daily Spending</option>
            <option value="category">Category Spending</option>
            <option value="balance">Account Balance</option>
          </select>

          {formData.type === 'category' && (
            <select
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="">Select Category</option>
              {categories.filter(c => c.type === 'expense').map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          )}

          <select
            value={formData.condition}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="exceeds">Exceeds</option>
            <option value="below">Below</option>
            <option value="equals">Equals</option>
          </select>

          <input
            type="number"
            placeholder="Amount"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
          />

          <select
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="instant">Instant</option>
            <option value="daily">Daily Summary</option>
            <option value="weekly">Weekly Summary</option>
          </select>

          <button
            onClick={handleAdd}
            className="w-full py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
          >
            Add Alert
          </button>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.map(alert => {
          const cat = alert.category ? categories.find(c => c.id === alert.category) : null;
          return (
            <div
              key={alert.id}
              className={`bg-zinc-900/50 backdrop-blur-md border rounded-2xl p-4 ${
                alert.enabled ? 'border-zinc-800' : 'border-zinc-700 opacity-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white">{alert.name}</p>
                    {cat && <span className="text-sm">{cat.icon}</span>}
                  </div>
                  <p className="text-sm text-gray-400 capitalize">
                    {alert.type} {alert.condition} {formatCurrency(alert.amount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Frequency: {alert.frequency}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      alert.enabled ? 'bg-blue-500' : 'bg-zinc-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        alert.enabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                  >
                    <Icons.Trash />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {alerts.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No custom alerts yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-blue-400 font-medium hover:text-blue-300"
            >
              Create your first alert
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <p className="text-sm text-blue-300">
          💡 <strong>Tip:</strong> Enable browser notifications to receive alerts even when the app is closed.
        </p>
      </div>
    </div>
  );
};
