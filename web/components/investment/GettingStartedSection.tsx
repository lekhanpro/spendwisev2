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

const LESSON_STORAGE_KEY = 'spendwise-invest-lessons-v2';

interface LessonResource {
  title: string;
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
    takeaway: 'Keep 3–6 months of expenses in liquid, low-risk instruments before investing in equities.',
    keyTerms: ['Emergency fund', 'Liquidity', 'Liquid fund', 'Savings account'],
    whyItMatters:
      'Without a cash buffer, you may be forced to liquidate investments at a loss during a crisis. This protects your portfolio from panic selling.',
    resources: [
      {
        title: 'Emergency Fund: How Much Do You Need?',
        url: 'https://zerodha.com/varsity/chapter/emergency-fund-and-insurance/',
        source: 'Zerodha Varsity',
      },
      {
        title: 'Why You Need an Emergency Fund',
        url: 'https://www.investopedia.com/terms/e/emergency_fund.asp',
        source: 'Investopedia',
      },
      {
        title: 'Liquid Funds vs Savings Account',
        url: 'https://www.etmoney.com/learn/mutual-funds/liquid-funds-vs-savings-account-which-is-better/',
        source: 'ET Money',
      },
      {
        title: 'Personal Finance Basics (SEBI Guide)',
        url: 'https://investor.sebi.gov.in/pdf/financial-ed/Personal_Finance_Feb19.pdf',
        source: 'SEBI',
      },
    ],
  },
  {
    id: 'lesson-stocks',
    duration: '4 min',
    title: 'Read a stock card correctly',
    summary: 'Price action, valuation, RSI, and benchmark context should be read together.',
    takeaway:
      'Never rely on a single metric. Combine P/E with ROE, check RSI for entry timing, and always compare against a benchmark like Nifty 50.',
    keyTerms: ['P/E ratio', 'ROE', 'RSI', 'Market cap', 'Dividend yield', '52-week range'],
    whyItMatters:
      'Investors who only look at price often buy overvalued stocks. Understanding fundamentals + technicals together reduces costly mistakes.',
    resources: [
      {
        title: 'How to Read a Stock Fundamental Sheet',
        url: 'https://zerodha.com/varsity/module/fundamental-analysis/',
        source: 'Zerodha Varsity',
      },
      {
        title: 'Understanding P/E Ratio',
        url: 'https://www.investopedia.com/terms/p/price-earningsratio.asp',
        source: 'Investopedia',
      },
      {
        title: 'RSI Indicator Explained',
        url: 'https://zerodha.com/varsity/chapter/the-relative-strength-index/',
        source: 'Zerodha Varsity',
      },
      {
        title: 'NSE India — Company Fundamentals',
        url: 'https://www.nseindia.com/get-quotes/equity',
        source: 'NSE India',
      },
      {
        title: 'Reading Annual Reports',
        url: 'https://zerodha.com/varsity/chapter/how-to-read-the-annual-report-of-a-company/',
        source: 'Zerodha Varsity',
      },
    ],
  },
  {
    id: 'lesson-goals',
    duration: '4 min',
    title: 'Invest goal-first, not product-first',
    summary: 'Time horizon should decide asset mix before a stock or scheme is selected.',
    takeaway:
      'Link every investment to a goal with a deadline. Short horizon (< 3 yr) → debt; medium (3–7 yr) → hybrid; long (7+ yr) → equity.',
    keyTerms: ['Asset allocation', 'Time horizon', 'SIP', 'Goal-based investing', 'Rebalancing'],
    whyItMatters:
      "Investing without goals leads to random decisions. When markets fall, goal-linked investors stay the course. Random investors panic sell.",
    resources: [
      {
        title: 'Goal-Based Investing — A Framework',
        url: 'https://www.valueresearchonline.com/stories/47780/goal-based-investing-a-practical-approach/',
        source: 'Value Research',
      },
      {
        title: 'How to Choose Between SIP and Lumpsum',
        url: 'https://www.etmoney.com/learn/mutual-funds/sip-vs-lump-sum-which-is-better/',
        source: 'ET Money',
      },
      {
        title: 'Asset Allocation for Different Life Stages',
        url: 'https://zerodha.com/varsity/chapter/asset-allocation-and-investments/',
        source: 'Zerodha Varsity',
      },
      {
        title: 'Rebalancing Your Portfolio',
        url: 'https://www.investopedia.com/terms/r/rebalancing.asp',
        source: 'Investopedia',
      },
    ],
  },
  {
    id: 'lesson-tax',
    duration: '3 min',
    title: 'Use tax buckets deliberately',
    summary: 'Tax-saving products should support the portfolio, not dominate it.',
    takeaway:
      'Compare ELSS (3 yr lock-in, market-linked) vs PPF (15 yr, tax-free) vs NPS (retirement, partial taxable). Choose based on liquidity need first.',
    keyTerms: ['Section 80C', 'ELSS', 'PPF', 'NPS', 'LTCG', 'Lock-in period'],
    whyItMatters:
      'Many investors over-allocate to PPF/insurance to save tax, locking up money they later need. Smart tax planning preserves both liquidity and returns.',
    resources: [
      {
        title: 'Section 80C Investment Options Compared',
        url: 'https://www.etmoney.com/learn/tax/best-tax-saving-investments-under-section-80c/',
        source: 'ET Money',
      },
      {
        title: 'ELSS vs PPF vs NPS — Which Is Better?',
        url: 'https://www.valueresearchonline.com/stories/50065/elss-vs-ppf-vs-nps/',
        source: 'Value Research',
      },
      {
        title: 'NPS — Official PFRDA Guide',
        url: 'https://www.npscra.nsdl.co.in/nps-lite.php',
        source: 'PFRDA / NSDL',
      },
      {
        title: 'How LTCG Tax Works on Equity Funds',
        url: 'https://zerodha.com/varsity/chapter/taxation-and-investing/',
        source: 'Zerodha Varsity',
      },
      {
        title: 'PPF Interest Rate & Rules — India Post',
        url: 'https://www.indiapost.gov.in/Financial/Pages/Content/Post-Office-Small-Saving-Schemes.aspx',
        source: 'India Post (Govt.)',
      },
    ],
  },
];

