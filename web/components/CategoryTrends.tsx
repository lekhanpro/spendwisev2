import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const CategoryTrends: React.FC = () => {
  const { transactions, categories, formatCurrency } = useContext(AppContext)!;

  // Get last 6 months data
  const getLast6MonthsData = () => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).getTime();

      const monthTransactions = transactions.filter(t => 
        t.type === 'expense' && t.date >= monthStart && t.date <= monthEnd
      );

      const monthData: any = {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        fullDate: date
      };

      // Calculate spending per category
      categories.filter(c => c.type === 'expense').forEach(cat => {
        const categorySpending = monthTransactions
          .filter(t => t.category === cat.id)
          .reduce((sum, t) => sum + t.amount, 0);
        monthData[cat.name] = categorySpending;
      });

      data.push(monthData);
    }
    return data;
  };

  const trendData = getLast6MonthsData();

  // Calculate category statistics
  const getCategoryStats = () => {
    const stats = categories.filter(c => c.type === 'expense').map(cat => {
      const last6Months = trendData.map(d => d[cat.name] || 0);
      const total = last6Months.reduce((sum, val) => sum + val, 0);
      const average = total / 6;
      const lastMonth = last6Months[5] || 0;
      const previousMonth = last6Months[4] || 0;
      const change = previousMonth > 0 ? ((lastMonth - previousMonth) / previousMonth) * 100 : 0;
      const trend = change > 5 ? 'up' : change < -5 ? 'down' : 'stable';

      return {
        category: cat,
        total,
        average,
        lastMonth,
        change,
        trend,
        color: cat.color
      };
    }).filter(s => s.total > 0).sort((a, b) => b.total - a.total);

    return stats;
  };

  const stats = getCategoryStats();
  const topCategories = stats.slice(0, 5);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">📈 Category Trends</h2>

      {/* Trend Chart */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl p-4">
        <h3 className="font-semibold text-white mb-4">6-Month Spending Trends</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                hide
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(24, 24, 27, 0.9)', 
                  borderRadius: '12px', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff'
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="line"
              />
              {topCategories.map(stat => (
                <Line
                  key={stat.category.id}
                  type="monotone"
                  dataKey={stat.category.name}
                  stroke={stat.color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Statistics */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl p-4">
        <h3 className="font-semibold text-white mb-4">Category Analysis</h3>
        <div className="space-y-3">
          {stats.map(stat => (
            <div key={stat.category.id} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border border-zinc-700"
                style={{ backgroundColor: stat.color + '15' }}
              >
                {stat.category.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-white">{stat.category.name}</span>
                  <span className="text-sm font-semibold text-white">{formatCurrency(stat.lastMonth)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Avg: {formatCurrency(stat.average)}</span>
                  <div className="flex items-center gap-1">
                    {stat.trend === 'up' && <span className="text-red-400">↑ {Math.abs(stat.change).toFixed(0)}%</span>}
                    {stat.trend === 'down' && <span className="text-green-400">↓ {Math.abs(stat.change).toFixed(0)}%</span>}
                    {stat.trend === 'stable' && <span className="text-gray-400">→ Stable</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <p className="text-sm font-semibold text-blue-300 mb-2">💡 Insights</p>
        {stats[0] && (
          <p className="text-sm text-blue-200 mb-1">
            Your highest spending category is <strong>{stats[0].category.name}</strong> at {formatCurrency(stats[0].lastMonth)} last month.
          </p>
        )}
        {stats.find(s => s.trend === 'up') && (
          <p className="text-sm text-yellow-300">
            ⚠️ Watch out! Some categories are trending upward.
          </p>
        )}
        {stats.find(s => s.trend === 'down') && (
          <p className="text-sm text-green-300">
            ✅ Great job! You're reducing spending in some categories.
          </p>
        )}
      </div>
    </div>
  );
};
