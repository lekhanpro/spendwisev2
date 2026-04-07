import {
  AllocationTarget,
  AssetClass,
  InAppNotificationPreferences,
  InvestmentGoal,
  InvestorProfile,
  MarketIndex,
  MarketNewsItem,
  MarketRange,
  MarketSnapshot,
  MutualFundBucket,
  PortfolioHolding,
  RoadmapAction,
  SchemeData,
  SectorPerformance,
  StockQuote,
} from '../../types/investment';

const marketRanges: MarketRange[] = ['1D', '1W', '1M', '3M', '1Y', '5Y'];

const rangeSteps: Record<MarketRange, number> = {
  '1D': 24,
  '1W': 7,
  '1M': 30,
  '3M': 13,
  '1Y': 12,
  '5Y': 10,
};

const rangeSpacingMs: Record<MarketRange, number> = {
  '1D': 60 * 60 * 1000,
  '1W': 24 * 60 * 60 * 1000,
  '1M': 24 * 60 * 60 * 1000,
  '3M': 7 * 24 * 60 * 60 * 1000,
  '1Y': 30 * 24 * 60 * 60 * 1000,
  '5Y': 180 * 24 * 60 * 60 * 1000,
};

type StockSeed = Omit<StockQuote, 'change' | 'changePercent' | 'priceSeries'>;

