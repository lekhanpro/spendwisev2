
import React, { useState } from 'react';
import { Goal, Priority } from '../types';
import { generateId } from '../constants';

interface GoalFormProps {
  goal: Goal | null;
  onSave: (g: Goal) => void;
  onCancel: () => void;
}

export const GoalForm: React.FC<GoalFormProps> = ({ goal, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Goal>>(goal || {
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    deadline: new Date(Date.now() + 86400000 * 90).getTime(),
    priority: 'medium'
  });

  // Helper to handle date input string
  const [deadlineInput, setDeadlineInput] = useState(
    new Date(formData.deadline!).toISOString().split('T')[0]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount) return;
    onSave({
      ...(formData as Goal),
      id: goal?.id || generateId(),
      targetAmount: Number(formData.targetAmount),
      currentAmount: Number(formData.currentAmount) || 0,
      deadline: new Date(deadlineInput).getTime()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Goal Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          placeholder="e.g., Emergency Fund"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Target Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              value={formData.targetAmount || ''}
              onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) })}
              className="w-full pl-10 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Saved So Far</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              value={formData.currentAmount || ''}
              onChange={(e) => setFormData({ ...formData, currentAmount: parseFloat(e.target.value) })}
              className="w-full pl-10 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Target Date</label>
        <input
          type="date"
          value={deadlineInput}
          onChange={(e) => setDeadlineInput(e.target.value)}
          className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all [color-scheme:dark]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
        <div className="flex gap-2">
          {['low', 'medium', 'high'].map(priority => (
            <button
              key={priority}
              type="button"
              onClick={() => setFormData({ ...formData, priority: priority as Priority })}
              className={`flex-1 py-3 rounded-xl font-medium transition-all border ${formData.priority === priority
                ? priority === 'high' ? 'bg-red-500/20 border-red-500/50 text-red-200' : priority === 'medium' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200' : 'bg-green-500/20 border-green-500/50 text-green-200'
                : 'bg-zinc-800/50 border-zinc-700 text-gray-400 hover:bg-zinc-800 hover:text-white'}`}
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-medium bg-zinc-800 border border-zinc-700 text-gray-300 hover:bg-zinc-700 hover:text-white transition-colors">
          Cancel
        </button>
        <button type="submit" className="flex-1 py-3 rounded-xl font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
          {goal ? 'Update' : 'Create'} Goal
        </button>
      </div>
    </form>
  );
};
