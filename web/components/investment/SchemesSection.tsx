import React, { useMemo, useState } from 'react';
import { useInvestment } from '../../context/InvestmentContext';
import { SchemeCategory } from '../../types/investment';
import { InvestCard, MetricPill, SectionTitle } from './InvestUI';

const filters: { value: 'all' | SchemeCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'government', label: 'Government' },
  { value: 'retirement', label: 'Retirement' },
  { value: 'tax-saving', label: 'Tax Saving' },
  { value: 'income', label: 'Income' },
  { value: 'gold', label: 'Gold' },
  { value: 'market-linked', label: 'Market-linked' },
];

export const SchemesSection: React.FC = () => {
  const {
    schemes,
    comparisonSchemeIds,
    toggleSchemeComparison,
    recommendations,
    profile,
  } = useInvestment();
  const [filter, setFilter] = useState<'all' | SchemeCategory>('all');
  const [search, setSearch] = useState('');

  const filteredSchemes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return schemes.filter((scheme) => {
      const matchesFilter = filter === 'all' ? true : scheme.category === filter;
      const matchesSearch =
        query.length === 0 ||
        scheme.name.toLowerCase().includes(query) ||
        scheme.idealFor.join(' ').toLowerCase().includes(query) ||
        scheme.highlights.join(' ').toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [filter, schemes, search]);

  const comparedSchemes = schemes.filter((scheme) => comparisonSchemeIds.includes(scheme.id));

  return (
    <div className="space-y-4">
      <InvestCard className="p-5">
        <SectionTitle
          eyebrow="Official Schemes"
          title="Government and tax-saving comparison"
          description="This surface is ready for live sync from official sources. Until credentials or endpoints are supplied, it shows a clearly labeled reference snapshot."
        />
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] mt-5">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search schemes, tax buckets, or use cases"
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-zinc-950/40 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2 overflow-x-auto">
            {filters.map((item) => (
              <button
                type="button"
                key={item.value}
                onClick={() => setFilter(item.value)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${
                  filter === item.value
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white dark:bg-zinc-950/40 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mt-5">
          {filteredSchemes.map((scheme) => {
            const selected = comparisonSchemeIds.includes(scheme.id);
            return (
              <div key={scheme.id} className="rounded-2xl border border-gray-200 dark:border-zinc-800 p-4 bg-gray-50 dark:bg-zinc-950/40">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white">{scheme.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{scheme.category}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSchemeComparison(scheme.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium ${
                      selected
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300'
                    }`}
                  >
                    {selected ? 'Comparing' : 'Compare'}
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <MetricPill label="Rate / Return" value={scheme.interestRate ? `${scheme.interestRate.toFixed(1)}%` : scheme.returnsLabel} tone="positive" />
                  <MetricPill label="Risk" value={scheme.risk} tone={scheme.risk === 'Low' ? 'positive' : scheme.risk === 'Moderate' ? 'warning' : 'negative'} />
                </div>
                <div className="space-y-2 mt-4">
                  {scheme.highlights.map((highlight) => (
                    <div key={highlight} className="text-sm text-gray-700 dark:text-gray-300">
                      {highlight}
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-500">Source</p>
                  <a href={scheme.officialSourceUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {scheme.officialSourceLabel}
                  </a>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{scheme.lastUpdatedLabel}</p>
                </div>
              </div>
            );
          })}
        </div>
      </InvestCard>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <InvestCard className="p-5">
          <SectionTitle eyebrow="Comparison" title="Side-by-side view" description="Pick up to four schemes to compare contribution limits, lock-in, and taxation." />
          <div className="overflow-x-auto mt-5">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-zinc-800">
                  <th className="pb-3 pr-4">Scheme</th>
                  <th className="pb-3 pr-4">Return / Rate</th>
                  <th className="pb-3 pr-4">Eligibility</th>
                  <th className="pb-3 pr-4">Lock-in</th>
                  <th className="pb-3 pr-4">Taxation</th>
                  <th className="pb-3 pr-4">Min / Max</th>
                </tr>
              </thead>
              <tbody>
                {comparedSchemes.map((scheme) => (
                  <tr key={scheme.id} className="border-b border-gray-100 dark:border-zinc-900 align-top">
                    <td className="py-4 pr-4">
                      <p className="font-medium text-gray-900 dark:text-white">{scheme.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{scheme.category}</p>
                    </td>
                    <td className="py-4 pr-4 text-gray-700 dark:text-gray-300">{scheme.interestRate ? `${scheme.interestRate.toFixed(1)}%` : scheme.returnsLabel}</td>
                    <td className="py-4 pr-4 text-gray-700 dark:text-gray-300">{scheme.eligibility}</td>
                    <td className="py-4 pr-4 text-gray-700 dark:text-gray-300">{scheme.lockIn}</td>
                    <td className="py-4 pr-4 text-gray-700 dark:text-gray-300">{scheme.taxation}</td>
                    <td className="py-4 pr-4 text-gray-700 dark:text-gray-300">
                      {scheme.minAmount.toLocaleString('en-IN')} / {scheme.maxAmount ? scheme.maxAmount.toLocaleString('en-IN') : 'No cap'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </InvestCard>

        <InvestCard className="p-5">
          <SectionTitle eyebrow="Tax Lens" title="Suggested buckets" description={`Designed around the ${profile.taxBracket.replace('-', ' to ')} slab and a ${profile.objective.replace('-', ' ')} objective.`} />
          <div className="space-y-3 mt-5">
            {recommendations.schemes.map((item) => (
              <div key={item} className="rounded-2xl border border-gray-200 dark:border-zinc-800 p-4 bg-gray-50 dark:bg-zinc-950/40">
                <p className="text-sm text-gray-800 dark:text-gray-200">{item}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 p-4 mt-5">
            <p className="text-xs uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Implementation note</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
              For production, connect an RBI or official-source sync job so scheme rates and issue windows stay current instead of relying on bundled reference data.
            </p>
          </div>
        </InvestCard>
      </div>
    </div>
  );
};
