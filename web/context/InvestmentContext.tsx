import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppContext } from './AppContext';
import { NotificationContext } from './NotificationContext';
import {
  allocationLabels,
  buildRoadmapSkeleton,
  createMockMarketSnapshot,
  createTargetAllocation,
  defaultHoldings,
  defaultInvestmentGoals,
  defaultInvestorProfile,
  defaultNotificationPreferences,
  mutualFundBuckets,
  schemeCatalog,
} from '../lib/investment/mockData';
import {
  fetchLiveMarketSnapshot,
  fetchLiveStockDetails,
  isLiveMarketDataEnabled,
} from '../lib/investment/liveData';
import {
  AllocationTarget,
  AssetClass,
  InAppNotificationPreferences,
  InvestmentContextType,
  InvestmentGoal,
  InvestmentRecommendations,
  InvestmentRiskBand,
  InvestorProfile,
  PortfolioHolding,
  PortfolioSnapshot,
  RoadmapAction,
} from '../types/investment';

const STORAGE_PREFIX = 'spendwise-investment-v2';
const DEFAULT_WATCHLIST = ['RELIANCE', 'HDFCBANK', 'TCS', 'INFY'];

function buildStorageKey(userId: string | undefined, key: string) {
  return `${STORAGE_PREFIX}:${userId ?? 'guest'}:${key}`;
}

