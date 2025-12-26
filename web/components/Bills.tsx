import React, { useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { Icons } from './Icons';

const MS_IN_DAY = 24 * 60 * 60 * 1000;

function formatDate(ts: number) {
  try {
    return new Date(ts).toLocaleDateString();
  } catch {
    return '-';
  }
}

export const Bills: React.FC = () => {
  const { transactions, formatCurrency } = useContext(AppContext)!;

  const recurring = useMemo(() => {
    // Group transactions by key (merchant/category/description)
    const groups: Record<string, number[]> = {};
    const amounts: Record<string, number[]> = {};

    transactions.forEach((t) => {
      const key = (t.description || t.category || 'Unknown').toLowerCase();
      if (!groups[key]) groups[key] = [];
      if (!amounts[key]) amounts[key] = [];
      groups[key].push(t.date);
      amounts[key].push(t.amount);
    });

    const results: Array<{
      name: string;
      count: number;
      avgAmount: number;
      lastDate: number;
      avgIntervalDays: number;
      nextDue: number;
    }> = [];

    Object.keys(groups).forEach((k) => {
      const dates = groups[k].slice().sort((a, b) => a - b);
      if (dates.length < 2) return; // need at least 2 occurrences

      // compute average interval
      let totalInterval = 0;
      for (let i = 1; i < dates.length; i++) {
        totalInterval += (dates[i] - dates[i - 1]);
      }
      const avgIntervalMs = totalInterval / (dates.length - 1);
      const avgIntervalDays = Math.round(avgIntervalMs / MS_IN_DAY);
      const lastDate = dates[dates.length - 1];
      const nextDue = lastDate + avgIntervalMs;
      const avgAmount = Math.round((amounts[k].reduce((s, v) => s + v, 0) / amounts[k].length) * 100) / 100;

      results.push({ name: k, count: dates.length, avgAmount, lastDate, avgIntervalDays, nextDue });
    });

    // Sort by nextDue ascending
    results.sort((a, b) => a.nextDue - b.nextDue);
    return results;
  }, [transactions]);

  const now = Date.now();

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><Icons.Calendar /> Bills</h2>

      {recurring.length === 0 && (
        <div className="text-sm text-gray-400">No recurring bills detected yet. Mark transactions with the tag "bill" or add scheduled bills later.</div>
      )}

      <div className="mt-4 space-y-3">
        {recurring.map((r) => {
          const daysUntil = Math.round((r.nextDue - now) / MS_IN_DAY);
          return (
            <div key={r.name} className="bg-zinc-800/60 border border-zinc-700 p-3 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium capitalize">{r.name}</div>
                  <div className="text-sm text-gray-300">Avg {r.count}× • {r.avgIntervalDays}d interval</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(r.avgAmount)}</div>
                  <div className="text-sm text-gray-300">Next: {formatDate(r.nextDue)}{daysUntil >= 0 ? ` (${daysUntil}d)` : ' (overdue)'}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Bills;