const stockSeeds: StockSeed[] = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries',
    exchange: 'NSE',
    sector: 'Energy',
    price: 2864,
    high52Week: 3128,
    low52Week: 2220,
    peRatio: 24.8,
    pbRatio: 2.1,
    roe: 9.8,
    debtToEquity: 0.42,
    dividendYield: 0.35,
    marketCap: '19.4L Cr',
    volume: '84.6L',
    analystRating: 'Buy',
    analystTarget: 3240,
    benchmarkReturn1Y: 13.2,
    thesis: 'Large-cap cashflow engine with telecom, retail, and new energy optionality.',
    riskFlags: ['Energy margin volatility', 'Capex execution'],
    momentumScore: 74,
    qualityScore: 81,
    valueScore: 62,
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    exchange: 'NSE',
    sector: 'IT',
    price: 4142,
    high52Week: 4585,
    low52Week: 3312,
    peRatio: 30.1,
    pbRatio: 13.6,
    roe: 45.8,
    debtToEquity: 0.09,
    dividendYield: 1.34,
    marketCap: '15.0L Cr',
    volume: '12.8L',
    analystRating: 'Hold',
    analystTarget: 4320,
    benchmarkReturn1Y: 13.2,
    thesis: 'Defensive export-heavy compounder with premium ROE and stable cash returns.',
    riskFlags: ['Discretionary IT slowdown'],
    momentumScore: 58,
    qualityScore: 92,
    valueScore: 48,
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank',
    exchange: 'NSE',
    sector: 'Banking',
    price: 1738,
    high52Week: 1880,
    low52Week: 1432,
    peRatio: 20.4,
    pbRatio: 2.7,
    roe: 15.7,
    debtToEquity: 0.0,
    dividendYield: 1.13,
    marketCap: '13.2L Cr',
    volume: '216.0L',
    analystRating: 'Buy',
    analystTarget: 1940,
    benchmarkReturn1Y: 13.2,
    thesis: 'Retail banking franchise with merger synergies and improving deposit mix.',
    riskFlags: ['NIM normalization'],
    momentumScore: 61,
    qualityScore: 86,
    valueScore: 72,
  },
  {
    symbol: 'INFY',
    name: 'Infosys',
    exchange: 'NSE',
    sector: 'IT',
    price: 1626,
    high52Week: 1764,
    low52Week: 1358,
    peRatio: 26.2,
    pbRatio: 8.0,
    roe: 30.6,
    debtToEquity: 0.08,
    dividendYield: 2.0,
    marketCap: '6.7L Cr',
    volume: '66.1L',
    analystRating: 'Accumulate',
    analystTarget: 1742,
    benchmarkReturn1Y: 13.2,
    thesis: 'High-quality software exporter with margin discipline and deal pipeline resilience.',
    riskFlags: ['Large-deal conversion timing'],
    momentumScore: 64,
    qualityScore: 88,
    valueScore: 58,
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank',
    exchange: 'NSE',
    sector: 'Banking',
    price: 1248,
    high52Week: 1312,
    low52Week: 933,
    peRatio: 18.2,
    pbRatio: 3.0,
    roe: 18.4,
    debtToEquity: 0.0,
    dividendYield: 0.84,
    marketCap: '8.8L Cr',
    volume: '148.4L',
    analystRating: 'Buy',
    analystTarget: 1380,
    benchmarkReturn1Y: 13.2,
    thesis: 'Balanced retail-corporate lender with strong asset quality and operating leverage.',
    riskFlags: ['Credit cost cycle'],
    momentumScore: 77,
    qualityScore: 84,
    valueScore: 74,
  },
  {
    symbol: 'LT',
    name: 'Larsen & Toubro',
    exchange: 'NSE',
    sector: 'Infrastructure',
    price: 3644,
    high52Week: 3918,
    low52Week: 2902,
    peRatio: 33.8,
    pbRatio: 4.7,
    roe: 14.2,
    debtToEquity: 1.12,
    dividendYield: 0.82,
    marketCap: '5.0L Cr',
    volume: '18.4L',
    analystRating: 'Accumulate',
    analystTarget: 3890,
    benchmarkReturn1Y: 13.2,
    thesis: 'Capex proxy with deep order book and improving services mix.',
    riskFlags: ['Project execution slippage', 'Working capital cycles'],
    momentumScore: 69,
    qualityScore: 79,
    valueScore: 54,
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    exchange: 'NSE',
    sector: 'Banking',
    price: 812,
    high52Week: 912,
    low52Week: 618,
    peRatio: 10.4,
    pbRatio: 1.7,
    roe: 17.5,
    debtToEquity: 0.0,
    dividendYield: 1.55,
    marketCap: '7.2L Cr',
    volume: '224.7L',
    analystRating: 'Buy',
    analystTarget: 930,
    benchmarkReturn1Y: 13.2,
    thesis: 'Valuation-supportive PSU bank with broad liability franchise and healthy provision buffer.',
    riskFlags: ['Government ownership overhang'],
    momentumScore: 72,
    qualityScore: 71,
    valueScore: 88,
  },
  {
    symbol: 'SUNPHARMA',
    name: 'Sun Pharmaceutical',
    exchange: 'NSE',
    sector: 'Pharma',
    price: 1712,
    high52Week: 1870,
    low52Week: 1226,
    peRatio: 39.5,
    pbRatio: 5.2,
    roe: 13.4,
    debtToEquity: 0.07,
    dividendYield: 0.78,
    marketCap: '4.1L Cr',
    volume: '19.6L',
    analystRating: 'Accumulate',
    analystTarget: 1815,
    benchmarkReturn1Y: 13.2,
    thesis: 'Specialty pharma growth with defensive earnings quality.',
    riskFlags: ['USFDA and specialty launch risk'],
    momentumScore: 66,
    qualityScore: 83,
    valueScore: 51,
  },
  {
    symbol: 'TITAN',
    name: 'Titan Company',
    exchange: 'NSE',
    sector: 'Consumer',
    price: 3818,
    high52Week: 3945,
    low52Week: 3016,
    peRatio: 79.6,
    pbRatio: 25.1,
    roe: 31.8,
    debtToEquity: 0.13,
    dividendYield: 0.28,
    marketCap: '3.4L Cr',
    volume: '11.3L',
    analystRating: 'Hold',
    analystTarget: 3980,
    benchmarkReturn1Y: 13.2,
    thesis: 'Consumer discretionary compounder with premium brand pricing power.',
    riskFlags: ['Rich valuation multiple'],
    momentumScore: 57,
    qualityScore: 90,
    valueScore: 31,
  },
  {
    symbol: 'COALINDIA',
    name: 'Coal India',
    exchange: 'NSE',
    sector: 'Energy',
    price: 468,
    high52Week: 544,
    low52Week: 321,
    peRatio: 8.8,
    pbRatio: 2.4,
    roe: 28.7,
    debtToEquity: 0.03,
    dividendYield: 7.1,
    marketCap: '2.9L Cr',
    volume: '104.3L',
    analystRating: 'Accumulate',
    analystTarget: 505,
    benchmarkReturn1Y: 13.2,
    thesis: 'High-cash-yield PSU with dividend support and domestic coal pricing power.',
    riskFlags: ['Policy and realization risk'],
    momentumScore: 63,
    qualityScore: 73,
    valueScore: 91,
  },
];

