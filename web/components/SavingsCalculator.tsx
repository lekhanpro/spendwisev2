import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Icons } from './Icons';

export const SavingsCalculator: React.FC = () => {
  const { formatCurrency } = useContext(AppContext)!;
  const [targetAmount, setTargetAmount] = useState(10000);
  const [currentSavings, setCurrentSavings] = useState(2000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [interestRate, setInterestRate] = useState(5);

  const calculateTimeToGoal = () => {
    const remaining = targetAmount - currentSavings;
    if (remaining <= 0) return { months: 0, years: 0, totalInterest: 0 };

    const monthlyRate = interestRate / 100 / 12;
    let balance = currentSavings;
    let months = 0;
    let totalInterest = 0;

    while (balance < targetAmount && months < 600) {
      const interest = balance * monthlyRate;
      balance += monthlyContribution + interest;
      totalInterest += interest;
      months++;
    }

    return {
      months,
      years: Math.floor(months / 12),
      remainingMonths: months % 12,
      totalInterest,
      finalAmount: balance
    };
  };

  const result = calculateTimeToGoal();

  const getMonthlyBreakdown = () => {
    const data = [];
    let balance = currentSavings;
    const monthlyRate = interestRate / 100 / 12;

    for (let i = 0; i <= Math.min(result.months, 24); i++) {
      data.push({
        month: i,
        balance: balance,
        contribution: monthlyContribution,
        interest: balance * monthlyRate
      });
      balance += monthlyContribution + (balance * monthlyRate);
    }
    return data;
  };

  const breakdown = getMonthlyBreakdown();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">🧮 Savings Calculator</h2>

      {/* Input Form */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Target Amount</label>
          <input
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(parseFloat(e.target.value) || 0)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-lg font-semibold"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-1 block">Current Savings</label>
          <input
            type="number"
            value={currentSavings}
            onChange={(e) => setCurrentSavings(parseFloat(e.target.value) || 0)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-1 block">Monthly Contribution</label>
          <input
            type="number"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(parseFloat(e.target.value) || 0)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-1 block">Annual Interest Rate (%)</label>
          <input
            type="number"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white"
          />
        </div>
      </div>

      {/* Results */}
      <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-blue-500/30 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">📊 Results</h3>
        
        {result.months > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-sm text-blue-200">Time to Goal</p>
                <p className="text-2xl font-bold text-white">
                  {result.years > 0 && `${result.years}y `}
                  {result.remainingMonths}m
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-sm text-blue-200">Total Interest</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(result.totalInterest)}</p>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-sm text-blue-200 mb-2">Final Amount</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(result.finalAmount)}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-blue-200">Monthly Breakdown (First 24 months)</p>
              <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                {breakdown.map((month, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-white/5 rounded-lg px-3 py-2">
                    <span className="text-gray-300">Month {month.month}</span>
                    <span className="text-white font-medium">{formatCurrency(month.balance)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-white font-semibold">You've already reached your goal!</p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
        <p className="text-sm text-yellow-300">
          💡 <strong>Tip:</strong> Increase your monthly contribution by just {formatCurrency(100)} to reach your goal {Math.floor((result.months - calculateTimeToGoal().months) / 12)} months faster!
        </p>
      </div>
    </div>
  );
};