const tourSteps: Array<{ id: InvestTab; title: string; description: string }> = [
  { id: 'roadmap', title: 'Set your profile', description: 'Capture age, horizon, tax bracket, and investable cash first.' },
  { id: 'portfolio', title: 'Track what you already own', description: 'Add holdings so recommendations and drift checks reflect reality.' },
  { id: 'stocks', title: 'Build a focused watchlist', description: 'Use a few names and study their workbench instead of scanning everything.' },
  { id: 'schemes', title: 'Compare official savings options', description: 'Use schemes when capital protection or tax buckets matter more than upside.' },
];

/** Expandable lesson detail card */
const LessonCard: React.FC<{
  lesson: Lesson;
  completed: boolean;
  onMarkComplete: () => void;
}> = ({ lesson, completed, onMarkComplete }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-2xl border transition-colors ${completed ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/40 dark:bg-emerald-900/5' : 'border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/40'}`}>
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">{lesson.duration}</span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${completed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:text-gray-300'}`}>
              {completed ? '✓ Done' : 'New'}
            </span>
          </div>
          <h3 className="mt-2 font-semibold text-gray-900 dark:text-white text-sm leading-snug">{lesson.title}</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{lesson.summary}</p>
        </div>
        <span className="text-gray-400 text-xs mt-1 shrink-0">{expanded ? '▲' : '▼'}</span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-zinc-800 pt-3 space-y-4">
          {/* Why it matters */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">Why it matters</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{lesson.whyItMatters}</p>
          </div>

          {/* Key takeaway */}
          <div className="rounded-xl border border-dashed border-amber-300 dark:border-amber-700/50 bg-amber-50/50 dark:bg-amber-900/10 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-1">Key Takeaway</p>
            <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">{lesson.takeaway}</p>
          </div>

          {/* Key terms */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Key Terms</p>
            <div className="flex flex-wrap gap-1.5">
              {lesson.keyTerms.map(term => (
                <span key={term} className="px-2 py-1 rounded-full text-xs bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300">{term}</span>
              ))}
            </div>
          </div>

          {/* Read more links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Read More</p>
            <div className="space-y-2">
              {lesson.resources.map(res => (
                <a
                  key={res.url}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group"
                >
                  <span className="text-blue-500 mt-0.5 shrink-0">↗</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug">{res.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{res.source}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onMarkComplete}
            className={`w-full py-2.5 rounded-2xl text-sm font-medium transition-colors border ${completed ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400'}`}
          >
            {completed ? '✓ Reviewed' : 'Mark as complete'}
          </button>
        </div>
      )}
    </div>
  );
};

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
      const next = current.includes(lessonId) ? current : [...current, lessonId];
      localStorage.setItem(LESSON_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const completionRate = useMemo(
    () => (lessons.length > 0 ? (completedLessons.length / lessons.length) * 100 : 0),
    [completedLessons]
  );

  return (
    <div className="space-y-5">
      <InvestCard className="p-4 sm:p-5">
        <SectionTitle
          eyebrow="Start Here"
          title="Guided investing setup"
          description="This starter view walks you through the parts that matter first before diving into market data."
        />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          <MetricPill label="Monthly Investable" value={`₹${monthlyInvestable.toLocaleString('en-IN')}`} />
          <MetricPill label="Risk Band" value={riskBand} tone="warning" />
          <MetricPill label="Watchlist" value={`${watchlistCount} names`} />
          <MetricPill label="Goals Funded" value={`${fundedGoals}/${totalGoals || 0}`} tone="positive" />
          <MetricPill label="Lesson Progress" value={`${completionRate.toFixed(0)}%`} tone="positive" />
        </div>
      </InvestCard>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        {/* Tour steps */}
        <InvestCard className="p-4 sm:p-5">
          <SectionTitle
            eyebrow="Quick Tour"
            title="Four-stop dashboard tour"
            description="Use this route the first time through instead of jumping straight into every market card."
          />
          <div className="mt-4 space-y-3">
            {tourSteps.map((step, index) => (
              <div key={step.id} className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/40 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Step {index + 1}</p>
                    <p className="mt-1.5 font-semibold text-gray-900 dark:text-white text-sm">{step.title}</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate(step.id)}
                    className="shrink-0 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        </InvestCard>

        {/* Lessons */}
        <InvestCard className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <SectionTitle
              eyebrow="Starter Lessons"
              title="Short lessons for first-time investors"
              description="Expand any lesson to read key takeaways and real articles from credible sources."
            />
            {completedLessons.length > 0 && (
              <span className="shrink-0 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                {completedLessons.length}/{lessons.length} done
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-3 mb-4 h-1.5 w-full bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>

          <div className="space-y-3">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                completed={completedLessons.includes(lesson.id)}
                onMarkComplete={() => markLesson(lesson.id)}
              />
            ))}
          </div>
        </InvestCard>
      </div>
    </div>
  );
};
