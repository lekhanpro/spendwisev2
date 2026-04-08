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

interface LessonResource {
  label: string;
  url: string;
  source: string;
}

interface Lesson {
  id: string;
  duration: string;
  title: string;
  summary: string;
  takeaway: string;
  keyTerms: string[];
  whyItMatters: string;
  resources: LessonResource[];
}

const lessons: Lesson[] = [
  {
    id: 'lesson-foundation',
    duration: '3 min',
    title: 'Start with emergency cash first',
    summary: 'Before chasing returns, make sure your near-term safety net is covered.',
    takeaway: 'Keep short-term cash needs and emergency savings out of volatile assets.',
    keyTerms: ['Emergency fund', 'Liquidity', 'Capital preservation'],
    whyItMatters: 'Investing without an emergency fund forces you to sell at the worst time when life happens.',
    resources: [
      { label: 'How to build an emergency fund', url: 'https://www.investopedia.com/personal-finance/how-to-create-emergency-fund/', source: 'Investopedia' },
      { label: 'Emergency fund — why 6 months?', url: 'https://zerodha.com/varsity/chapter/importance-of-an-emergency-corpus/', source: 'Zerodha Varsity' },
      { label: 'RBI — Individual financial planning basics', url: 'https://www.rbi.org.in/commonman/english/scripts/financialplanning.aspx', source: 'RBI' },
    ],
  },
  {
    id: 'lesson-stocks',
    duration: '4 min',
    title: 'Read a stock card correctly',
    summary: 'Price action, valuation, RSI, and benchmark context should be read together.',
    takeaway: 'Use the stock workbench to combine technical and fundamental context before acting.',
    keyTerms: ['P/E ratio', 'RSI', 'Market cap', 'Benchmark comparison'],
    whyItMatters: 'Buying on price alone without valuation context is the most common beginner mistake.',
    resources: [
      { label: 'How to read a stock chart', url: 'https://zerodha.com/varsity/chapter/reading-a-stock-chart/', source: 'Zerodha Varsity' },
      { label: 'P/E ratio explained', url: 'https://www.investopedia.com/terms/p/price-earningsratio.asp', source: 'Investopedia' },
      { label: 'NSE India — Market basics education', url: 'https://www.nseindia.com/education/content/market_basics_investors.htm', source: 'NSE India' },
      { label: 'SEBI investor education portal', url: 'https://investor.sebi.gov.in/', source: 'SEBI' },
    ],
  },
  {
    id: 'lesson-goals',
    duration: '4 min',
    title: 'Invest goal-first, not product-first',
    summary: 'Time horizon should decide asset mix before a stock or scheme is selected.',
    takeaway: 'Link contributions to a goal, then choose equity, debt, or schemes that fit the date.',
    keyTerms: ['Asset allocation', 'Time horizon', 'Goal-based investing', 'Equity vs Debt'],
    whyItMatters: 'Product-first investing leads to portfolio drift — your holdings won\'t match your actual life goals.',
    resources: [
      { label: 'Goal-based investing explained', url: 'https://zerodha.com/varsity/chapter/goal-based-investing/', source: 'Zerodha Varsity' },
      { label: 'Asset allocation for beginners', url: 'https://www.investopedia.com/managing-wealth/achieve-optimal-asset-allocation/', source: 'Investopedia' },
      { label: 'SEBI — Mutual fund basics for retail investors', url: 'https://www.sebi.gov.in/investors/investors-education.html', source: 'SEBI' },
      { label: 'Understanding diversification', url: 'https://www.moneycontrol.com/news/business/mutual-funds/diversification-in-portfolio-why-it-matters-and-how-to-do-it.html', source: 'Moneycontrol' },
    ],
  },
  {
    id: 'lesson-tax',
    duration: '3 min',
    title: 'Use tax buckets deliberately',
    summary: 'Tax-saving products should support the portfolio, not dominate it.',
    takeaway: 'Compare ELSS, PPF, NPS, and other schemes against liquidity and lock-in needs.',
    keyTerms: ['ELSS', 'PPF', 'NPS', '80C deduction', 'Lock-in period', 'LTCG'],
    whyItMatters: 'Over-weighting illiquid tax instruments can leave you cash-strapped when you need funds most.',
    resources: [
      { label: 'ELSS vs PPF vs NPS — a comparison', url: 'https://zerodha.com/varsity/chapter/tax-and-mutual-funds/', source: 'Zerodha Varsity' },
      { label: 'Section 80C deduction guide', url: 'https://cleartax.in/s/80c-tax-deduction', source: 'ClearTax' },
      { label: 'PPF account rules — India Post', url: 'https://www.indiapost.gov.in/Financial/pages/Content/PPF.aspx', source: 'India Post' },
      { label: 'NPS — official pension fund information', url: 'https://www.npscra.nsdl.co.in/', source: 'NSDL NPS' },
      { label: 'Long-term capital gains tax on equity', url: 'https://cleartax.in/s/long-term-capital-gains-ltcg-tax', source: 'ClearTax' },
    ],
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
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

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
      if (current.includes(lessonId)) return current;
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
            description="Each lesson includes key terms, why it matters, and links to trusted external resources."
          />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {lessons.map((lesson) => {
              const completed = completedLessons.includes(lesson.id);
              const isExpanded = expandedLesson === lesson.id;
              return (
                <div key={lesson.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40 flex flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">{lesson.duration}</span>
                    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${completed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:text-gray-300'}`}>
                      {completed ? '✓ Done' : 'New'}
                    </span>
                  </div>
                  <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">{lesson.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{lesson.summary}</p>
                  <div className="mt-4 rounded-2xl border border-dashed border-gray-200 px-3 py-3 text-sm text-gray-700 dark:border-zinc-800 dark:text-gray-300">
                    💡 {lesson.takeaway}
                  </div>

                  {isExpanded && (
                    <div className="mt-4 space-y-3 text-sm">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Why it matters</p>
                        <p className="text-gray-700 dark:text-gray-300">{lesson.whyItMatters}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Key terms</p>
                        <div className="flex flex-wrap gap-1.5">
                          {lesson.keyTerms.map((term) => (
                            <span key={term} className="rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 px-2 py-0.5 text-xs">{term}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">Read more</p>
                        <ul className="space-y-1.5">
                          {lesson.resources.map((r) => (
                            <li key={r.url}>
                              <a
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                                onClick={() => markLesson(lesson.id)}
                              >
                                <span className="flex-1 truncate">{r.label}</span>
                                <span className="flex-shrink-0 text-[10px] text-gray-400 dark:text-gray-500">{r.source} ↗</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
                      className="flex-1 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-blue-500 hover:text-blue-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300 dark:hover:text-blue-400"
                    >
                      {isExpanded ? 'Hide' : 'Read more'}
                    </button>
                    {!completed && (
                      <button
                        type="button"
                        onClick={() => markLesson(lesson.id)}
                        className="rounded-2xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                      >
                        ✓ Done
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </InvestCard>
      </div>
    </div>
  );
};


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
