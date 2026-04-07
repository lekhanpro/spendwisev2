import React from 'react';
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useInvestment } from '../../context/InvestmentContext';
import { InvestCard, MetricPill, ProgressBar, SectionTitle } from './InvestUI';
import { formatCompact, formatInr } from './format';

export const MarketOverviewSection: React.FC = () => {
  const { market, watchlist, availableStocks, portfolio, recommendations } = useInvestment();

  const watchlistCards = availableStocks.filter((stock) => watchlist.includes(stock.symbol)).slice(0, 4);
  const overviewDescription =
    market.mode === 'mock'
      ? 'Indices, sector breadth, movers, and your tracked names in one mobile-first dashboard. The current build is still running on local simulation data.'
      : 'Alpha Vantage delayed BSE quotes now drive the tracked equity universe, while index cards stay on a local fallback until a direct Indian index feed is added.';

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Live Surface"
        title="Market Overview"
        description={overviewDescription}
        action={
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Data mode</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{market.providerLabel}</p>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        {market.indices.map((index) => (
          <InvestCard key={index.symbol} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{index.name}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatInr(index.value, 0)}</p>
                <p className={`text-sm font-semibold mt-2 ${index.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {index.change >= 0 ? '+' : ''}
                  {index.changePercent.toFixed(2)}%
                </p>
              </div>
              <div className="w-28 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={index.priceSeries['1M']}>
                    <defs>
                      <linearGradient id={`idx-${index.symbol}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={index.change >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0.28} />
                        <stop offset="95%" stopColor={index.change >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip formatter={(value) => formatInr(Number(value), 0)} labelFormatter={() => ''} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={index.change >= 0 ? '#10b981' : '#ef4444'}
                      strokeWidth={2}
                      fill={`url(#idx-${index.symbol})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <MetricPill label="Day Low" value={formatInr(index.dayLow, 0)} />
              <MetricPill label="Day High" value={formatInr(index.dayHigh, 0)} />
            </div>
          </InvestCard>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <InvestCard className="p-5">
          <SectionTitle
            eyebrow="Breadth"
            title="Sector Performance"
            description="A quick read on where leadership is concentrated right now."
          />
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] mt-5">
            <div className="space-y-4">
              {market.sectors.map((sector) => (
                <div key={sector.name}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{sector.name}</p>
                      <p className="text-gray-500 dark:text-gray-400">{sector.breadth}</p>
                    </div>
                    <p className={`font-semibold ${sector.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {sector.changePercent >= 0 ? '+' : ''}
                      {sector.changePercent.toFixed(2)}%
                    </p>
                  </div>
                  <ProgressBar value={Math.abs(sector.changePercent) * 18} tone={sector.changePercent >= 0 ? 'emerald' : 'red'} />
                </div>
              ))}
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={market.sectors}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} angle={-12} height={50} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                  <Bar dataKey="changePercent" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </InvestCard>

        <InvestCard className="p-5">
          <SectionTitle
            eyebrow="Your Edge"
            title="Portfolio Pulse"
            description="How the investment book looks before you drill down."
          />
          <div className="grid grid-cols-2 gap-3 mt-5">
            <MetricPill label="Portfolio Value" value={formatInr(portfolio.totalValue, 0)} />
            <MetricPill
              label="Unrealized P/L"
              value={`${portfolio.totalGain >= 0 ? '+' : ''}${formatInr(portfolio.totalGain, 0)}`}
              tone={portfolio.totalGain >= 0 ? 'positive' : 'negative'}
            />
            <MetricPill
              label="Day Change"
              value={`${portfolio.dayChange >= 0 ? '+' : ''}${formatInr(portfolio.dayChange, 0)}`}
              tone={portfolio.dayChange >= 0 ? 'positive' : 'negative'}
            />
            <MetricPill
              label="Vs Nifty 1Y"
              value={`${portfolio.benchmarkGapPercent >= 0 ? '+' : ''}${portfolio.benchmarkGapPercent.toFixed(2)}%`}
              tone={portfolio.benchmarkGapPercent >= 0 ? 'positive' : 'warning'}
            />
          </div>
          <div className="mt-5 space-y-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Recommended watchlist buckets</p>
            {recommendations.stockBuckets.map((bucket) => (
              <div key={bucket} className="rounded-2xl border border-gray-200 dark:border-zinc-800 px-4 py-3 bg-gray-50 dark:bg-zinc-950/40">
                <p className="text-sm text-gray-800 dark:text-gray-200">{bucket}</p>
              </div>
            ))}
          </div>
        </InvestCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <InvestCard className="p-5">
          <SectionTitle eyebrow="Momentum" title="Top Movers" description="Fastest names in the tracked Indian equity universe." />
          <div className="grid gap-4 md:grid-cols-2 mt-5">
            <div>
              <p className="text-sm font-semibold text-emerald-500 mb-3">Top Gainers</p>
              <div className="space-y-3">
                {market.topGainers.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-zinc-800 px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{stock.symbol}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">{formatInr(stock.price, 0)}</p>
                      <p className="text-sm font-semibold text-emerald-500">+{stock.changePercent.toFixed(2)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-500 mb-3">Top Losers</p>
              <div className="space-y-3">
                {market.topLosers.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-zinc-800 px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{stock.symbol}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">{formatInr(stock.price, 0)}</p>
                      <p className="text-sm font-semibold text-red-500">{stock.changePercent.toFixed(2)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </InvestCard>

        <InvestCard className="p-5">
          <SectionTitle eyebrow="Tracked" title="Watchlist Snapshot" description="Your names, their move, and the market value anchor." />
          <div className="space-y-3 mt-5">
            {watchlistCards.map((stock) => (
              <div key={stock.symbol} className="rounded-2xl border border-gray-200 dark:border-zinc-800 px-4 py-3 bg-gray-50 dark:bg-zinc-950/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{stock.symbol}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stock.sector}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">{formatInr(stock.price, 0)}</p>
                    <p className={`text-sm font-semibold ${stock.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {stock.changePercent >= 0 ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-dashed border-blue-200 dark:border-blue-500/30 bg-blue-50/80 dark:bg-blue-500/10 px-4 py-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Total investable capacity this month: <span className="font-semibold">{formatCompact(portfolio.totalValue)}</span> portfolio already deployed.
            </p>
          </div>
        </InvestCard>
      </div>

      <InvestCard className="p-5">
        <SectionTitle eyebrow="News Flow" title="Market Notes" description="Curated insight cards replace the old education/quiz surface." />
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4 mt-5">
          {market.news.map((item) => (
            <div key={item.id} className="rounded-2xl border border-gray-200 dark:border-zinc-800 p-4 bg-gray-50 dark:bg-zinc-950/40">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">{item.tag}</span>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {new Date(item.publishedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mt-3">{item.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{item.summary}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">{item.source}</p>
            </div>
          ))}
        </div>
      </InvestCard>
    </div>
  );
};
