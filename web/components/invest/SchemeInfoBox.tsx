import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import schemesData from '../../data/schemes.json';

type FilterType = 'all' | 'government' | 'private' | 'tax-saving';

interface Scheme {
  id: string;
  name: string;
  type: string;
  returns: number;
  risk: string;
  minAmount: number;
  maxAmount: number | null;
  tenure: string;
  taxSaving: boolean;
  description: string;
  features: string[];
  officialLink: string;
}

export const SchemeInfoBox: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const { monthlySavings, shortlistedSchemes, toggleShortlist } = useFinance();

  const schemes = schemesData as Scheme[];

  const filteredSchemes = useMemo(() => {
    let filtered = schemes;

    if (activeFilter !== 'all') {
      if (activeFilter === 'tax-saving') {
        filtered = filtered.filter(s => s.taxSaving);
      } else {
        filtered = filtered.filter(s => s.type === activeFilter);
      }
    }

    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [schemes, activeFilter, searchQuery]);

  const getReturnsBadgeColor = (returns: number) => {
    if (returns > 8) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (returns >= 5) return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const SchemeCard: React.FC<{ scheme: Scheme }> = ({ scheme }) => {
    const isShortlisted = shortlistedSchemes.includes(scheme.id);
    const canAfford = monthlySavings >= scheme.minAmount;

    return (
      <div
        onClick={() => setSelectedScheme(scheme)}
        className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all cursor-pointer relative"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleShortlist(scheme.id);
          }}
          className="absolute top-3 right-3 text-2xl"
        >
          {isShortlisted ? '⭐' : '☆'}
        </button>

        <h3 className="font-semibold text-slate-900 dark:text-white pr-8 mb-2">
          {scheme.name}
        </h3>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getReturnsBadgeColor(scheme.returns)}`}>
            {scheme.returns}% returns
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(scheme.risk)}`}>
            {scheme.risk} Risk
          </span>
          {scheme.taxSaving && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Tax Saving
            </span>
          )}
        </div>

        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
          <p>Min: ₹{scheme.minAmount.toLocaleString('en-IN')}</p>
          <p>Tenure: {scheme.tenure}</p>
        </div>

        {canAfford && (
          <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm text-green-700 dark:text-green-300">
            💡 You can start with ₹{scheme.minAmount.toLocaleString('en-IN')}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Investment Schemes
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          Explore government and private investment options in India
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search schemes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-10 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white"
        />
        <svg
          className="absolute left-3 top-3.5 w-5 h-5 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'government', 'private', 'tax-saving'] as FilterType[]).map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeFilter === filter
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSchemes.map(scheme => (
          <SchemeCard key={scheme.id} scheme={scheme} />
        ))}
      </div>

      {filteredSchemes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">No schemes found</p>
        </div>
      )}

      {/* Scheme Detail Drawer */}
      {selectedScheme && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSelectedScheme(null)}
          />
          <div className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white pr-8">
                  {selectedScheme.name}
                </h2>
                <button
                  onClick={() => setSelectedScheme(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getReturnsBadgeColor(selectedScheme.returns)}`}>
                  {selectedScheme.returns}% returns
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(selectedScheme.risk)}`}>
                  {selectedScheme.risk} Risk
                </span>
                {selectedScheme.taxSaving && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    Tax Saving
                  </span>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Description</h3>
                  <p className="text-slate-600 dark:text-slate-300">{selectedScheme.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Min Amount</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      ₹{selectedScheme.minAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Max Amount</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {selectedScheme.maxAmount ? `₹${selectedScheme.maxAmount.toLocaleString('en-IN')}` : 'No limit'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Tenure</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{selectedScheme.tenure}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Type</p>
                    <p className="font-semibold text-slate-900 dark:text-white capitalize">{selectedScheme.type}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Key Features</h3>
                  <ul className="space-y-2">
                    {selectedScheme.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={selectedScheme.officialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition-colors"
                >
                  Visit Official Website →
                </a>

                <button
                  onClick={() => toggleShortlist(selectedScheme.id)}
                  className={`w-full py-3 px-4 font-medium rounded-lg transition-colors ${
                    shortlistedSchemes.includes(selectedScheme.id)
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  {shortlistedSchemes.includes(selectedScheme.id) ? '⭐ Shortlisted' : '☆ Add to Shortlist'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
