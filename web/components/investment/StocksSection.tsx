import React, { useDeferredValue, useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useInvestment } from '../../context/InvestmentContext';
import { MarketRange } from '../../types/investment';
import { InvestCard, MetricPill, SectionTitle } from './InvestUI';
import { formatInr } from './format';

const ranges: MarketRange[] = ['1D', '1W', '1M', '3M', '1Y', '5Y'];

export const StocksSection: React.FC = () => {
  const {
    availableStocks,
    selectedRange,
    selectedStock,
    setSelectedRange,
    setSelectedStock,
    toggleWatchlist,
    watchlist,
  } = useInvestment();
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const formatOptionalValue = (value: number | null | undefined, formatter: (input: number) => string) =>
    value === null || value === undefined ? '--' : formatter(value);

  const filteredStocks = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) return availableStocks;
    return availableStocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(query) ||
        stock.name.toLowerCase().includes(query) ||
        stock.sector.toLowerCase().includes(query)
    );
  }, [availableStocks, deferredSearch]);

  const activeStock = availableStocks.find((stock) => stock.symbol === selectedStock) ?? availableStocks[0];
  const isTracked = watchlist.includes(activeStock?.symbol ?? '');

  if (!activeStock) {
    return null;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[0.86fr_1.14fr]">
      <InvestCard className="p-5">
        <SectionTitle
          eyebrow="Explorer"
          title="Indian Equity Universe"
          description="Search the tracked Indian universe. Quotes are API-backed when available and cached locally to stay inside free-tier limits."
        />
        <div className="mt-5">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by symbol, sector, or company"
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-3 mt-5 max-h-[36rem] overflow-y-auto pr-1">
          {filteredStocks.map((stock) => {
            const tracked = watchlist.includes(stock.symbol);
            const selected = stock.symbol === activeStock.symbol;
            return (
              <button
                type="button"
                key={stock.symbol}
                onClick={() => setSelectedStock(stock.symbol)}
                className={`w-full text-left rounded-2xl border px-4 py-4 transition-all ${
                  selected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                    : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</p>
                      {tracked && <span className="text-xs rounded-full px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">Tracked</span>}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stock.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{stock.sector}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">{formatInr(stock.price, 0)}</p>
                    <p className={`text-sm font-semibold mt-1 ${stock.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {stock.changePercent >= 0 ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </InvestCard>

      <div className="space-y-4">
        <InvestCard className="p-5">
          <SectionTitle
            eyebrow="Stock Workbench"
            title={`${activeStock.name} (${activeStock.symbol})`}
            description={
              activeStock.lastTradingDay
                ? `${activeStock.thesis} Latest provider session: ${activeStock.lastTradingDay}.`
                : activeStock.thesis
            }
            action={
              <button
                type="button"
                onClick={() => toggleWatchlist(activeStock.symbol)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isTracked
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-200'
                }`}
              >
                {isTracked ? 'Tracked' : 'Add to watchlist'}
              </button>
            }
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
            <MetricPill label="Price" value={formatInr(activeStock.price, 2)} />
            <MetricPill
              label="Change"
              value={`${activeStock.change >= 0 ? '+' : ''}${formatInr(activeStock.change, 2)} (${activeStock.changePercent.toFixed(2)}%)`}
              tone={activeStock.change >= 0 ? 'positive' : 'negative'}
            />
            <MetricPill label="Analyst View" value={activeStock.analystRating} tone="warning" />
            <MetricPill label="Target" value={formatInr(activeStock.analystTarget, 0)} />
          </div>

          <div className="flex flex-wrap gap-2 mt-5">
            {ranges.map((range) => (
              <button
                type="button"
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  selectedRange === range
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white dark:bg-zinc-950/40 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-800'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <div className="h-80 mt-5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeStock.priceSeries[selectedRange]}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={['auto', 'auto']} />
                <Tooltip formatter={(value) => formatInr(Number(value), 2)} />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </InvestCard>

        <div className="grid gap-4 md:grid-cols-2">
          <InvestCard className="p-5">
            <SectionTitle eyebrow="Fundamental" title="Quality and valuation" />
            <div className="grid grid-cols-2 gap-3 mt-5">
              <MetricPill label="P/E" value={activeStock.peRatio.toFixed(1)} />
              <MetricPill label="P/B" value={activeStock.pbRatio.toFixed(1)} />
              <MetricPill label="ROE" value={`${activeStock.roe.toFixed(1)}%`} tone="positive" />
              <MetricPill label="Debt/Equity" value={activeStock.debtToEquity.toFixed(2)} tone={activeStock.debtToEquity < 0.5 ? 'positive' : 'warning'} />
              <MetricPill label="Market Cap" value={activeStock.marketCap} />
              <MetricPill label="Volume" value={activeStock.volume} />
            </div>
          </InvestCard>

          <InvestCard className="p-5">
            <SectionTitle eyebrow="Technical" title="Trend health" />
            <div className="grid grid-cols-2 gap-3 mt-5">
              <MetricPill label="52W High" value={formatInr(activeStock.high52Week, 0)} />
              <MetricPill label="52W Low" value={formatInr(activeStock.low52Week, 0)} />
              <MetricPill
                label="RSI (14)"
                value={formatOptionalValue(activeStock.rsi14, (value) => value.toFixed(1))}
                tone={
                  activeStock.rsi14 === null || activeStock.rsi14 === undefined
                    ? 'neutral'
                    : activeStock.rsi14 >= 70 || activeStock.rsi14 <= 30
                      ? 'warning'
                      : 'positive'
                }
              />
              <MetricPill
                label="MACD"
                value={formatOptionalValue(activeStock.macd, (value) => value.toFixed(2))}
                tone={
                  activeStock.macd === null || activeStock.macd === undefined
                    ? 'neutral'
                    : activeStock.macd >= 0
                      ? 'positive'
                      : 'negative'
                }
              />
              <MetricPill label="20D SMA" value={formatOptionalValue(activeStock.sma20, (value) => formatInr(value, 2))} />
              <MetricPill label="50D SMA" value={formatOptionalValue(activeStock.sma50, (value) => formatInr(value, 2))} />
            </div>
          </InvestCard>
        </div>

        <InvestCard className="p-5">
          <SectionTitle eyebrow="Risk Lens" title="What to watch" description="Actionable red flags and context for the selected name." />
          <div className="grid gap-4 lg:grid-cols-[0.72fr_0.28fr] mt-5">
            <div className="space-y-3">
              {activeStock.riskFlags.map((flag) => (
                <div key={flag} className="rounded-2xl border border-gray-200 dark:border-zinc-800 px-4 py-3 bg-gray-50 dark:bg-zinc-950/40">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{flag}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Benchmark</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{activeStock.benchmarkReturn1Y.toFixed(1)}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Reference 1Y Nifty return used for quick relative performance checks.</p>
            </div>
          </div>
        </InvestCard>
      </div>
    </div>
  );
};