const sectorColorMap: Record<string, number> = {
  Banking: 1,
  IT: 2,
  Energy: 3,
  Infrastructure: 4,
  Pharma: 5,
  Consumer: 6,
};

function seededWave(seed: number, step: number, divisor: number) {
  return Math.sin((seed + step) / divisor) + Math.cos((seed * 2 + step) / (divisor + 2));
}

function createSeries(base: number, symbol: string, range: MarketRange, driftBias: number) {
  const seed = symbol.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const steps = rangeSteps[range];
  const spacing = rangeSpacingMs[range];
  const now = Date.now();

  return Array.from({ length: steps }, (_, index) => {
    const progress = index / Math.max(steps - 1, 1);
    const trend = (progress - 0.5) * driftBias;
    const amplitude = range === '1D' ? 0.012 : range === '1W' ? 0.025 : range === '1M' ? 0.045 : range === '3M' ? 0.08 : range === '1Y' ? 0.14 : 0.28;
    const wobble = seededWave(seed, index, 2.7) * amplitude * 0.35;
    const value = Number((base * (1 + trend + wobble)).toFixed(2));

    return {
      label: range === '1D' ? `${index}:00` : `${index + 1}`,
      timestamp: now - (steps - index - 1) * spacing,
      value,
    };
  });
}

function createStock(seed: StockSeed, step = 0): StockQuote {
  const sectorBias = sectorColorMap[seed.sector] ?? 2;
  const liveWave = seededWave(seed.symbol.length * 17 + sectorBias, step, 4.2) * 0.0045;
  const adjustedPrice = Number((seed.price * (1 + liveWave)).toFixed(2));
  const basePreviousClose = seed.price * (1 - (seed.symbol.length % 7) * 0.0025 + sectorBias * 0.001);
  const change = Number((adjustedPrice - basePreviousClose).toFixed(2));
  const changePercent = Number(((change / basePreviousClose) * 100).toFixed(2));

  return {
    ...seed,
    price: adjustedPrice,
    change,
    changePercent,
    priceSeries: Object.fromEntries(
      marketRanges.map((range) => [range, createSeries(adjustedPrice, seed.symbol, range, changePercent / 100)])
    ) as StockQuote['priceSeries'],
  };
}

function createIndex(symbol: string, name: string, base: number, step: number): MarketIndex {
  const liveWave = seededWave(symbol.length * 31, step, 3.4) * 0.0022;
  const value = Number((base * (1 + liveWave)).toFixed(2));
  const previousClose = base * (1 - 0.0018);
  const change = Number((value - previousClose).toFixed(2));
  const changePercent = Number(((change / previousClose) * 100).toFixed(2));
  const priceSeries = Object.fromEntries(
    marketRanges.map((range) => [range, createSeries(value, symbol, range, changePercent / 80)])
  ) as MarketIndex['priceSeries'];
  const dayValues = priceSeries['1D'].map((point) => point.value);

  return {
    symbol,
    name,
    value,
    change,
    changePercent,
    dayLow: Math.min(...dayValues),
    dayHigh: Math.max(...dayValues),
    priceSeries,
  };
}

