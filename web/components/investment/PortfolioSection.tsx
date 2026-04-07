import React, { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { useInvestment } from '../../context/InvestmentContext';
import { AssetClass, PortfolioHolding } from '../../types/investment';
import { InvestCard, MetricPill, ProgressBar, SectionTitle } from './InvestUI';
import { formatInr } from './format';

const assetOptions: { value: AssetClass; label: string; color: string }[] = [
  { value: 'equity', label: 'Equity', color: '#3b82f6' },
  { value: 'debt', label: 'Debt', color: '#10b981' },
  { value: 'gold', label: 'Gold', color: '#f59e0b' },
  { value: 'cash', label: 'Cash', color: '#8b5cf6' },
  { value: 'international', label: 'International', color: '#14b8a6' },
  { value: 'real-estate', label: 'Real Estate', color: '#ef4444' },
];

type HoldingForm = Omit<PortfolioHolding, 'id'>;

const defaultForm: HoldingForm = {
  symbol: '',
  name: '',
  assetClass: 'equity',
  quantity: 1,
  averageCost: 0,
  goalId: '',
};

export const PortfolioSection: React.FC = () => {
  const {
    availableStocks,
    holdings,
    investmentGoals,
    portfolio,
    addHolding,
    updateHolding,
    removeHolding,
  } = useInvestment();
  const [form, setForm] = useState<HoldingForm>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const priceMap = useMemo(
    () => new Map(availableStocks.map((stock) => [stock.symbol, stock] as const)),
    [availableStocks]
  );

  const allocationData = portfolio.allocations
    .filter((item) => item.currentPercent > 0)
    .map((item) => ({
      name: item.label,
      value: item.currentPercent,
      color: assetOptions.find((option) => option.value === item.assetClass)?.color ?? '#64748b',
    }));

  const estimatedDividend = holdings.reduce((sum, holding) => {
    const stock = priceMap.get(holding.symbol);
    if (!stock) return sum;
    return sum + holding.quantity * stock.price * (stock.dividendYield / 100);
  }, 0);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.symbol || !form.name || form.quantity <= 0 || form.averageCost <= 0) return;

    if (editingId) {
      updateHolding({
        id: editingId,
        ...form,
      });
    } else {
      addHolding(form);
    }

    setForm(defaultForm);
    setEditingId(null);
  };

  const startEdit = (holding: PortfolioHolding) => {
    setEditingId(holding.id);
    setForm({
      symbol: holding.symbol,
      name: holding.name,
      assetClass: holding.assetClass,
      quantity: holding.quantity,
      averageCost: holding.averageCost,
      goalId: holding.goalId ?? '',
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <InvestCard className="p-5">
          <SectionTitle
            eyebrow="Portfolio"
            title="Book Summary"
            description="Track actual holdings, drift, benchmark gap, and estimated income yield."
          />
          <div className="grid grid-cols-2 gap-3 mt-5">
            <MetricPill label="Invested" value={formatInr(portfolio.totalInvested, 0)} />
            <MetricPill label="Current Value" value={formatInr(portfolio.totalValue, 0)} />
            <MetricPill
              label="Unrealized P/L"
              value={`${portfolio.totalGain >= 0 ? '+' : ''}${formatInr(portfolio.totalGain, 0)}`}
              tone={portfolio.totalGain >= 0 ? 'positive' : 'negative'}
            />
            <MetricPill
              label="P/L %"
              value={`${portfolio.totalGainPercent >= 0 ? '+' : ''}${portfolio.totalGainPercent.toFixed(2)}%`}
              tone={portfolio.totalGainPercent >= 0 ? 'positive' : 'negative'}
            />
            <MetricPill
              label="Benchmark Gap"
              value={`${portfolio.benchmarkGapPercent >= 0 ? '+' : ''}${portfolio.benchmarkGapPercent.toFixed(2)}%`}
              tone={portfolio.benchmarkGapPercent >= 0 ? 'positive' : 'warning'}
            />
            <MetricPill label="Estimated Dividend" value={formatInr(estimatedDividend, 0)} tone="positive" />
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.46fr_0.54fr] mt-5">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={allocationData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} stroke="none">
                    {allocationData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {allocationData.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 dark:border-zinc-800 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{entry.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{entry.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </InvestCard>

        <InvestCard className="p-5">
          <SectionTitle eyebrow="Rebalance" title="Target vs current allocation" description="Drift beyond five percentage points is a review trigger." />
          <div className="space-y-4 mt-5">
            {portfolio.allocations.map((allocation) => (
              <div key={allocation.assetClass} className="rounded-2xl border border-gray-200 dark:border-zinc-800 p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{allocation.label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{allocation.rationale}</p>
                  </div>
                  <p className={`font-semibold ${Math.abs(allocation.driftPercent) >= 5 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {allocation.currentPercent.toFixed(1)}% / {allocation.targetPercent}%
                  </p>
                </div>
                <ProgressBar value={allocation.currentPercent} tone={Math.abs(allocation.driftPercent) >= 5 ? 'amber' : 'blue'} />
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Drift: {allocation.driftPercent >= 0 ? '+' : ''}
                  {allocation.driftPercent.toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </InvestCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <InvestCard className="p-5">
          <SectionTitle eyebrow="Add Holding" title={editingId ? 'Edit position' : 'Track an investment'} description="Works for direct equities, debt products, and gold allocations." />
          <form className="space-y-4 mt-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={form.symbol}
                onChange={(event) => setForm((current) => ({ ...current, symbol: event.target.value.toUpperCase() }))}
                placeholder="Symbol"
                className="px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={form.assetClass}
                onChange={(event) => setForm((current) => ({ ...current, assetClass: event.target.value as AssetClass }))}
                className="px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                {assetOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Instrument name"
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.quantity}
                onChange={(event) => setForm((current) => ({ ...current, quantity: Number(event.target.value) }))}
                placeholder="Units"
                className="px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.averageCost}
                onChange={(event) => setForm((current) => ({ ...current, averageCost: Number(event.target.value) }))}
                placeholder="Average cost"
                className="px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={form.goalId}
              onChange={(event) => setForm((current) => ({ ...current, goalId: event.target.value }))}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Link to a goal (optional)</option>
              {investmentGoals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.name}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 py-3 rounded-2xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
                {editingId ? 'Save holding' : 'Add holding'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(defaultForm);
                  }}
                  className="px-4 py-3 rounded-2xl border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </InvestCard>

        <InvestCard className="p-5">
          <SectionTitle eyebrow="Positions" title="Tracked holdings" description="Edit average cost, link a goal, and monitor mark-to-market value." />
          <div className="overflow-x-auto mt-5">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-800">
                  <th className="pb-3 pr-4">Instrument</th>
                  <th className="pb-3 pr-4">Units</th>
                  <th className="pb-3 pr-4">Avg Cost</th>
                  <th className="pb-3 pr-4">Current</th>
                  <th className="pb-3 pr-4">Value</th>
                  <th className="pb-3 pr-4">Goal</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => {
                  const stock = priceMap.get(holding.symbol);
                  const currentPrice = stock ? stock.price : holding.averageCost;
                  const currentValue = currentPrice * holding.quantity;
                  const linkedGoal = investmentGoals.find((goal) => goal.id === holding.goalId);

                  return (
                    <tr key={holding.id} className="border-b border-gray-100 dark:border-zinc-900">
                      <td className="py-4 pr-4">
                        <p className="font-medium text-gray-900 dark:text-white">{holding.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{holding.symbol}</p>
                      </td>
                      <td className="py-4 pr-4 text-gray-700 dark:text-gray-300">{holding.quantity}</td>
                      <td className="py-4 pr-4 text-gray-700 dark:text-gray-300">{formatInr(holding.averageCost, 2)}</td>
                      <td className="py-4 pr-4 text-gray-700 dark:text-gray-300">{formatInr(currentPrice, 2)}</td>
                      <td className="py-4 pr-4 font-semibold text-gray-900 dark:text-white">{formatInr(currentValue, 0)}</td>
                      <td className="py-4 pr-4 text-gray-700 dark:text-gray-300">{linkedGoal?.name ?? '-'}</td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => startEdit(holding)} className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-200 text-sm">
                            Edit
                          </button>
                          <button type="button" onClick={() => removeHolding(holding.id)} className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300 text-sm">
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </InvestCard>
      </div>
    </div>
  );
};
