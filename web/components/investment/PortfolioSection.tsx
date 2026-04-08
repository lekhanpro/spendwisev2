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

/** Mobile card for a single holding */
const HoldingCard: React.FC<{
  holding: PortfolioHolding;
  currentPrice: number;
  goalName: string | undefined;
  onEdit: () => void;
  onRemove: () => void;
}> = ({ holding, currentPrice, goalName, onEdit, onRemove }) => {
  const currentValue = currentPrice * holding.quantity;
  const pnl = currentValue - holding.averageCost * holding.quantity;
  const pnlPct = holding.averageCost > 0 ? (pnl / (holding.averageCost * holding.quantity)) * 100 : 0;
  const isUp = pnl >= 0;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white truncate">{holding.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{holding.symbol}</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 capitalize">
              {holding.assetClass}
            </span>
            {goalName && (
              <span className="px-2 py-0.5 rounded-full text-[11px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 truncate max-w-[100px]">
                {goalName}
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-gray-900 dark:text-white">{formatInr(currentValue, 0)}</p>
          <p className={`text-xs font-semibold ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
            {isUp ? '+' : ''}{formatInr(pnl, 0)} ({isUp ? '+' : ''}{pnlPct.toFixed(2)}%)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 text-center">
        <div className="rounded-xl bg-gray-50 dark:bg-zinc-900 py-2">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Units</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{holding.quantity}</p>
        </div>
        <div className="rounded-xl bg-gray-50 dark:bg-zinc-900 py-2">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Avg Cost</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatInr(holding.averageCost, 0)}</p>
        </div>
        <div className="rounded-xl bg-gray-50 dark:bg-zinc-900 py-2">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">LTP</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatInr(currentPrice, 0)}</p>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={onEdit}
          className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="flex-1 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
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
  const [showForm, setShowForm] = useState(false);

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
      updateHolding({ id: editingId, ...form });
    } else {
      addHolding(form);
    }
    setForm(defaultForm);
    setEditingId(null);
    setShowForm(false);
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
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('portfolio-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(defaultForm);
    setShowForm(false);
  };

  const inputClass =
    'w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm';

  return (
    <div className="space-y-4">
      {/* Summary metrics */}
      <InvestCard className="p-4 sm:p-5">
        <SectionTitle
          eyebrow="Portfolio"
          title="Book Summary"
          description="Track actual holdings, drift, benchmark gap, and estimated income yield."
        />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
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
          <MetricPill label="Est. Dividend" value={formatInr(estimatedDividend, 0)} tone="positive" />
        </div>
      </InvestCard>

      {/* Allocation chart + rebalance — stacked on mobile, side-by-side on lg */}
      {holdings.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {allocationData.length > 0 && (
            <InvestCard className="p-4 sm:p-5">
              <SectionTitle eyebrow="Allocation" title="Asset mix" description="Current portfolio allocation by asset class." />
              <div className="mt-4 flex flex-col sm:flex-row gap-4 items-center">
                <div className="w-full sm:w-44 h-44 shrink-0">
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
                <div className="flex-1 space-y-2 w-full">
                  {allocationData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 dark:border-zinc-800 px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{entry.name}</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white text-sm shrink-0">{entry.value.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </InvestCard>
          )}

          <InvestCard className="p-4 sm:p-5">
            <SectionTitle eyebrow="Rebalance" title="Target vs current" description="Drift beyond 5% is a review trigger." />
            <div className="space-y-3 mt-4">
              {portfolio.allocations.map((allocation) => (
                <div key={allocation.assetClass} className="rounded-xl border border-gray-200 dark:border-zinc-800 p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{allocation.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{allocation.rationale}</p>
                    </div>
                    <p className={`font-semibold text-sm shrink-0 ${Math.abs(allocation.driftPercent) >= 5 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {allocation.currentPercent.toFixed(1)}% / {allocation.targetPercent}%
                    </p>
                  </div>
                  <ProgressBar value={allocation.currentPercent} tone={Math.abs(allocation.driftPercent) >= 5 ? 'amber' : 'blue'} />
                  <p className="text-xs text-gray-400 mt-1.5">
                    Drift: {allocation.driftPercent >= 0 ? '+' : ''}{allocation.driftPercent.toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </InvestCard>
        </div>
      )}

      {/* Holdings list — mobile cards */}
      <InvestCard className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <SectionTitle
            eyebrow="Positions"
            title="Tracked holdings"
            description="Your personal portfolio — add, edit, or remove positions."
          />
          <button
            type="button"
            onClick={() => { cancelEdit(); setShowForm(v => !v); }}
            className="px-4 py-2 rounded-2xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shrink-0"
          >
            {showForm && !editingId ? 'Cancel' : '+ Add holding'}
          </button>
        </div>

        {/* Add / Edit form */}
        {showForm && (
          <form id="portfolio-form" className="mt-5 space-y-3 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 p-4" onSubmit={handleSubmit}>
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              {editingId ? '✏️ Edit position' : '➕ New position'}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={form.symbol}
                onChange={(e) => setForm(c => ({ ...c, symbol: e.target.value.toUpperCase() }))}
                placeholder="Symbol (e.g. RELIANCE)"
                className={inputClass}
              />
              <select
                value={form.assetClass}
                onChange={(e) => setForm(c => ({ ...c, assetClass: e.target.value as AssetClass }))}
                className={inputClass}
              >
                {assetOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <input
              value={form.name}
              onChange={(e) => setForm(c => ({ ...c, name: e.target.value }))}
              placeholder="Instrument name (e.g. Reliance Industries)"
              className={inputClass}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number" min="0.01" step="0.01"
                value={form.quantity}
                onChange={(e) => setForm(c => ({ ...c, quantity: Number(e.target.value) }))}
                placeholder="Units / Quantity"
                className={inputClass}
              />
              <input
                type="number" min="0.01" step="0.01"
                value={form.averageCost}
                onChange={(e) => setForm(c => ({ ...c, averageCost: Number(e.target.value) }))}
                placeholder="Avg. buy price (₹)"
                className={inputClass}
              />
            </div>
            <select
              value={form.goalId}
              onChange={(e) => setForm(c => ({ ...c, goalId: e.target.value }))}
              className={inputClass}
            >
              <option value="">Link to a goal (optional)</option>
              {investmentGoals.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!form.symbol || !form.name || form.quantity <= 0 || form.averageCost <= 0}
                className="flex-1 py-3 rounded-2xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >
                {editingId ? 'Save changes' : 'Add holding'}
              </button>
              <button type="button" onClick={cancelEdit} className="px-4 py-3 rounded-2xl border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Empty state */}
        {holdings.length === 0 && (
          <div className="mt-6 text-center py-12 rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-800">
            <p className="text-3xl mb-3">📊</p>
            <p className="font-semibold text-gray-700 dark:text-gray-200">No holdings yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
              Add your first holding to start tracking your portfolio performance, allocation, and P&L.
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-4 px-5 py-2 rounded-2xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Add your first holding
            </button>
          </div>
        )}

        {/* Mobile cards */}
        {holdings.length > 0 && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {holdings.map((holding) => {
              const stock = priceMap.get(holding.symbol);
              const currentPrice = stock ? stock.price : holding.averageCost;
              const linkedGoal = investmentGoals.find(g => g.id === holding.goalId);
              return (
                <HoldingCard
                  key={holding.id}
                  holding={holding}
                  currentPrice={currentPrice}
                  goalName={linkedGoal?.name}
                  onEdit={() => startEdit(holding)}
                  onRemove={() => removeHolding(holding.id)}
                />
              );
            })}
          </div>
        )}
      </InvestCard>
    </div>
  );
};