const newsSeed: Omit<MarketNewsItem, 'publishedAt'>[] = [
  {
    id: 'policy',
    source: 'SpendWise Wire',
    title: 'Rate-sensitive sectors stay in focus as treasury yields cool',
    summary: 'Banks and rate-sensitive cyclicals remain watchworthy after softer bond yields improved risk appetite.',
    tag: 'Macro',
  },
  {
    id: 'results',
    source: 'SpendWise Wire',
    title: 'Large-cap IT leadership hinges on deal wins and margin commentary',
    summary: 'Investors continue to price quality cash flows, but forward commentary remains the key rerating trigger.',
    tag: 'Earnings',
  },
  {
    id: 'psu',
    source: 'SpendWise Wire',
    title: 'Dividend-heavy PSUs remain attractive for income-focused portfolios',
    summary: 'High-yield energy and transmission names still anchor income baskets despite periodic policy volatility.',
    tag: 'Income',
  },
  {
    id: 'gold',
    source: 'SpendWise Wire',
    title: 'Gold allocation stays relevant as a portfolio stabilizer',
    summary: 'Strategic gold exposure can reduce drawdown pressure when equity momentum weakens sharply.',
    tag: 'Allocation',
  },
];

export const schemeCatalog: SchemeData[] = [
  {
    id: 'ppf',
    name: 'Public Provident Fund',
    category: 'government',
    interestRate: 7.1,
    returnsLabel: 'Government-backed compounding',
    risk: 'Low',
    minAmount: 500,
    maxAmount: 150000,
    lockIn: '15 years',
    eligibility: 'Resident individuals',
    taxation: 'EEE, eligible under 80C',
    idealFor: ['Long-term tax planning', 'Debt allocation'],
    highlights: ['Loan and partial withdrawal support', 'Tax-free maturity'],
    officialSourceLabel: 'India Post',
    officialSourceUrl: 'https://www.indiapost.gov.in/Financial/Pages/Content/Post-Office-Saving-Schemes.aspx',
    lastUpdatedLabel: 'Reference snapshot, connect live source for latest rate',
  },
  {
    id: 'nps',
    name: 'National Pension System',
    category: 'retirement',
    interestRate: null,
    returnsLabel: 'Market-linked retirement corpus',
    risk: 'Moderate',
    minAmount: 500,
    maxAmount: null,
    lockIn: 'Till retirement with partial exit rules',
    eligibility: 'Citizens aged 18-70',
    taxation: '80CCD(1), 80CCD(1B), partial exempt at exit',
    idealFor: ['Retirement planning', 'Additional tax deduction'],
    highlights: ['Low-cost retirement wrapper', 'Choice of equity and debt mix'],
    officialSourceLabel: 'NPS Trust',
    officialSourceUrl: 'https://www.npstrust.org.in/',
    lastUpdatedLabel: 'Reference snapshot, connect live source for latest rules',
  },
  {
    id: 'ssy',
    name: 'Sukanya Samriddhi Yojana',
    category: 'government',
    interestRate: 8.2,
    returnsLabel: 'Girl-child focused savings',
    risk: 'Low',
    minAmount: 250,
    maxAmount: 150000,
    lockIn: '21 years',
    eligibility: 'Girl child account with guardian',
    taxation: 'EEE, eligible under 80C',
    idealFor: ['Child education corpus'],
    highlights: ['One of the highest small-savings reference rates', 'Tax-free maturity'],
    officialSourceLabel: 'India Post',
    officialSourceUrl: 'https://www.indiapost.gov.in/Financial/Pages/Content/Post-Office-Saving-Schemes.aspx',
    lastUpdatedLabel: 'Reference snapshot, connect live source for latest rate',
  },
  {
    id: 'scss',
    name: 'Senior Citizens Savings Scheme',
    category: 'income',
    interestRate: 8.2,
    returnsLabel: 'Quarterly income for retirees',
    risk: 'Low',
    minAmount: 1000,
    maxAmount: 3000000,
    lockIn: '5 years',
    eligibility: 'Senior citizens and select retirees',
    taxation: '80C eligible, interest taxable',
    idealFor: ['Retirement income'],
    highlights: ['Quarterly payout', 'Government-backed principal safety'],
    officialSourceLabel: 'India Post',
    officialSourceUrl: 'https://www.indiapost.gov.in/Financial/Pages/Content/Post-Office-Saving-Schemes.aspx',
    lastUpdatedLabel: 'Reference snapshot, connect live source for latest rate',
  },
  {
    id: 'apy',
    name: 'Atal Pension Yojana',
    category: 'retirement',
    interestRate: null,
    returnsLabel: 'Defined pension outcome',
    risk: 'Low',
    minAmount: 42,
    maxAmount: null,
    lockIn: 'Till 60 years',
    eligibility: 'Citizens aged 18-40',
    taxation: 'Contribution may qualify under pension tax rules',
    idealFor: ['Core pension floor'],
    highlights: ['Guaranteed pension slabs', 'Suitable for conservative retirement planning'],
    officialSourceLabel: 'PFRDA',
    officialSourceUrl: 'https://www.pfrda.org.in/',
    lastUpdatedLabel: 'Reference snapshot, connect live source for latest rules',
  },
  {
    id: 'sgb',
    name: 'Sovereign Gold Bond',
    category: 'gold',
    interestRate: 2.5,
    returnsLabel: 'Gold-linked with fixed coupon',
    risk: 'Moderate',
    minAmount: 1,
    maxAmount: 400000,
    lockIn: '8 years with exit windows',
    eligibility: 'Resident individuals, HUFs, trusts',
    taxation: 'Capital gains exempt on maturity',
    idealFor: ['Strategic gold allocation'],
    highlights: ['No storage cost', 'Tradable on exchanges'],
    officialSourceLabel: 'RBI',
    officialSourceUrl: 'https://www.rbi.org.in/',
    lastUpdatedLabel: 'Reference snapshot, connect live source for latest tranche',
  },
  {
    id: 'elss',
    name: 'ELSS Funds',
    category: 'tax-saving',
    interestRate: null,
    returnsLabel: 'Equity-linked tax saver',
    risk: 'High',
    minAmount: 500,
    maxAmount: null,
    lockIn: '3 years',
    eligibility: 'Resident individuals and HUFs',
    taxation: '80C eligible, equity LTCG rules apply',
    idealFor: ['Tax saving with equity upside'],
    highlights: ['Shortest 80C lock-in', 'Works for long-term compounding'],
    officialSourceLabel: 'AMFI',
    officialSourceUrl: 'https://www.amfiindia.com/',
    lastUpdatedLabel: 'Market-linked category, use AMC feed for current NAV data',
  },
  {
    id: 'nsc',
    name: 'National Savings Certificate',
    category: 'government',
    interestRate: 7.7,
    returnsLabel: 'Fixed-rate tax-saving certificate',
    risk: 'Low',
    minAmount: 1000,
    maxAmount: null,
    lockIn: '5 years',
    eligibility: 'Resident individuals',
    taxation: '80C eligible, accrued interest taxable',
    idealFor: ['Conservative tax-saving debt'],
    highlights: ['Predictable maturity value', 'Available through post offices'],
    officialSourceLabel: 'India Post',
    officialSourceUrl: 'https://www.indiapost.gov.in/Financial/Pages/Content/Post-Office-Saving-Schemes.aspx',
    lastUpdatedLabel: 'Reference snapshot, connect live source for latest rate',
  },
  {
    id: 'kvp',
    name: 'Kisan Vikas Patra',
    category: 'government',
    interestRate: 7.5,
    returnsLabel: 'Capital doubles over notified term',
    risk: 'Low',
    minAmount: 1000,
    maxAmount: null,
    lockIn: 'As per notified maturity period',
    eligibility: 'Resident individuals',
    taxation: 'No 80C deduction',
    idealFor: ['Conservative savers', 'Goal-based debt corpus'],
    highlights: ['Simple post-office product', 'Known maturity target'],
    officialSourceLabel: 'India Post',
    officialSourceUrl: 'https://www.indiapost.gov.in/Financial/Pages/Content/Post-Office-Saving-Schemes.aspx',
    lastUpdatedLabel: 'Reference snapshot, connect live source for latest rate',
  },
];

