import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Goal } from '../types';
import { buildGoalInsights } from '../lib/financeInsights';
import { Icons } from './Icons';
import { GoalForm } from './GoalForm';
import { Modal } from './Modal';
import { InvestCard, MetricPill, ProgressBar, SectionTitle } from './investment/InvestUI';

export const Goals: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal, formatCurrency } = useContext(AppContext)!;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  const goalInsights = useMemo(() => buildGoalInsights(goals), [goals]);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const fundedGoals = goalInsights.filter((goal) => goal.status === 'achieved').length;
  const behindGoals = goalInsights.filter((goal) => goal.status === 'behind' || goal.status === 'overdue').length;
  const nearestGoal = goalInsights.find((goal) => goal.status !== 'achieved');
  const totalMonthlyNeeded = goalInsights
    .filter((goal) => goal.status !== 'achieved' && goal.daysLeft > 0)
    .reduce((sum, goal) => sum + goal.monthlyNeeded, 0);

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

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Long-range planning</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Savings Goals</h1>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2 font-medium text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-600 sm:w-auto"
        >
          <Icons.Plus /> Add
        </button>
      </div>

      <InvestCard className="overflow-hidden">
        <div className="bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-500 dark:from-zinc-900 dark:via-violet-950 dark:to-blue-950 p-6 text-white relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%)]" />
          <div className="relative z-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.2em] text-white/75">Goal Progress</p>
                <h2 className="mt-2 break-words text-3xl font-bold sm:text-4xl">{formatCurrency(totalSaved)}</h2>
                <p className="text-white/85 mt-3">
                  Out of {formatCurrency(totalTarget)} targeted across all savings goals.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <MetricPill label="Funded" value={`${fundedGoals}/${goals.length || 0}`} tone="positive" />
                <MetricPill label="Behind" value={`${behindGoals}`} tone={behindGoals > 0 ? 'warning' : 'positive'} />
                <MetricPill label="Needed / Month" value={formatCurrency(totalMonthlyNeeded)} tone="warning" />
                <MetricPill label="Nearest" value={nearestGoal ? nearestGoal.name : 'None'} />
              </div>
            </div>
          </div>
        </div>
      </InvestCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricPill label="Total Target" value={formatCurrency(totalTarget)} />
        <MetricPill label="Saved" value={formatCurrency(totalSaved)} tone="positive" />
        <MetricPill label="Remaining" value={formatCurrency(Math.max(0, totalTarget - totalSaved))} tone="warning" />
        <MetricPill label="Completion" value={`${totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0}%`} tone="positive" />
      </div>

      <div className="space-y-4">
        {goalInsights.map((insight) => {
          const baseGoal = goals.find((goal) => goal.id === insight.id);
          if (!baseGoal) return null;

          const statusTone =
            insight.status === 'achieved'
              ? 'positive'
              : insight.status === 'behind' || insight.status === 'overdue'
                ? 'negative'
                : insight.status === 'watch'
                  ? 'warning'
                  : 'neutral';

          return (
            <InvestCard key={insight.id} className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="break-words text-xl font-semibold text-gray-900 dark:text-white">{insight.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          insight.priority === 'high'
                            ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30'
                            : insight.priority === 'medium'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30'
                        }`}>
                          {insight.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {insight.daysLeft > 0 ? `${insight.daysLeft} days remaining` : 'Deadline has passed'}
                      </p>
                    </div>
                    <div className="flex gap-1 self-start shrink-0 sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(baseGoal);
                          setShowForm(true);
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        <Icons.Edit />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteGoal(insight.id)}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricPill label="Saved" value={formatCurrency(insight.currentAmount)} tone="positive" />
                    <MetricPill label="Target" value={formatCurrency(insight.targetAmount)} />
                    <MetricPill label="Remaining" value={formatCurrency(insight.remaining)} tone="warning" />
                    <MetricPill label="Needed / Month" value={formatCurrency(insight.monthlyNeeded)} tone={statusTone} />
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Current progress</span>
                      <span className={`font-semibold ${insight.status === 'achieved' ? 'text-emerald-500' : insight.status === 'behind' || insight.status === 'overdue' ? 'text-red-500' : insight.status === 'watch' ? 'text-amber-500' : 'text-blue-500'}`}>
                        {insight.progress.toFixed(0)}%
                      </span>
                    </div>
                    <ProgressBar
                      value={Math.min(100, insight.progress)}
                      tone={insight.status === 'achieved' ? 'emerald' : insight.status === 'behind' || insight.status === 'overdue' ? 'red' : insight.status === 'watch' ? 'amber' : 'blue'}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                      Target pace says you should be around {insight.targetProgress.toFixed(0)}% by now.
                    </p>
                  </div>
                </div>

                <div className="w-full rounded-3xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40 lg:w-56">
                  <SectionTitle eyebrow="Status" title={insight.status.replace('-', ' ')} />
                  {insight.status === 'achieved' ? (
                    <div className="mt-4 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-4">
                      <p className="text-sm text-emerald-800 dark:text-emerald-200">This goal is fully funded.</p>
                    </div>
                  ) : (
                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {[100, 250, 500].map((amount) => (
                        <button
                          type="button"
                          key={amount}
                          onClick={() => handleAddToGoal(baseGoal, amount)}
                          className="py-2 rounded-xl text-sm font-medium bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          +{formatCurrency(amount)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </InvestCard>
          );
        })}

        {goals.length === 0 && (
          <InvestCard className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-zinc-800">
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400">No savings goals yet.</p>
            <button type="button" onClick={() => setShowForm(true)} className="mt-4 text-blue-600 dark:text-blue-400 font-medium">
              Create your first goal
            </button>
          </InvestCard>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing ? 'Edit Goal' : 'New Goal'}>
        <GoalForm goal={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
      </Modal>
    </div>
  );
};
