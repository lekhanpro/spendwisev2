import React, { useEffect, useMemo, useState } from 'react';
import { InvestCard, MetricPill, SectionTitle } from './InvestUI';

type InvestTab = 'overview' | 'stocks' | 'portfolio' | 'schemes' | 'roadmap';

interface GettingStartedSectionProps {
  monthlyInvestable: number;
  riskBand: string;
  fundedGoals: number;
  totalGoals: number;
  watchlistCount: number;
  onNavigate: (tab: InvestTab) => void;
}

const LESSON_STORAGE_KEY = 'spendwise-invest-lessons-v1';

const lessons = [
  {
    id: 'lesson-foundation',
    duration: '3 min',
    title: 'Start with emergency cash first',
    summary: 'Before chasing returns, make sure your near-term safety net is covered.',
    takeaway: 'Keep short-term cash needs and emergency savings out of volatile assets.',
  },
  {
    id: 'lesson-stocks',
    duration: '4 min',
    title: 'Read a stock card correctly',
    summary: 'Price action, valuation, RSI, and benchmark context should be read together.',
    takeaway: 'Use the stock workbench to combine technical and fundamental context before acting.',
  },
  {
    id: 'lesson-goals',
    duration: '4 min',
    title: 'Invest goal-first, not product-first',
    summary: 'Time horizon should decide asset mix before a stock or scheme is selected.',
    takeaway: 'Link contributions to a goal, then choose equity, debt, or schemes that fit the date.',
  },
  {
    id: 'lesson-tax',
    duration: '3 min',
    title: 'Use tax buckets deliberately',
    summary: 'Tax-saving products should support the portfolio, not dominate it.',
    takeaway: 'Compare ELSS, PPF, NPS, and other schemes against liquidity and lock-in needs.',
  },
];

const tourSteps: Array<{ id: InvestTab; title: string; description: string }> = [
  { id: 'roadmap', title: 'Set your profile', description: 'Capture age, horizon, tax bracket, and investable cash first.' },
  { id: 'portfolio', title: 'Track what you already own', description: 'Add holdings so recommendations and drift checks reflect reality.' },
  { id: 'stocks', title: 'Build a focused watchlist', description: 'Use a few names and study their workbench instead of scanning everything.' },
  { id: 'schemes', title: 'Compare official savings options', description: 'Use schemes when capital protection or tax buckets matter more than upside.' },
];

export const GettingStartedSection: React.FC<GettingStartedSectionProps> = ({
  monthlyInvestable,
  riskBand,
  fundedGoals,
  totalGoals,
  watchlistCount,
  onNavigate,
}) => {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LESSON_STORAGE_KEY);
      setCompletedLessons(stored ? JSON.parse(stored) : []);
    } catch {
      setCompletedLessons([]);
    }
  }, []);

  const markLesson = (lessonId: string) => {
    setCompletedLessons((current) => {
      if (current.includes(lessonId)) {
        return current;
      }
      const next = [...current, lessonId];
      localStorage.setItem(LESSON_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const completionRate = useMemo(
    () => (lessons.length > 0 ? (completedLessons.length / lessons.length) * 100 : 0),
    [completedLessons]
  );

  return (
    <div className="space-y-6">
      <InvestCard className="p-5">
        <SectionTitle
          eyebrow="Start Here"
          title="Guided investing setup"
          description="This starter view keeps the dashboard lighter for new users and walks you through the parts that matter first."
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricPill label="Monthly Investable" value={`₹${monthlyInvestable.toLocaleString('en-IN')}`} />
          <MetricPill label="Risk Band" value={riskBand} tone="warning" />
          <MetricPill label="Watchlist" value={`${watchlistCount} names`} />
          <MetricPill label="Goals Funded" value={`${fundedGoals}/${totalGoals || 0}`} tone="positive" />
          <MetricPill label="Lesson Progress" value={`${completionRate.toFixed(0)}%`} tone="positive" />
        </div>
      </InvestCard>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <InvestCard className="p-5">
          <SectionTitle
            eyebrow="Quick Tour"
            title="Four-stop dashboard tour"
            description="Use this route the first time through instead of jumping straight into every market card."
          />
          <div className="mt-5 space-y-3">
            {tourSteps.map((step, index) => (
              <div key={step.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Step {index + 1}</p>
                    <p className="mt-2 font-semibold text-gray-900 dark:text-white">{step.title}</p>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate(step.id)}
                    className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        </InvestCard>

        <InvestCard className="p-5">
          <SectionTitle
            eyebrow="Starter Lessons"
            title="Short lessons for first-time investors"
            description="These replace the old quiz style with concise, actionable lessons that tie directly to the tools in this dashboard."
          />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {lessons.map((lesson) => {
              const completed = completedLessons.includes(lesson.id);
              return (
                <div key={lesson.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">{lesson.duration}</span>
                    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${completed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:text-gray-300'}`}>
                      {completed ? 'Completed' : 'New'}
                    </span>
                  </div>
                  <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">{lesson.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{lesson.summary}</p>
                  <div className="mt-4 rounded-2xl border border-dashed border-gray-200 px-3 py-3 text-sm text-gray-700 dark:border-zinc-800 dark:text-gray-300">
                    {lesson.takeaway}
                  </div>
                  <button
                    type="button"
                    onClick={() => markLesson(lesson.id)}
                    className="mt-4 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-500 hover:text-blue-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300 dark:hover:text-blue-400"
                  >
                    {completed ? 'Reviewed' : 'Mark complete'}
                  </button>
                </div>
              );
            })}
          </div>
        </InvestCard>
      </div>
    </div>
  );
};