export const mutualFundBuckets: MutualFundBucket[] = [
  {
    id: 'index',
    title: 'Large-cap index fund basket',
    category: 'Equity Core',
    risk: 'Moderate',
    horizon: '5+ years',
    whyItFits: 'Works as the default core for long-term wealth building at low cost.',
    allocationHint: '40% to 60% of equity book',
  },
  {
    id: 'flexi',
    title: 'Flexi-cap satellite allocation',
    category: 'Equity Satellite',
    risk: 'High',
    horizon: '5+ years',
    whyItFits: 'Adds manager flexibility across large, mid, and small caps.',
    allocationHint: '10% to 20% of equity book',
  },
  {
    id: 'short-term-debt',
    title: 'Short-duration debt funds',
    category: 'Debt',
    risk: 'Low',
    horizon: '1 to 3 years',
    whyItFits: 'Useful for near-term goals and dampening equity drawdowns.',
    allocationHint: '15% to 35% of total portfolio',
  },
  {
    id: 'gold-etf',
    title: 'Gold ETF or gold savings wrapper',
    category: 'Diversifier',
    risk: 'Moderate',
    horizon: '3+ years',
    whyItFits: 'Adds diversification and crisis hedge to an otherwise equity-heavy portfolio.',
    allocationHint: '5% to 10% of total portfolio',
  },
];

