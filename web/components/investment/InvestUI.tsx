import React from 'react';

interface InvestCardProps {
  children: React.ReactNode;
  className?: string;
}

export const InvestCard: React.FC<InvestCardProps> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-zinc-900/60 backdrop-blur-md border border-gray-200 dark:border-zinc-800 shadow-lg rounded-2xl ${className}`}>
    {children}
  </div>
);

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ eyebrow, title, description, action }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div className="min-w-0">
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">{eyebrow}</p>}
      <h2 className="mt-1 break-words text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      {description && <p className="mt-1 max-w-2xl break-words text-sm text-gray-600 dark:text-gray-400">{description}</p>}
    </div>
    {action && <div className="w-full shrink-0 sm:w-auto">{action}</div>}
  </div>
);

interface MetricPillProps {
  label: string;
  value: string;
  tone?: 'neutral' | 'positive' | 'negative' | 'warning';
}

export const MetricPill: React.FC<MetricPillProps> = ({ label, value, tone = 'neutral' }) => {
  const toneClass =
    tone === 'positive'
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
      : tone === 'negative'
        ? 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300 border-red-200 dark:border-red-500/30'
        : tone === 'warning'
          ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
          : 'bg-gray-50 text-gray-700 dark:bg-zinc-800 dark:text-gray-300 border-gray-200 dark:border-zinc-700';

  return (
    <div className={`min-w-0 rounded-2xl border px-4 py-3 ${toneClass}`}>
      <p className="break-words text-xs uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-1 break-words text-base font-semibold leading-tight sm:text-lg">{value}</p>
    </div>
  );
};

interface ProgressBarProps {
  value: number;
  tone?: 'blue' | 'emerald' | 'amber' | 'red';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, tone = 'blue' }) => {
  const width = `${Math.max(0, Math.min(100, value))}%`;
  const color =
    tone === 'emerald'
      ? 'from-emerald-500 to-emerald-400'
      : tone === 'amber'
        ? 'from-amber-500 to-amber-400'
        : tone === 'red'
          ? 'from-red-500 to-red-400'
          : 'from-blue-500 to-cyan-400';

  return (
    <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
      <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width }} />
    </div>
  );
};

interface ToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const QuietToggle: React.FC<ToggleProps> = ({ label, description, checked, onChange }) => (
  <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="min-w-0">
      <p className="font-medium text-gray-900 dark:text-white">{label}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`h-6 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-blue-500' : 'bg-gray-300 dark:bg-zinc-700'}`}
    >
      <div className={`w-5 h-5 mt-0.5 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  </div>
);
