import React, { useState, useEffect } from 'react';
import { SchemeInfoBox } from '../../components/invest/SchemeInfoBox';
import { StockSuggester } from '../../components/invest/StockSuggester';
import { LearnPage } from './LearnPage';
import { useFinance } from '../../context/FinanceContext';

type InvestTab = 'schemes' | 'stocks' | 'learn';

export const InvestPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InvestTab>('schemes');
  const { learnProgress } = useFinance();

  // Auto-redirect new users to learn page on first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('spendwise_invest_visited');
    const hasAnyProgress = Object.keys(learnProgress).length > 0;
    
    if (!hasVisited && !hasAnyProgress) {
      setActiveTab('learn');
      localStorage.setItem('spendwise_invest_visited', 'true');
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Investment Hub
            </h1>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('schemes')}
              className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'schemes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              💰 Schemes & Plans
            </button>
            <button
              onClick={() => setActiveTab('stocks')}
              className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'stocks'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              📈 Stock Suggester
            </button>
            <button
              onClick={() => setActiveTab('learn')}
              className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'learn'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              📚 Learn
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {activeTab === 'schemes' && <SchemeInfoBox />}
        {activeTab === 'stocks' && <StockSuggester />}
        {activeTab === 'learn' && <LearnPage />}
      </div>
    </div>
  );
};