export const defaultInvestorProfile: InvestorProfile = {
  age: 29,
  annualIncome: 1800000,
  monthlyInvestable: 25000,
  emergencyFundMonths: 4,
  investmentHorizonYears: 12,
  riskTolerance: 3,
  experience: 'intermediate',
  dependents: 1,
  taxBracket: '20-30',
  objective: 'wealth',
  existingEquityExposure: 52,
};

export const defaultHoldings: PortfolioHolding[] = [
  { id: 'hold-rel', symbol: 'RELIANCE', name: 'Reliance Industries', assetClass: 'equity', quantity: 12, averageCost: 2530 },
  { id: 'hold-hdfc', symbol: 'HDFCBANK', name: 'HDFC Bank', assetClass: 'equity', quantity: 18, averageCost: 1618 },
  { id: 'hold-gold', symbol: 'SGB', name: 'Sovereign Gold Bond', assetClass: 'gold', quantity: 5, averageCost: 6120 },
  { id: 'hold-debt', symbol: 'PPF', name: 'Public Provident Fund', assetClass: 'debt', quantity: 1, averageCost: 160000 },
];

export const defaultInvestmentGoals: InvestmentGoal[] = [
  {
    id: 'goal-retire',
    name: 'Retirement corpus',
    type: 'retirement',
    targetAmount: 25000000,
    currentAmount: 420000,
    monthlyContribution: 18000,
    targetDate: '2045-03-31',
    priority: 'core',
    horizon: 'long',
  },
  {
    id: 'goal-home',
    name: 'Home down payment',
    type: 'home',
    targetAmount: 3000000,
    currentAmount: 520000,
    monthlyContribution: 25000,
    targetDate: '2030-06-30',
    priority: 'important',
    horizon: 'mid',
  },
];

