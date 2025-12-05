
import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Icons } from './Icons';
import { Goal } from '../types';
import { GoalForm } from './GoalForm';
import { Modal } from './Modal';

export const Goals: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal, formatCurrency } = useContext(AppContext)!;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  const handleSave = (goalData: Goal) => {
    if (editing) {
      updateGoal(goalData);
    } else {
      addGoal(goalData);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleAddToGoal = (goal: Goal, amount: number) => {
    updateGoal({ ...goal, currentAmount: goal.currentAmount + amount });
  };

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  return (
    <div className="p-4 pb-24 space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Savings Goals</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg hover:bg-blue-600 transition-colors"
        >
          <Icons.Plus /> Add
        </button>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <p className="text-blue-100 text-sm">Total Savings Progress</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(totalSaved)} <span className="text-lg font-normal text-blue-200">/ {formatCurrency(totalTarget)}</span></p>
        <div className="w-full bg-white/20 rounded-full h-3 mt-4">
          <div className="bg-white rounded-full h-3 transition-all" style={{ width: `${totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0}%` }} />
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map(goal => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const daysLeft = Math.ceil((goal.deadline - Date.now()) / 86400000);
          const monthlyNeeded = daysLeft > 0 ? (goal.targetAmount - goal.currentAmount) / (daysLeft / 30) : 0;

          return (
            <div key={goal.id} className="bg-white dark:bg-slate-800 shadow-md rounded-2xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-800 dark:text-white">{goal.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      goal.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300' :
                      goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-300' :
                      'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300'
                    }`}>
                      {goal.priority}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                    <Icons.Calendar /> {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setEditing(goal); setShowForm(true); }}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                  >
                    <Icons.Edit />
                  </button>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400"
                  >
                    <Icons.Trash />
                  </button>
                </div>
              </div>

              <div className="flex items-end justify-between mb-2">
                <div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(goal.currentAmount)}</p>
                  <p className="text-sm text-slate-400">of {formatCurrency(goal.targetAmount)}</p>
                </div>
                <p className={`text-2xl font-bold ${progress >= 100 ? 'text-green-500' : 'text-blue-500'}`}>
                  {progress.toFixed(0)}%
                </p>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-3">
                <div
                  className={`h-3 rounded-full transition-all ${progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>

              {progress < 100 && monthlyNeeded > 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  Save {formatCurrency(monthlyNeeded)}/month to reach your goal
                </p>
              )}

              {progress >= 100 ? (
                <div className="flex items-center gap-2 text-green-500">
                  <Icons.Check />
                  <span className="font-medium">Goal achieved! 🎉</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  {[50, 100, 200].map(amount => (
                    <button
                      key={amount}
                      onClick={() => handleAddToGoal(goal, amount)}
                      className="flex-1 py-2 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      +{formatCurrency(amount)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-2">🎯</p>
            <p className="text-slate-500 dark:text-slate-400">No savings goals yet</p>
            <button onClick={() => setShowForm(true)} className="mt-2 text-blue-500 font-medium">Create your first goal</button>
          </div>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing ? 'Edit Goal' : 'New Goal'}>
        <GoalForm
          goal={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      </Modal>
    </div>
  );
};
