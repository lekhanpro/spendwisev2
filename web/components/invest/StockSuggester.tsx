import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { RiskProfileForm } from './RiskProfileForm';
import stocksData from '../../data/stocksData.json';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Stock {
  id: string;
  name: string;
  symbol: string;
  sector: string;
  price: number;
  change: number;
  marketCap: string;
  pe: number;
  dividendYield: number;
  description: string;
}

export const StockSuggester: React.FC = () => {
  const { riskProfile, monthlySavings, trackedStocks, toggleTrackedStock } = useFinance();
  const [showQuiz, setShowQuiz] = useState(!riskProfile);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'change' | 'dividendYield'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sipAmount, setSipAmount] = useState(5000);
  const [sipYears, setSipYears] = useState(10);

  if (showQuiz) {
    return <RiskProfileForm onComplete={() => setShowQuiz(false)} />;
  }

  const getPortfolioAllocation = () => {
    const savings = monthlySavings > 0 ? monthlySavings : 10000;

    switch (riskProfile) {
      case 'conservative':
        return [
          { category: 'Debt Mutual Funds', percentage: 60, amount: savings * 0.6 },
          { category: 'PPF', percentage: 20, amount: savings * 0.2 },
          { category: 'Gold ETF', percentage: 10, amount: savings * 0.1 },
          { category: 'Large-cap Index', percentage: 10, amount: savings * 0.1 }
        ];
      case 'moderate':
        return [
          { category: 'Large-cap Stocks', percentage: 40, amount: savings * 0.4 },
          { category: 'Mid-cap Stocks', percentage: 20, amount: savings * 0.2 },
          { category: 'Debt Funds', percentage: 20, amount: savings * 0.2 },
          { category: 'REITs', percentage: 10, amount: savings * 0.1 },
          { category: 'Gold ETF', percentage: 10, amount: savings * 0.1 }
        ];
      case 'aggressive':
        return [
          { category: 'Small/Mid-cap', percentage: 50, amount: savings * 0.5 },
          { category: 'Sectoral Funds', percentage: 20, amount: savings * 0.2 },
          { category: 'Direct Stocks', percentage: 15, amount: savings * 0.15 },
          { category: 'Crypto ETF', percentage: 10, amount: savings * 0.1 },
          { category: 'International', percentage: 5, amount: savings * 0.05 }
        ];
      default:
        return [];
    }
  };

  const getAllStocks = (): Stock[] => {
    return [
      ...stocksData.bluechip,
      ...stocksData.midcap,
      ...stocksData.dividend
    ];
  };

  const sortedStocks = React.useMemo(() => {
    const stocks = getAllStocks();
    return [...stocks].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'change':
          comparison = a.change - b.change;
          break;
        case 'dividendYield':
          comparison = a.dividendYield - b.dividendYield;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [sortBy, sortOrder]);

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const calculateSIP = () => {
    const monthlyRate = 0.12 / 12; // Assuming 12% annual return
    const months = sipYears * 12;
    const futureValue = sipAmount * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
    const invested = sipAmount * months;
    const returns = futureValue - invested;

    return [
      { name: 'Invested', amount: Math.round(invested) },
      { name: 'Returns', amount: Math.round(returns) },
      { name: 'Total', amount: Math.round(futureValue) }
    ];
  };

  const sipData = calculateSIP();
  const allocation = getPortfolioAllocation();

  return (
    <div className="space-y-8">
      {/* Profile Badge */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Your Risk Profile</h2>
            <p className="text-xl capitalize">{riskProfile}</p>
          </div>
          <button
            onClick={() => setShowQuiz(true)}
            className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Retake Quiz
          </button>
        </div>
      </div>

      {/* Portfolio Allocation */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Recommended Portfolio Allocation
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Based on your {riskProfile} profile and monthly savings of ₹{monthlySavings.toLocaleString('en-IN')}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-slate-700 dark:text-slate-300">Category</th>
                <th className="text-right py-3 px-4 text-slate-700 dark:text-slate-300">Allocation</th>
                <th className="text-right py-3 px-4 text-slate-700 dark:text-slate-300">Amount</th>
              </tr>
            </thead>
            <tbody>
              {allocation.map((item, index) => (
                <tr key={index} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-3 px-4 text-slate-900 dark:text-white">{item.category}</td>
                  <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-300">
                    {item.percentage}%
                  </td>
                  <td className="text-right py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    ₹{Math.round(item.amount).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Watchlist */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Curated Stock Watchlist
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th
                  onClick={() => handleSort('name')}
                  className="text-left py-3 px-4 text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left py-3 px-4 text-slate-700 dark:text-slate-300">Sector</th>
                <th
                  onClick={() => handleSort('price')}
                  className="text-right py-3 px-4 text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('change')}
                  className="text-right py-3 px-4 text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Change {sortBy === 'change' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('dividendYield')}
                  className="text-right py-3 px-4 text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Div Yield {sortBy === 'dividendYield' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-center py-3 px-4 text-slate-700 dark:text-slate-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedStocks.map(stock => (
                <tr key={stock.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{stock.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{stock.symbol}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{stock.sector}</td>
                  <td className="text-right py-3 px-4 text-slate-900 dark:text-white">
                    ₹{stock.price.toLocaleString('en-IN')}
                  </td>
                  <td className={`text-right py-3 px-4 font-semibold ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.change}%
                  </td>
                  <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-300">
                    {stock.dividendYield}%
                  </td>
                  <td className="text-center py-3 px-4">
                    <button
                      onClick={() => toggleTrackedStock(stock.id)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        trackedStocks.includes(stock.id)
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {trackedStocks.includes(stock.id) ? 'Tracking' : 'Track'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SIP Calculator */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          SIP Calculator
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Monthly Investment: ₹{sipAmount.toLocaleString('en-IN')}
              </label>
              <input
                type="range"
                min="500"
                max="50000"
                step="500"
                value={sipAmount}
                onChange={(e) => setSipAmount(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Investment Period: {sipYears} years
              </label>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={sipYears}
                onChange={(e) => setSipYears(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-300">Total Invested:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ₹{sipData[0].amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-300">Expected Returns:</span>
                <span className="font-semibold text-green-600">
                  ₹{sipData[1].amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-slate-900 dark:text-white font-semibold">Total Value:</span>
                <span className="font-bold text-blue-600">
                  ₹{sipData[2].amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
          <div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sipData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                <Legend />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
              *Assuming 12% annual returns
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
