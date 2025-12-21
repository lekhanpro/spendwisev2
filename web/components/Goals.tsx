
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
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Savings Goals</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-colors"
        >
          <Icons.Plus /> Add
        </button>
      </div>

      {/* Summary - Glass Effect */}
      <div className="bg-blue-600/20 backdrop-blur-md border border-blue-500/30 rounded-2xl p-6 text-blue-100 shadow-lg">
        <p className="text-blue-200/70 text-sm">Total Savings Progress</p>
        <p className="text-3xl font-bold mt-1 text-white">{formatCurrency(totalSaved)} <span className="text-lg font-normal text-blue-300/70">/ {formatCurrency(totalTarget)}</span></p>
        <div className="w-full bg-blue-900/30 rounded-full h-3 mt-4 overflow-hidden">
          <div className="bg-blue-400 rounded-full h-3 transition-all shadow-[0_0_10px_rgba(96,165,250,0.5)]" style={{ width: `${totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0}%` }} />
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map(goal => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const daysLeft = Math.ceil((goal.deadline - Date.now()) / 86400000);
          const monthlyNeeded = daysLeft > 0 ? (goal.targetAmount - goal.currentAmount) / (daysLeft / 30) : 0;

          return (
            <div key={goal.id} className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 shadow-md rounded-2xl p-4 hover:bg-white/5 transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{goal.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${goal.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        goal.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                          'bg-green-500/10 text-green-400 border-green-500/20'
                      }`}>
                      {goal.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Icons.Calendar /> {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditing(goal); setShowForm(true); }}
                    className="p-2 rounded-lg hover:bg-zinc-700 text-gray-400 hover:text-white transition-colors"
                  >
                    <Icons.Edit />
                  </button>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Icons.Trash />
                  </button>
                </div>
              </div>

              <div className="flex items-end justify-between mb-2">
                <div>
                  <p className="text-2xl font-bold text-white">{formatCurrency(goal.currentAmount)}</p>
                  <p className="text-sm text-gray-500">of {formatCurrency(goal.targetAmount)}</p>
                </div>
                <p className={`text-2xl font-bold ${progress >= 100 ? 'text-green-400' : 'text-blue-400'}`}>
                  {progress.toFixed(0)}%
                </p>
              </div>

              <div className="w-full bg-zinc-800 rounded-full h-3 mb-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all ${progress >= 100 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>

              {progress < 100 && monthlyNeeded > 0 && (
                <p className="text-sm text-gray-400 mb-3">
                  Save <span className="text-white font-medium">{formatCurrency(monthlyNeeded)}/month</span> to reach your goal
                </p>
              )}

              {progress >= 100 ? (
                <div className="flex items-center gap-2 text-green-400 bg-green-500/10 p-2 rounded-xl border border-green-500/20">
                  <Icons.Check />
                  <span className="font-medium">Goal achieved! 🎉</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  {[50, 100, 200].map(amount => (
                    <button
                      key={amount}
                      onClick={() => handleAddToGoal(goal, amount)}
                      className="flex-1 py-2 rounded-xl text-sm font-medium bg-zinc-800 border border-zinc-700 text-gray-300 hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-blue-300 transition-all"
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
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-gray-500">No savings goals yet</p>
            <button onClick={() => setShowForm(true)} className="mt-4 text-blue-400 font-medium hover:text-blue-300">Create your first goal</button>
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
