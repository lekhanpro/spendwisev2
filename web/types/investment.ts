export type LiveDataMode = 'mock' | 'live' | 'hybrid';
export type MarketRange = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y';
export type AssetClass = 'equity' | 'debt' | 'gold' | 'real-estate' | 'international' | 'cash';
export type GoalHorizon = 'short' | 'mid' | 'long';
export type InvestmentRiskBand = 'conservative' | 'balanced' | 'growth' | 'aggressive';
export type GoalPriority = 'core' | 'important' | 'aspirational';
export type SchemeCategory = 'government' | 'retirement' | 'tax-saving' | 'income' | 'gold' | 'market-linked';
export type InvestmentNotificationType = 'market' | 'portfolio' | 'goal' | 'scheme' | 'system';

export interface PricePoint {
  label: string;
  timestamp: number;
  value: number;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  dayLow: number;
  dayHigh: number;
  priceSeries: Record<MarketRange, PricePoint[]>;
}

export interface SectorPerformance {
  name: string;
  changePercent: number;
  breadth: string;
  leaders: string[];
}

export interface StockQuote {
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  high52Week: number;
  low52Week: number;
  peRatio: number;
  pbRatio: number;
  roe: number;
  debtToEquity: number;
  dividendYield: number;
  marketCap: string;
  volume: string;
  analystRating: 'Buy' | 'Accumulate' | 'Hold' | 'Reduce';
  analystTarget: number;
  benchmarkReturn1Y: number;
  thesis: string;
  riskFlags: string[];
  momentumScore: number;
  qualityScore: number;
  valueScore: number;
  dataSource?: string;
  lastTradingDay?: string;
  rsi14?: number | null;
  macd?: number | null;
  sma20?: number | null;
  sma50?: number | null;
  priceSeries: Record<MarketRange, PricePoint[]>;
}

export interface MarketNewsItem {
  id: string;
  source: string;
  title: string;
  summary: string;
  tag: string;
  publishedAt: number;
}

export interface SchemeData {
  id: string;
  name: string;
  category: SchemeCategory;
  interestRate: number | null;
  returnsLabel: string;
  risk: 'Low' | 'Moderate' | 'High';
  minAmount: number;
  maxAmount: number | null;
  lockIn: string;
  eligibility: string;
  taxation: string;
  idealFor: string[];
  highlights: string[];
  officialSourceLabel: string;
  officialSourceUrl: string;
  lastUpdatedLabel: string;
}

export interface MutualFundBucket {
  id: string;
  title: string;
  category: string;
  risk: 'Low' | 'Moderate' | 'High';
  horizon: string;
  whyItFits: string;
  allocationHint: string;
}

export interface InvestorProfile {
  age: number;
  annualIncome: number;
  monthlyInvestable: number;
  emergencyFundMonths: number;
  investmentHorizonYears: number;
  riskTolerance: 1 | 2 | 3 | 4 | 5;
  experience: 'beginner' | 'intermediate' | 'advanced';
  dependents: number;
  taxBracket: 'below-5' | '5-10' | '10-20' | '20-30' | '30-plus';
  objective: 'wealth' | 'retirement' | 'income' | 'tax-saving' | 'education' | 'home';
  existingEquityExposure: number;
}

export interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  assetClass: AssetClass;
  quantity: number;
  averageCost: number;
  goalId?: string;
}

export interface InvestmentGoal {
  id: string;
  name: string;
  type: 'retirement' | 'home' | 'education' | 'vacation' | 'wealth' | 'emergency' | 'custom';
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  targetDate: string;
  priority: GoalPriority;
  horizon: GoalHorizon;
}

export interface AllocationTarget {
  assetClass: AssetClass;
  label: string;
  targetPercent: number;
  currentPercent: number;
  driftPercent: number;
  rationale: string;
}

export interface RoadmapAction {
  id: string;
  timeline: 'Now' | 'Next 30 Days' | 'Next 90 Days' | 'Next 12 Months';
  title: string;
  description: string;
  focus: 'allocation' | 'goal' | 'tax' | 'risk' | 'execution';
}

export interface InvestmentRecommendations {
  summary: string;
  stockBuckets: string[];
  mutualFunds: MutualFundBucket[];
  schemes: string[];
  taxIdeas: string[];
}

export interface InAppNotificationPreferences {
  marketAlerts: boolean;
  rebalanceAlerts: boolean;
  goalAlerts: boolean;
  schemeAlerts: boolean;
}

export interface PortfolioSnapshot {
  totalInvested: number;
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
  dayChange: number;
  benchmarkGapPercent: number;
  allocations: AllocationTarget[];
}

export interface MarketSnapshot {
  mode: LiveDataMode;
  providerLabel: string;
  lastUpdated: number;
  indices: MarketIndex[];
  stocks: StockQuote[];
  topGainers: StockQuote[];
  topLosers: StockQuote[];
  sectors: SectorPerformance[];
  news: MarketNewsItem[];
}

export interface InvestmentContextType {
  market: MarketSnapshot;
  availableStocks: StockQuote[];
  schemes: SchemeData[];
  mutualFundBuckets: MutualFundBucket[];
  profile: InvestorProfile;
  riskBand: InvestmentRiskBand;
  watchlist: string[];
  holdings: PortfolioHolding[];
  investmentGoals: InvestmentGoal[];
  selectedStock: string;
  selectedRange: MarketRange;
  comparisonSchemeIds: string[];
  notificationPreferences: InAppNotificationPreferences;
  portfolio: PortfolioSnapshot;
  recommendations: InvestmentRecommendations;
  roadmap: RoadmapAction[];
  setSelectedStock: (symbol: string) => void;
  setSelectedRange: (range: MarketRange) => void;
  updateProfile: (updates: Partial<InvestorProfile>) => void;
  toggleWatchlist: (symbol: string) => void;
  addHolding: (holding: Omit<PortfolioHolding, 'id'>) => void;
  updateHolding: (holding: PortfolioHolding) => void;
  removeHolding: (id: string) => void;
  addInvestmentGoal: (goal: Omit<InvestmentGoal, 'id'>) => void;
  updateInvestmentGoal: (goal: InvestmentGoal) => void;
  removeInvestmentGoal: (id: string) => void;
  toggleSchemeComparison: (schemeId: string) => void;
  updateNotificationPreference: (key: keyof InAppNotificationPreferences, value: boolean) => void;
}
