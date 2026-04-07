import React, { useMemo, useState } from 'react';
import { useInvestment } from '../../context/InvestmentContext';
import { MarketOverviewSection } from '../../components/investment/MarketOverviewSection';
import { PortfolioSection } from '../../components/investment/PortfolioSection';
import { RoadmapSection } from '../../components/investment/RoadmapSection';
import { SchemesSection } from '../../components/investment/SchemesSection';
import { StocksSection } from '../../components/investment/StocksSection';
import { InvestCard, MetricPill } from '../../components/investment/InvestUI';
import { formatInr } from '../../components/investment/format';

type InvestTab = 'overview' | 'stocks' | 'portfolio' | 'schemes' | 'roadmap';

const tabs: { id: InvestTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'stocks', label: 'Stocks' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'schemes', label: 'Schemes' },
  { id: 'roadmap', label: 'Roadmap' },
];

export const InvestPage: React.FC = () => {
  const { market, portfolio, profile, investmentGoals, riskBand } = useInvestment();
  const [activeTab, setActiveTab] = useState<InvestTab>('overview');

  const fundedGoals = useMemo(
    () => investmentGoals.filter((goal) => goal.currentAmount >= goal.targetAmount).length,
    [investmentGoals]
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <InvestCard className="overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 dark:from-blue-700 dark:via-cyan-600 dark:to-emerald-600 p-6 lg:p-8 text-white relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_38%)]" />
          <div className="relative z-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs uppercase tracking-[0.22em] text-white/80">SpendWise Invest</p>
                <h1 className="text-3xl lg:text-4xl font-bold mt-2">Professional investment dashboard for Indian markets</h1>
                <p className="text-white/85 mt-3 max-w-2xl">
                  Market overview, stock analysis, portfolio tracking, government scheme comparison, and a personalized roadmap in the same design system as the rest of SpendWise.
                </p>
              </div>
              <div className="text-sm text-white/85">
                <p>Last refresh: {new Date(market.lastUpdated).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</p>
                <p className="mt-1">Mode: {market.providerLabel}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 mt-6">
              <MetricPill label="Portfolio Value" value={formatInr(portfolio.totalValue, 0)} />
              <MetricPill label="Monthly Investable" value={formatInr(profile.monthlyInvestable, 0)} />
              <MetricPill label="Risk Band" value={riskBand} tone="warning" />
              <MetricPill label="Goals Funded" value={`${fundedGoals}/${investmentGoals.length}`} tone="positive" />
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
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                : 'bg-white dark:bg-zinc-900/60 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <MarketOverviewSection />}
      {activeTab === 'stocks' && <StocksSection />}
      {activeTab === 'portfolio' && <PortfolioSection />}
      {activeTab === 'schemes' && <SchemesSection />}
      {activeTab === 'roadmap' && <RoadmapSection />}
    </div>
  );
};