export const defaultNotificationPreferences: InAppNotificationPreferences = {
  marketAlerts: false,
  rebalanceAlerts: false,
  goalAlerts: false,
  schemeAlerts: false,
};

export const allocationLabels: Record<AssetClass, string> = {
  equity: 'Equity',
  debt: 'Debt',
  gold: 'Gold',
  'real-estate': 'Real Estate',
  international: 'International',
  cash: 'Cash',
};

export function createTargetAllocation(riskBand: 'conservative' | 'balanced' | 'growth' | 'aggressive'): Record<AssetClass, number> {
  switch (riskBand) {
    case 'conservative':
      return { equity: 30, debt: 45, gold: 10, cash: 10, international: 0, 'real-estate': 5 };
    case 'balanced':
      return { equity: 50, debt: 25, gold: 10, cash: 5, international: 5, 'real-estate': 5 };
    case 'growth':
      return { equity: 65, debt: 15, gold: 10, cash: 5, international: 5, 'real-estate': 0 };
    case 'aggressive':
      return { equity: 75, debt: 10, gold: 5, cash: 5, international: 5, 'real-estate': 0 };
    default:
      return { equity: 50, debt: 25, gold: 10, cash: 5, international: 5, 'real-estate': 5 };
  }
}

export function buildRoadmapSkeleton(): RoadmapAction[] {
  return [
    {
      id: 'emergency',
      timeline: 'Now',
      title: 'Finish six months of emergency liquidity',
      description: 'Top up debt and cash buffers before increasing satellite equity or thematic bets.',
      focus: 'risk',
    },
    {
      id: 'sip',
      timeline: 'Next 30 Days',
      title: 'Automate core index SIPs',
      description: 'Route the default monthly investable amount into a large-cap index core and a debt sleeve on salary day.',
      focus: 'execution',
    },
    {
      id: 'tax',
      timeline: 'Next 90 Days',
      title: 'Use the annual tax-saving bucket intentionally',
      description: 'Fill 80C and 80CCD based on cash-flow capacity instead of ad hoc year-end purchases.',
      focus: 'tax',
    },
    {
      id: 'review',
      timeline: 'Next 12 Months',
      title: 'Run a quarterly rebalance review',
      description: 'Compare current allocation versus target mix and trim drift beyond five percentage points.',
      focus: 'allocation',
    },
  ];
}

export function createMockMarketSnapshot(step = 0): MarketSnapshot {
  const stocks = stockSeeds.map((seed) => createStock(seed, step));
  const topGainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 4);
  const topLosers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 4);

  const sectorsMap = new Map<string, StockQuote[]>();
  stocks.forEach((stock) => {
    const bucket = sectorsMap.get(stock.sector) ?? [];
    bucket.push(stock);
    sectorsMap.set(stock.sector, bucket);
  });

  const sectors: SectorPerformance[] = Array.from(sectorsMap.entries()).map(([name, bucket]) => {
    const avg = bucket.reduce((sum, stock) => sum + stock.changePercent, 0) / bucket.length;
    return {
      name,
      changePercent: Number(avg.toFixed(2)),
      breadth: `${bucket.filter((stock) => stock.changePercent >= 0).length}/${bucket.length} advancing`,
      leaders: bucket
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, 2)
        .map((stock) => stock.symbol),
    };
  });

  return {
    mode: 'mock',
    providerLabel: 'Local simulation mode',
    lastUpdated: Date.now(),
    indices: [
      createIndex('NIFTY50', 'Nifty 50', 22486, step),
      createIndex('SENSEX', 'Sensex', 73942, step),
      createIndex('BANKNIFTY', 'Bank Nifty', 48612, step),
    ],
    stocks,
    topGainers,
    topLosers,
    sectors: sectors.sort((a, b) => b.changePercent - a.changePercent),
    news: newsSeed.map((item, index) => ({
      ...item,
      publishedAt: Date.now() - index * 75 * 60 * 1000,
    })),
  };
}
