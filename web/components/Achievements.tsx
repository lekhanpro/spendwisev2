import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: (data: any) => boolean;
  unlocked: boolean;
  unlockedDate?: number;
  category: 'transactions' | 'budgets' | 'goals' | 'savings' | 'streaks';
}

export const Achievements: React.FC = () => {
  const { transactions, budgets, goals, formatCurrency } = useContext(AppContext)!;
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newUnlocks, setNewUnlocks] = useState<Achievement[]>([]);

  const allAchievements: Omit<Achievement, 'unlocked' | 'unlockedDate'>[] = [
    // Transaction Achievements
    {
      id: 'first_transaction',
      title: 'Getting Started',
      description: 'Add your first transaction',
      icon: '🎯',
      requirement: (data) => data.transactions.length >= 1,
      category: 'transactions'
    },
    {
      id: 'transaction_10',
      title: 'Active Tracker',
      description: 'Record 10 transactions',
      icon: '📝',
      requirement: (data) => data.transactions.length >= 10,
      category: 'transactions'
    },
    {
      id: 'transaction_50',
      title: 'Dedicated User',
      description: 'Record 50 transactions',
      icon: '⭐',
      requirement: (data) => data.transactions.length >= 50,
      category: 'transactions'
    },
    {
      id: 'transaction_100',
      title: 'Finance Master',
      description: 'Record 100 transactions',
      icon: '🏆',
      requirement: (data) => data.transactions.length >= 100,
      category: 'transactions'
    },
    
    // Budget Achievements
    {
      id: 'first_budget',
      title: 'Budget Beginner',
      description: 'Create your first budget',
      icon: '💰',
      requirement: (data) => data.budgets.length >= 1,
      category: 'budgets'
    },
    {
      id: 'budget_master',
      title: 'Budget Master',
      description: 'Create budgets for 5 categories',
      icon: '📊',
      requirement: (data) => data.budgets.length >= 5,
      category: 'budgets'
    },
    {
      id: 'under_budget',
      title: 'Budget Champion',
      description: 'Stay under budget for a month',
      icon: '🎖️',
      requirement: (data) => {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const monthTransactions = data.transactions.filter((t: any) => t.date >= monthStart.getTime());
        return data.budgets.every((b: any) => {
          const spent = monthTransactions
            .filter((t: any) => t.type === 'expense' && t.category === b.category)
            .reduce((sum: number, t: any) => sum + t.amount, 0);
          return spent <= b.limit;
        });
      },
      category: 'budgets'
    },

    // Goals Achievements
    {
      id: 'first_goal',
      title: 'Goal Setter',
      description: 'Create your first savings goal',
      icon: '🎯',
      requirement: (data) => data.goals.length >= 1,
      category: 'goals'
    },
    {
      id: 'goal_achieved',
      title: 'Goal Achiever',
      description: 'Complete a savings goal',
      icon: '🏅',
      requirement: (data) => data.goals.some((g: any) => g.currentAmount >= g.targetAmount),
      category: 'goals'
    },
    {
      id: 'goal_3',
      title: 'Ambitious Saver',
      description: 'Have 3 active goals',
      icon: '🌟',
      requirement: (data) => data.goals.length >= 3,
      category: 'goals'
    },

    // Savings Achievements
    {
      id: 'save_1000',
      title: 'Savings Starter',
      description: 'Save $1,000',
      icon: '💵',
      requirement: (data) => {
        const income = data.transactions.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + t.amount, 0);
        const expenses = data.transactions.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + t.amount, 0);
        return (income - expenses) >= 1000;
      },
      category: 'savings'
    },
    {
      id: 'save_5000',
      title: 'Savings Pro',
      description: 'Save $5,000',
      icon: '💎',
      requirement: (data) => {
        const income = data.transactions.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + t.amount, 0);
        const expenses = data.transactions.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + t.amount, 0);
        return (income - expenses) >= 5000;
      },
      category: 'savings'
    },
    {
      id: 'positive_month',
      title: 'Positive Month',
      description: 'End a month with positive balance',
      icon: '✅',
      requirement: (data) => {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const monthTransactions = data.transactions.filter((t: any) => t.date >= monthStart.getTime());
        const income = monthTransactions.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + t.amount, 0);
        const expenses = monthTransactions.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + t.amount, 0);
        return income > expenses;
      },
      category: 'savings'
    },

    // Streak Achievements
    {
      id: 'week_streak',
      title: 'Week Warrior',
      description: 'Track expenses for 7 days straight',
      icon: '🔥',
      requirement: (data) => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        });
        return last7Days.every(day => 
          data.transactions.some((t: any) => {
            const tDate = new Date(t.date);
            tDate.setHours(0, 0, 0, 0);
            return tDate.getTime() === day;
          })
        );
      },
      category: 'streaks'
    },
    {
      id: 'month_streak',
      title: 'Monthly Master',
      description: 'Track expenses for 30 days straight',
      icon: '🔥🔥',
      requirement: (data) => {
        const last30Days = Array.from({ length: 30 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        });
        return last30Days.every(day => 
          data.transactions.some((t: any) => {
            const tDate = new Date(t.date);
            tDate.setHours(0, 0, 0, 0);
            return tDate.getTime() === day;
          })
        );
      },
      category: 'streaks'
    }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('achievements');
    const savedAchievements: Achievement[] = saved ? JSON.parse(saved) : 
      allAchievements.map(a => ({ ...a, unlocked: false }));

    const data = { transactions, budgets, goals };
    const updated = savedAchievements.map(achievement => {
      const template = allAchievements.find(a => a.id === achievement.id);
      if (!template) return achievement;

      const shouldUnlock = template.requirement(data);
      if (shouldUnlock && !achievement.unlocked) {
        const newAchievement = { ...achievement, unlocked: true, unlockedDate: Date.now() };
        setNewUnlocks(prev => [...prev, newAchievement]);
        return newAchievement;
      }
      return achievement;
    });

    setAchievements(updated);
    localStorage.setItem('achievements', JSON.stringify(updated));
  }, [transactions, budgets, goals]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const progress = (unlockedCount / achievements.length) * 100;

  const categories = ['transactions', 'budgets', 'goals', 'savings', 'streaks'] as const;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">🏆 Achievements</h2>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{unlockedCount}/{achievements.length}</p>
          <p className="text-xs text-gray-400">Unlocked</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Overall Progress</span>
          <span className="text-sm font-semibold text-white">{progress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
          <div 
            className="h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* New Unlocks */}
      {newUnlocks.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-2xl p-4 animate-pulse">
          <p className="text-sm font-semibold text-yellow-300 mb-2">🎉 New Achievement Unlocked!</p>
          {newUnlocks.map(achievement => (
            <div key={achievement.id} className="flex items-center gap-3 text-white">
              <span className="text-2xl">{achievement.icon}</span>
              <div>
                <p className="font-semibold">{achievement.title}</p>
                <p className="text-xs text-yellow-200">{achievement.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Achievements by Category */}
      {categories.map(category => {
        const categoryAchievements = achievements.filter(a => a.category === category);
        const categoryUnlocked = categoryAchievements.filter(a => a.unlocked).length;

        return (
          <div key={category} className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white capitalize">{category}</h3>
              <span className="text-sm text-gray-400">{categoryUnlocked}/{categoryAchievements.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {categoryAchievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-xl border transition-all ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/50'
                      : 'bg-zinc-800/50 border-zinc-700 opacity-50'
                  }`}
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <p className="text-sm font-semibold text-white mb-1">{achievement.title}</p>
                  <p className="text-xs text-gray-400">{achievement.description}</p>
                  {achievement.unlocked && achievement.unlockedDate && (
                    <p className="text-xs text-blue-400 mt-2">
                      {new Date(achievement.unlockedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
