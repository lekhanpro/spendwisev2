import React, { useMemo, useState } from 'react';
import { GettingStartedSection } from '../../components/investment/GettingStartedSection';
import { InvestCard, MetricPill } from '../../components/investment/InvestUI';
import { MarketOverviewSection } from '../../components/investment/MarketOverviewSection';
import { PortfolioSection } from '../../components/investment/PortfolioSection';
import { RoadmapSection } from '../../components/investment/RoadmapSection';
import { SchemesSection } from '../../components/investment/SchemesSection';
import { StocksSection } from '../../components/investment/StocksSection';
import { formatInr } from '../../components/investment/format';
import { Modal } from '../../components/Modal';
import { useInvestment } from '../../context/InvestmentContext';

type InvestTab = 'start' | 'overview' | 'stocks' | 'portfolio' | 'schemes' | 'roadmap';

const tabs: { id: InvestTab; label: string }[] = [
  { id: 'start', label: 'Start Here' },
  { id: 'overview', label: 'Markets' },
  { id: 'stocks', label: 'Stocks' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'schemes', label: 'Schemes' },
  { id: 'roadmap', label: 'Roadmap' },
];

const tourStops: Array<{ id: Exclude<InvestTab, 'start'>; title: string; description: string }> = [
  { id: 'roadmap', title: 'Roadmap', description: 'Set risk, horizon, goals, and contribution capacity first.' },
  { id: 'portfolio', title: 'Portfolio', description: 'Track what you already own so the dashboard speaks to your actual book.' },
  { id: 'stocks', title: 'Stocks', description: 'Use the workbench for focused research instead of scanning every tile at once.' },
  { id: 'schemes', title: 'Schemes', description: 'Compare safer or tax-aware products when capital protection matters.' },
];

export const InvestPage: React.FC = () => {
  const { market, portfolio, profile, investmentGoals, riskBand, watchlist } = useInvestment();
  const [activeTab, setActiveTab] = useState<InvestTab>('start');
  const [showTour, setShowTour] = useState(false);

  const fundedGoals = useMemo(
    () => investmentGoals.filter((goal) => goal.currentAmount >= goal.targetAmount).length,
    [investmentGoals]
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <InvestCard className="overflow-hidden">
        <div className="relative bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 p-6 text-white dark:from-blue-700 dark:via-cyan-600 dark:to-emerald-600 lg:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_38%)]" />
          <div className="relative z-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs uppercase tracking-[0.22em] text-white/80">SpendWise Invest</p>
                <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Investment dashboard for Indian markets, without the overwhelm</h1>
                <p className="mt-3 max-w-2xl text-white/85">
                  Start with the guided tab, then move into markets, stocks, portfolio tracking, schemes, and the roadmap when you are ready.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
                <div className="text-sm text-white/85">
                  <p>Last refresh: {new Date(market.lastUpdated).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</p>
                  <p className="mt-1">Mode: {market.providerLabel}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTour(true)}
                    className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"
                  >
                    Quick tour
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"
                  >
                    Markets
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricPill label="Portfolio Value" value={formatInr(portfolio.totalValue, 0)} />
              <MetricPill label="Monthly Investable" value={formatInr(profile.monthlyInvestable, 0)} />
              <MetricPill label="Risk Band" value={riskBand} tone="warning" />
              <MetricPill label="Goals Funded" value={`${fundedGoals}/${investmentGoals.length || 0}`} tone="positive" />
            </div>
          </div>
        </div>
      </InvestCard>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                : 'border-gray-200 bg-white text-gray-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'start' && (
        <GettingStartedSection
          monthlyInvestable={profile.monthlyInvestable}
          riskBand={riskBand}
          fundedGoals={fundedGoals}
          totalGoals={investmentGoals.length}
          watchlistCount={watchlist.length}
          onNavigate={(tab) => setActiveTab(tab)}
        />
      )}
      {activeTab === 'overview' && <MarketOverviewSection />}
      {activeTab === 'stocks' && <StocksSection />}
      {activeTab === 'portfolio' && <PortfolioSection />}
      {activeTab === 'schemes' && <SchemesSection />}
      {activeTab === 'roadmap' && <RoadmapSection />}

      <Modal isOpen={showTour} onClose={() => setShowTour(false)} title="Invest Quick Tour">
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Use this path if you are just getting started. It keeps you out of the dense market screens until the basics are in place.
          </p>
          <div className="space-y-3">
            {tourStops.map((stop, index) => (
              <div key={stop.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Stop {index + 1}</p>
                <p className="mt-2 font-semibold text-gray-900 dark:text-white">{stop.title}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{stop.description}</p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab(stop.id);
                    setShowTour(false);
                  }}
                  className="mt-4 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Open {stop.title}
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