function readStorage<T extends object>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? ({ ...fallback, ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}

function readArrayStorage<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function clampRiskTolerance(value: number): InvestorProfile['riskTolerance'] {
  return Math.min(5, Math.max(1, Math.round(value))) as InvestorProfile['riskTolerance'];
}

function calculateRiskBand(profile: InvestorProfile): InvestmentRiskBand {
  let score = 0;

  if (profile.investmentHorizonYears >= 10) score += 2;
  else if (profile.investmentHorizonYears >= 5) score += 1;

  score += profile.riskTolerance - 1;

  if (profile.experience === 'advanced') score += 2;
  else if (profile.experience === 'intermediate') score += 1;

  if (profile.age <= 35) score += 1;
  if (profile.emergencyFundMonths < 3) score -= 2;
  else if (profile.emergencyFundMonths < 6) score -= 1;

  if (profile.objective === 'retirement' || profile.objective === 'wealth') score += 1;
  if (profile.objective === 'income') score -= 1;

  if (score <= 2) return 'conservative';
  if (score <= 5) return 'balanced';
  if (score <= 8) return 'growth';
  return 'aggressive';
}

function resolveHoldingPrice(holding: PortfolioHolding, stockPrices: Map<string, number>) {
  if (stockPrices.has(holding.symbol)) {
    return stockPrices.get(holding.symbol)!;
  }

  if (holding.symbol === 'SGB') {
    return Number((holding.averageCost * 1.12).toFixed(2));
  }

  if (holding.symbol === 'PPF') {
    return Number((holding.averageCost * 1.07).toFixed(2));
  }

  return holding.averageCost;
}

function resolveTargetMix(riskBand: InvestmentRiskBand) {
  return createTargetAllocation(riskBand);
}

function buildPortfolioSnapshot(
  holdings: PortfolioHolding[],
  riskBand: InvestmentRiskBand,
  stockPrices: Map<string, number>,
  stockChanges: Map<string, number>
): PortfolioSnapshot {
  const enriched = holdings.map((holding) => {
    const currentPrice = resolveHoldingPrice(holding, stockPrices);
    const investedValue = holding.quantity * holding.averageCost;
    const currentValue = holding.quantity * currentPrice;
    const dayChange = stockChanges.has(holding.symbol)
      ? holding.quantity * stockChanges.get(holding.symbol)!
      : 0;

    return {
      ...holding,
      currentPrice,
      investedValue,
      currentValue,
      dayChange,
    };
  });

  const totalInvested = enriched.reduce((sum, holding) => sum + holding.investedValue, 0);
  const totalValue = enriched.reduce((sum, holding) => sum + holding.currentValue, 0);
  const totalGain = totalValue - totalInvested;
  const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
  const dayChange = enriched.reduce((sum, holding) => sum + holding.dayChange, 0);

  const currentMix = enriched.reduce<Record<AssetClass, number>>(
    (acc, holding) => {
      acc[holding.assetClass] += holding.currentValue;
      return acc;
    },
    {
      equity: 0,
      debt: 0,
      gold: 0,
      'real-estate': 0,
      international: 0,
      cash: 0,
    }
  );

  const targetMix = resolveTargetMix(riskBand);
  const allocations: AllocationTarget[] = (Object.keys(targetMix) as AssetClass[]).map((assetClass) => {
    const currentPercent = totalValue > 0 ? (currentMix[assetClass] / totalValue) * 100 : 0;
    const targetPercent = targetMix[assetClass];
    return {
      assetClass,
      label: allocationLabels[assetClass],
      currentPercent: Number(currentPercent.toFixed(1)),
      targetPercent,
      driftPercent: Number((currentPercent - targetPercent).toFixed(1)),
      rationale:
        assetClass === 'equity'
          ? 'Growth engine for long-term compounding.'
          : assetClass === 'debt'
            ? 'Stability and liquidity for planned goals.'
            : assetClass === 'gold'
              ? 'Diversifier during macro stress.'
              : assetClass === 'cash'
                ? 'Dry powder and emergency liquidity.'
                : assetClass === 'international'
                  ? 'Geographic diversification.'
                  : 'Optional inflation hedge.',
    };
  });

  return {
    totalInvested: Number(totalInvested.toFixed(2)),
    totalValue: Number(totalValue.toFixed(2)),
    totalGain: Number(totalGain.toFixed(2)),
    totalGainPercent: Number(totalGainPercent.toFixed(2)),
    dayChange: Number(dayChange.toFixed(2)),
    benchmarkGapPercent: Number((totalGainPercent - 13.2).toFixed(2)),
    allocations,
  };
}

function buildRecommendations(
  riskBand: InvestmentRiskBand,
  profile: InvestorProfile
): InvestmentRecommendations {
  const summaryMap: Record<InvestmentRiskBand, string> = {
    conservative: 'Keep the portfolio defensive, tax-aware, and cash-flow predictable.',
    balanced: 'Blend core equity compounding with disciplined debt and tax planning.',
    growth: 'Lean into equity growth but keep diversification and rebalancing rules intact.',
    aggressive: 'Pursue higher upside through equity-heavy positioning while protecting downside with a hard rebalance rule.',
  };

  const stockBucketsMap: Record<InvestmentRiskBand, string[]> = {
    conservative: ['Dividend-heavy large caps', 'Private bank leaders', 'Defensive pharma compounders'],
    balanced: ['Core large-cap banks', 'IT services leaders', 'Infrastructure execution winners'],
    growth: ['Large-cap compounders', 'Selective cyclicals', 'Quality industrials and market leaders'],
    aggressive: ['High-conviction large caps', 'Mid-cap satellites', 'Momentum-led sector rotation watchlist'],
  };

  const schemes =
    profile.taxBracket === 'below-5'
      ? ['PPF for stable debt allocation', 'SGB for strategic gold exposure']
      : ['NPS for retirement plus extra 80CCD benefit', 'PPF or ELSS depending lock-in comfort', 'SGB for gold allocation'];

  const mutualFundsByRisk = mutualFundBuckets.filter((bucket) => {
    if (riskBand === 'conservative') return bucket.risk !== 'High';
    if (riskBand === 'balanced') return true;
    if (riskBand === 'growth') return bucket.category !== 'Debt' || bucket.risk === 'Low';
    return true;
  });

  const taxIdeas = [
    'Map 80C usage before year-end instead of rushing into last-minute products.',
    'Use NPS only if retirement lock-in matches your plan and tax bracket makes it worthwhile.',
    'Keep debt goals separate from equity goals to avoid forced exits.',
  ];

  return {
    summary: summaryMap[riskBand],
    stockBuckets: stockBucketsMap[riskBand],
    mutualFunds: mutualFundsByRisk,
    schemes,
    taxIdeas,
  };
}

function buildRoadmap(
  profile: InvestorProfile,
  portfolio: PortfolioSnapshot,
  goals: InvestmentGoal[]
): RoadmapAction[] {
  const actions = [...buildRoadmapSkeleton()];

  if (profile.emergencyFundMonths < 6) {
    actions.unshift({
      id: 'liquidity-gap',
      timeline: 'Now',
      title: 'Close the emergency fund gap',
      description: `Increase liquid reserves from ${profile.emergencyFundMonths} to 6 months before raising satellite risk.`,
      focus: 'risk',
    });
  }

  const drift = portfolio.allocations
    .filter((allocation) => Math.abs(allocation.driftPercent) >= 5)
    .sort((a, b) => Math.abs(b.driftPercent) - Math.abs(a.driftPercent))[0];

  if (drift) {
    actions.splice(2, 0, {
      id: `rebalance-${drift.assetClass}`,
      timeline: 'Next 30 Days',
      title: `Rebalance ${drift.label.toLowerCase()} exposure`,
      description: `${drift.label} is drifting ${Math.abs(drift.driftPercent).toFixed(1)} percentage points from target allocation.`,
      focus: 'allocation',
    });
  }

  const urgentGoal = goals
    .map((goal) => ({
      ...goal,
      daysLeft: Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
      progress: goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0,
    }))
    .filter((goal) => goal.daysLeft < 540)
    .sort((a, b) => a.daysLeft - b.daysLeft)[0];

  if (urgentGoal) {
    actions.push({
      id: `goal-${urgentGoal.id}`,
      timeline: 'Next 90 Days',
      title: `De-risk funding for ${urgentGoal.name}`,
      description: `Shift short-horizon money into debt and cash buffers because the goal is ${urgentGoal.daysLeft} days away.`,
      focus: 'goal',
    });
  }

  return actions.slice(0, 6);
}

export const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

interface InvestmentProviderProps {
  children: ReactNode;
}

export const InvestmentProvider: React.FC<InvestmentProviderProps> = ({ children }) => {
  const appContext = useContext(AppContext);
  const notificationContext = useContext(NotificationContext);
  const userId = appContext?.session?.user?.id as string | undefined;
  const liveMarketEnabled = isLiveMarketDataEnabled();

  const [tick, setTick] = useState(0);
  const [market, setMarket] = useState(() => createMockMarketSnapshot(0));
  const [detailedSymbols, setDetailedSymbols] = useState<Record<string, true>>({});
  const [profile, setProfile] = useState<InvestorProfile>(() =>
    readStorage(buildStorageKey(userId, 'profile'), defaultInvestorProfile)
  );
  const [watchlist, setWatchlist] = useState<string[]>(() =>
    readArrayStorage(buildStorageKey(userId, 'watchlist'), DEFAULT_WATCHLIST)
  );
  const [holdings, setHoldings] = useState<PortfolioHolding[]>(() =>
    readArrayStorage(buildStorageKey(userId, 'holdings'), [])
  );
  const [investmentGoals, setInvestmentGoals] = useState<InvestmentGoal[]>(() =>
    readArrayStorage(buildStorageKey(userId, 'goals'), [])
  );
  const [selectedStock, setSelectedStock] = useState(() => DEFAULT_WATCHLIST[0]);
  const [selectedRange, setSelectedRange] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | '5Y'>('1M');
  const [comparisonSchemeIds, setComparisonSchemeIds] = useState<string[]>(() =>
    readArrayStorage(buildStorageKey(userId, 'comparisonSchemes'), ['ppf', 'nps', 'elss'])
  );
  const [notificationPreferences, setNotificationPreferences] = useState<InAppNotificationPreferences>(() =>
    readStorage(buildStorageKey(userId, 'notificationPrefs'), defaultNotificationPreferences)
  );

  useEffect(() => {
    setProfile(readStorage(buildStorageKey(userId, 'profile'), defaultInvestorProfile));
    setWatchlist(readArrayStorage(buildStorageKey(userId, 'watchlist'), DEFAULT_WATCHLIST));
    setHoldings(readArrayStorage(buildStorageKey(userId, 'holdings'), []));
    setInvestmentGoals(readArrayStorage(buildStorageKey(userId, 'goals'), []));
    setComparisonSchemeIds(readArrayStorage(buildStorageKey(userId, 'comparisonSchemes'), ['ppf', 'nps', 'elss']));
    setNotificationPreferences(readStorage(buildStorageKey(userId, 'notificationPrefs'), defaultNotificationPreferences));
  }, [userId]);

  useEffect(() => {
    if (liveMarketEnabled) return undefined;

    const interval = window.setInterval(() => {
      setTick((current) => current + 1);
    }, 25000);

    return () => window.clearInterval(interval);
  }, [liveMarketEnabled]);

  useEffect(() => {
    if (liveMarketEnabled) return;
    setMarket(createMockMarketSnapshot(tick));
  }, [liveMarketEnabled, tick]);

  useEffect(() => {
    if (!liveMarketEnabled) {
      setDetailedSymbols({});
      return;
    }

    let cancelled = false;
    const baseSnapshot = createMockMarketSnapshot(0);

    setMarket({
      ...baseSnapshot,
      mode: 'hybrid',
      providerLabel: 'Loading Alpha Vantage and GNews...',
    });

    fetchLiveMarketSnapshot(baseSnapshot)
      .then((snapshot) => {
        if (!cancelled) {
          setMarket(snapshot);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMarket(baseSnapshot);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [liveMarketEnabled]);

  useEffect(() => {
    if (appContext) {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
      const monthTransactions = appContext.transactions.filter((item) => item.date >= monthStart && item.date <= monthEnd);
      const income = monthTransactions
        .filter((item) => item.type === 'income')
        .reduce((sum, item) => sum + item.amount, 0);
      const expenses = monthTransactions
        .filter((item) => item.type === 'expense')
        .reduce((sum, item) => sum + item.amount, 0);
      const investable = Math.max(0, Math.round(income - expenses));

      if (investable > 0 && profile.monthlyInvestable !== investable) {
        setProfile((current) => ({
          ...current,
          monthlyInvestable: investable,
        }));
      }
    }
  }, [appContext?.transactions, profile.monthlyInvestable]);

  useEffect(() => {
    writeStorage(buildStorageKey(userId, 'profile'), profile);
  }, [profile, userId]);

  useEffect(() => {
    writeStorage(buildStorageKey(userId, 'watchlist'), watchlist);
  }, [watchlist, userId]);

  useEffect(() => {
    writeStorage(buildStorageKey(userId, 'holdings'), holdings);
  }, [holdings, userId]);

  useEffect(() => {
    writeStorage(buildStorageKey(userId, 'goals'), investmentGoals);
  }, [investmentGoals, userId]);

  useEffect(() => {
    writeStorage(buildStorageKey(userId, 'comparisonSchemes'), comparisonSchemeIds);
  }, [comparisonSchemeIds, userId]);

  useEffect(() => {
    writeStorage(buildStorageKey(userId, 'notificationPrefs'), notificationPreferences);
  }, [notificationPreferences, userId]);

  const availableStocks = market.stocks;
  const riskBand = useMemo(() => calculateRiskBand(profile), [profile]);

  useEffect(() => {
    if (!liveMarketEnabled || detailedSymbols[selectedStock]) return;

    const selected = market.stocks.find((stock) => stock.symbol === selectedStock);
    if (!selected) return;

    let cancelled = false;

    fetchLiveStockDetails(selected)
      .then((details) => {
        if (cancelled) return;

        setDetailedSymbols((current) => ({
          ...current,
          [selectedStock]: true,
        }));

        if (!details) return;

        setMarket((current) => ({
          ...current,
          lastUpdated: Date.now(),
          stocks: current.stocks.map((stock) =>
            stock.symbol === selectedStock ? { ...stock, ...details } : stock
          ),
        }));
      })
      .catch(() => {
        if (!cancelled) {
          setDetailedSymbols((current) => ({
            ...current,
            [selectedStock]: true,
          }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [detailedSymbols, liveMarketEnabled, market.stocks, selectedStock]);

  useEffect(() => {
    const universe = new Set(availableStocks.map((stock) => stock.symbol));
    if (!universe.has(selectedStock)) {
      const fallback = watchlist.find((symbol) => universe.has(symbol)) ?? availableStocks[0]?.symbol;
      if (fallback) {
        setSelectedStock(fallback);
      }
    }
  }, [availableStocks, selectedStock, watchlist]);

  const stockPrices = useMemo(
    () => new Map(availableStocks.map((stock) => [stock.symbol, stock.price] as const)),
    [availableStocks]
  );
  const stockChanges = useMemo(
    () => new Map(availableStocks.map((stock) => [stock.symbol, stock.change] as const)),
    [availableStocks]
  );

  const portfolio = useMemo(
    () => buildPortfolioSnapshot(holdings, riskBand, stockPrices, stockChanges),
    [holdings, riskBand, stockPrices, stockChanges]
  );

  const recommendations = useMemo(
    () => buildRecommendations(riskBand, profile),
    [profile, riskBand]
  );

  const roadmap = useMemo(
    () => buildRoadmap(profile, portfolio, investmentGoals),
    [investmentGoals, portfolio, profile]
  );

  useEffect(() => {
    if (!notificationPreferences.rebalanceAlerts || !notificationContext) return;

    portfolio.allocations
      .filter((allocation) => Math.abs(allocation.driftPercent) >= 6)
      .forEach((allocation) => {
        notificationContext.addNotification({
          type: 'portfolio',
          title: 'Rebalance watch',
          message: `${allocation.label} is drifting ${Math.abs(allocation.driftPercent).toFixed(1)}% away from target.`,
          priority: 'medium',
          dedupeKey: `rebalance-${allocation.assetClass}`,
        });
      });
  }, [notificationContext, notificationPreferences.rebalanceAlerts, portfolio.allocations]);

  useEffect(() => {
    if (!notificationPreferences.goalAlerts || !notificationContext) return;

    investmentGoals.forEach((goal) => {
      const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;

      if (daysLeft < 365 && progress < 55) {
        notificationContext.addNotification({
          type: 'goal',
          title: 'Goal needs a plan refresh',
          message: `${goal.name} is ${daysLeft} days away and only ${progress.toFixed(0)}% funded.`,
          priority: 'high',
          dedupeKey: `goal-${goal.id}`,
        });
      }
    });
  }, [investmentGoals, notificationContext, notificationPreferences.goalAlerts]);

  useEffect(() => {
    if (!notificationPreferences.schemeAlerts || !notificationContext) return;
    if (profile.taxBracket === 'below-5') return;

    notificationContext.addNotification({
      type: 'scheme',
      title: 'Tax-saving bucket review',
      message: 'Review 80C, NPS, and debt allocation before the year-end rush.',
      priority: 'low',
      dedupeKey: 'tax-review',
    });
  }, [notificationContext, notificationPreferences.schemeAlerts, profile.taxBracket]);

  const updateProfile = (updates: Partial<InvestorProfile>) => {
    setProfile((current) => ({
      ...current,
      ...updates,
      riskTolerance:
        updates.riskTolerance !== undefined ? clampRiskTolerance(updates.riskTolerance) : current.riskTolerance,
    }));
  };

  const toggleWatchlist = (symbol: string) => {
    setWatchlist((current) => {
      const exists = current.includes(symbol);
      const next = exists ? current.filter((item) => item !== symbol) : [...current, symbol];

      if (notificationPreferences.marketAlerts && notificationContext) {
        notificationContext.addNotification({
          type: 'market',
          title: exists ? 'Removed from watchlist' : 'Added to watchlist',
          message: `${symbol} has been ${exists ? 'removed from' : 'added to'} your tracked names.`,
          priority: 'low',
          dedupeKey: `watch-${symbol}-${exists ? 'remove' : 'add'}`,
        });
      }

      return next;
    });
  };

  const addHolding = (holding: Omit<PortfolioHolding, 'id'>) => {
    setHoldings((current) => [...current, { ...holding, id: generateId('holding') }]);
  };

  const updateHolding = (holding: PortfolioHolding) => {
    setHoldings((current) => current.map((item) => (item.id === holding.id ? holding : item)));
  };

  const removeHolding = (id: string) => {
    setHoldings((current) => current.filter((item) => item.id !== id));
  };

  const addInvestmentGoal = (goal: Omit<InvestmentGoal, 'id'>) => {
    const nextGoal = { ...goal, id: generateId('goal') };
    setInvestmentGoals((current) => [...current, nextGoal]);

    if (notificationPreferences.goalAlerts && notificationContext) {
      notificationContext.addNotification({
        type: 'goal',
        title: 'Investment goal created',
        message: `${goal.name} is now part of your roadmap.`,
        priority: 'low',
        dedupeKey: `goal-create-${goal.name}`,
      });
    }
  };

  const updateInvestmentGoal = (goal: InvestmentGoal) => {
    setInvestmentGoals((current) => current.map((item) => (item.id === goal.id ? goal : item)));
  };

  const removeInvestmentGoal = (id: string) => {
    setInvestmentGoals((current) => current.filter((item) => item.id !== id));
  };

  const toggleSchemeComparison = (schemeId: string) => {
    setComparisonSchemeIds((current) => {
      if (current.includes(schemeId)) {
        return current.filter((item) => item !== schemeId);
      }

      return [...current, schemeId].slice(-4);
    });
  };

  const updateNotificationPreference = (key: keyof InAppNotificationPreferences, value: boolean) => {
    setNotificationPreferences((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const contextValue: InvestmentContextType = {
    market,
    availableStocks,
    schemes: schemeCatalog,
    mutualFundBuckets,
    profile,
    riskBand,
    watchlist,
    holdings,
    investmentGoals,
    selectedStock,
    selectedRange,
    comparisonSchemeIds,
    notificationPreferences,
    portfolio,
    recommendations,
    roadmap,
    setSelectedStock,
    setSelectedRange,
    updateProfile,
    toggleWatchlist,
    addHolding,
    updateHolding,
    removeHolding,
    addInvestmentGoal,
    updateInvestmentGoal,
    removeInvestmentGoal,
    toggleSchemeComparison,
    updateNotificationPreference,
  };

  return <InvestmentContext.Provider value={contextValue}>{children}</InvestmentContext.Provider>;
};

export function useInvestment() {
  const context = useContext(InvestmentContext);
  if (!context) {
    throw new Error('useInvestment must be used within InvestmentProvider');
  }
  return context;
}
