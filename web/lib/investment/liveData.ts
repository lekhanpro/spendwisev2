import { MarketNewsItem, MarketRange, MarketSnapshot, PricePoint, StockQuote } from '../../types/investment';

const MARKET_CACHE_PREFIX = 'spendwise-investment-live';
const ALPHA_REQUEST_GAP_MS = 1200;
const QUOTE_TTL_MS = 12 * 60 * 60 * 1000;
const SERIES_TTL_MS = 24 * 60 * 60 * 1000;
const NEWS_TTL_MS = 2 * 60 * 60 * 1000;

const configuredMode = (import.meta.env.VITE_MARKET_DATA_MODE as string | undefined)?.trim().toLowerCase();
const alphaVantageApiKey = (import.meta.env.VITE_ALPHA_VANTAGE_API_KEY as string | undefined)?.trim();
const gnewsApiKey = (import.meta.env.VITE_GNEWS_API_KEY as string | undefined)?.trim();
const gnewsEndpoint =
  (import.meta.env.VITE_MARKET_NEWS_URL as string | undefined)?.trim() || 'https://gnews.io/api/v4/search';

const alphaSymbolMap: Record<string, string> = {
  RELIANCE: 'RELIANCE.BSE',
  HDFCBANK: 'HDFCBANK.BSE',
  TCS: 'TCS.BSE',
  INFY: 'INFY.BSE',
  ICICIBANK: 'ICICIBANK.BSE',
  LT: 'LT.BSE',
  SBIN: 'SBIN.BSE',
  SUNPHARMA: 'SUNPHARMA.BSE',
  TITAN: 'TITAN.BSE',
  COALINDIA: 'COALINDIA.BSE',
};

type AlphaSeriesFunction = 'TIME_SERIES_DAILY' | 'TIME_SERIES_WEEKLY' | 'TIME_SERIES_MONTHLY';

interface AlphaQuote {
  open: number;
  high: number;
  low: number;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  latestTradingDay: string;
}

interface AlphaBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CacheEnvelope<T> {
  expiresAt: number;
  value: T;
}

let alphaRequestQueue: Promise<unknown> = Promise.resolve();

function hasWindowStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

function queueAlphaRequest<T>(task: () => Promise<T>) {
  const scheduled = alphaRequestQueue.then(task, task);
  alphaRequestQueue = scheduled.then(
    () => sleep(ALPHA_REQUEST_GAP_MS),
    () => sleep(ALPHA_REQUEST_GAP_MS)
  );
  return scheduled;
}

function readCache<T>(key: string): CacheEnvelope<T> | null {
  if (!hasWindowStorage()) return null;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as CacheEnvelope<T>) : null;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, value: T, ttlMs: number) {
  if (!hasWindowStorage()) return;

  try {
    const payload: CacheEnvelope<T> = {
      expiresAt: Date.now() + ttlMs,
      value,
    };
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Ignore quota errors and continue with in-memory result.
  }
}

async function getCachedOrFetch<T>(key: string, ttlMs: number, fetcher: () => Promise<T>) {
  const cached = readCache<T>(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  try {
    const value = await fetcher();
    writeCache(key, value, ttlMs);
    return value;
  } catch (error) {
    if (cached) {
      return cached.value;
    }
    throw error;
  }
}

async function fetchJson<T>(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return (await response.json()) as T;
}

function parseAlphaError(payload: Record<string, unknown>) {
  const info = payload.Information;
  const note = payload.Note;
  const error = payload['Error Message'];

  if (typeof error === 'string') {
    return error;
  }

  if (typeof note === 'string') {
    return note;
  }

  if (typeof info === 'string') {
    return info;
  }

  return null;
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: value >= 10000000 ? 1 : 2,
  }).format(value);
}

function parseNumeric(value: string | undefined) {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseAlphaQuote(payload: Record<string, unknown>) {
  const error = parseAlphaError(payload);
  if (error) {
    throw new Error(error);
  }

  const quote = payload['Global Quote'] as Record<string, string> | undefined;
  if (!quote || !quote['05. price']) {
    throw new Error('Missing Global Quote payload');
  }

  return {
    open: parseNumeric(quote['02. open']),
    high: parseNumeric(quote['03. high']),
    low: parseNumeric(quote['04. low']),
    price: parseNumeric(quote['05. price']),
    volume: parseNumeric(quote['06. volume']),
    latestTradingDay: quote['07. latest trading day'] || '',
    previousClose: parseNumeric(quote['08. previous close']),
    change: parseNumeric(quote['09. change']),
    changePercent: parseNumeric(quote['10. change percent']?.replace('%', '')),
  } satisfies AlphaQuote;
}

function parseAlphaSeries(payload: Record<string, unknown>, seriesFunction: AlphaSeriesFunction) {
  const error = parseAlphaError(payload);
  if (error) {
    throw new Error(error);
  }

  const rootKey =
    seriesFunction === 'TIME_SERIES_DAILY'
      ? 'Time Series (Daily)'
      : seriesFunction === 'TIME_SERIES_WEEKLY'
        ? 'Weekly Time Series'
        : 'Monthly Time Series';

  const series = payload[rootKey] as Record<string, Record<string, string>> | undefined;
  if (!series) {
    throw new Error(`Missing ${rootKey}`);
  }

  return Object.entries(series)
    .map(([date, point]) => ({
      date,
      open: parseNumeric(point['1. open']),
      high: parseNumeric(point['2. high']),
      low: parseNumeric(point['3. low']),
      close: parseNumeric(point['4. close']),
      volume: parseNumeric(point['5. volume']),
    }))
    .sort((left, right) => left.date.localeCompare(right.date));
}

function buildAlphaUrl(params: Record<string, string>) {
  const url = new URL('https://www.alphavantage.co/query');
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}

function buildGnewsUrl() {
  const url = new URL(gnewsEndpoint);
  url.searchParams.set('q', '("Indian stock market" OR NSE OR Sensex OR Nifty)');
  url.searchParams.set('lang', 'en');
  url.searchParams.set('country', 'in');
  url.searchParams.set('max', '6');
  url.searchParams.set('apikey', gnewsApiKey ?? '');
  return url.toString();
}

function toTimestamp(date: string) {
  return new Date(`${date}T00:00:00+05:30`).getTime();
}

function createDatePoint(date: string, value: number, range: Exclude<MarketRange, '1D'>): PricePoint {
  const timestamp = toTimestamp(date);
  const dateObject = new Date(timestamp);
  const label =
    range === '1W'
      ? dateObject.toLocaleDateString('en-IN', { weekday: 'short' })
      : range === '1M'
        ? dateObject.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        : range === '3M'
          ? dateObject.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
          : range === '1Y'
            ? dateObject.toLocaleDateString('en-IN', { month: 'short' })
            : dateObject.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });

  return {
    label,
    timestamp,
    value: Number(value.toFixed(2)),
  };
}

function buildSyntheticDaySeries(quote: AlphaQuote): PricePoint[] {
  const baseDate = quote.latestTradingDay || new Date().toISOString().slice(0, 10);
  const baseTimestamp = new Date(`${baseDate}T09:00:00+05:30`).getTime();
  const midpoint = Number((((quote.high || quote.price) + (quote.low || quote.price)) / 2).toFixed(2));

  return [
    { label: 'Prev', timestamp: baseTimestamp - 15 * 60 * 1000, value: Number(quote.previousClose.toFixed(2)) },
    { label: 'Open', timestamp: baseTimestamp, value: Number(quote.open.toFixed(2)) },
    { label: 'Mid', timestamp: baseTimestamp + 2.5 * 60 * 60 * 1000, value: midpoint },
    { label: 'Low', timestamp: baseTimestamp + 4 * 60 * 60 * 1000, value: Number(quote.low.toFixed(2)) },
    { label: 'Close', timestamp: baseTimestamp + 6.5 * 60 * 60 * 1000, value: Number(quote.price.toFixed(2)) },
  ];
}

function calculateSma(values: number[], period: number) {
  if (values.length < period) return null;
  const window = values.slice(-period);
  const total = window.reduce((sum, value) => sum + value, 0);
  return Number((total / period).toFixed(2));
}

function calculateRsi(values: number[], period = 14) {
  if (values.length <= period) return null;

  let gains = 0;
  let losses = 0;

  for (let index = 1; index <= period; index += 1) {
    const delta = values[index] - values[index - 1];
    if (delta >= 0) gains += delta;
    else losses -= delta;
  }

  let averageGain = gains / period;
  let averageLoss = losses / period;

  for (let index = period + 1; index < values.length; index += 1) {
    const delta = values[index] - values[index - 1];
    const gain = delta > 0 ? delta : 0;
    const loss = delta < 0 ? -delta : 0;

    averageGain = (averageGain * (period - 1) + gain) / period;
    averageLoss = (averageLoss * (period - 1) + loss) / period;
  }

  if (averageLoss === 0) {
    return 100;
  }

  const relativeStrength = averageGain / averageLoss;
  return Number((100 - 100 / (1 + relativeStrength)).toFixed(2));
}

function calculateEmaSeries(values: number[], period: number) {
  if (!values.length) return [];

  const smoothing = 2 / (period + 1);
  const result: number[] = [];
  let current = values[0];

  values.forEach((value, index) => {
    current = index === 0 ? value : value * smoothing + current * (1 - smoothing);
    result.push(current);
  });

  return result;
}

function calculateMacd(values: number[]) {
  if (values.length < 26) return null;

  const fast = calculateEmaSeries(values, 12);
  const slow = calculateEmaSeries(values, 26);
  const macdLine = fast.map((value, index) => value - slow[index]);
  const latest = macdLine[macdLine.length - 1];

  return Number(latest.toFixed(2));
}

function calculateMomentumScore(price: number, sma20: number | null, sma50: number | null, rsi14: number | null, macd: number | null) {
  let score = 50;

  if (sma20 !== null) {
    score += price >= sma20 ? 10 : -10;
  }

  if (sma20 !== null && sma50 !== null) {
    score += sma20 >= sma50 ? 10 : -10;
  }

  if (rsi14 !== null) {
    if (rsi14 >= 50 && rsi14 <= 68) score += 12;
    else if (rsi14 > 68) score += 4;
    else if (rsi14 < 35) score -= 10;
    else score -= 4;
  }

  if (macd !== null) {
    score += macd >= 0 ? 8 : -8;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildSectorPerformance(stocks: StockQuote[]) {
  const sectors = new Map<string, StockQuote[]>();

  stocks.forEach((stock) => {
    const current = sectors.get(stock.sector) ?? [];
    current.push(stock);
    sectors.set(stock.sector, current);
  });

  return Array.from(sectors.entries())
    .map(([name, items]) => {
      const averageMove = items.reduce((sum, stock) => sum + stock.changePercent, 0) / items.length;
      return {
        name,
        changePercent: Number(averageMove.toFixed(2)),
        breadth: `${items.filter((stock) => stock.changePercent >= 0).length}/${items.length} advancing`,
        leaders: [...items]
          .sort((left, right) => right.changePercent - left.changePercent)
          .slice(0, 2)
          .map((stock) => stock.symbol),
      };
    })
    .sort((left, right) => right.changePercent - left.changePercent);
}

function deriveNewsTag(title: string, summary: string) {
  const haystack = `${title} ${summary}`.toLowerCase();
  if (haystack.includes('rbi') || haystack.includes('inflation') || haystack.includes('yield') || haystack.includes('policy')) {
    return 'Macro';
  }
  if (haystack.includes('results') || haystack.includes('earnings') || haystack.includes('quarter')) {
    return 'Earnings';
  }
  if (haystack.includes('bank') || haystack.includes('finance')) {
    return 'Banks';
  }
  if (haystack.includes('it') || haystack.includes('software') || haystack.includes('technology')) {
    return 'IT';
  }
  return 'Market';
}

async function getAlphaQuote(symbol: string) {
  if (!alphaVantageApiKey) return null;

  const alphaSymbol = alphaSymbolMap[symbol];
  if (!alphaSymbol) return null;

  return getCachedOrFetch(`${MARKET_CACHE_PREFIX}:quote:${alphaSymbol}`, QUOTE_TTL_MS, async () =>
    queueAlphaRequest(async () => {
      const payload = await fetchJson<Record<string, unknown>>(
        buildAlphaUrl({
          function: 'GLOBAL_QUOTE',
          symbol: alphaSymbol,
          apikey: alphaVantageApiKey,
        })
      );
      return parseAlphaQuote(payload);
    })
  );
}

async function getAlphaSeries(symbol: string, seriesFunction: AlphaSeriesFunction) {
  if (!alphaVantageApiKey) return [] as AlphaBar[];

  const alphaSymbol = alphaSymbolMap[symbol];
  if (!alphaSymbol) return [] as AlphaBar[];

  return getCachedOrFetch(`${MARKET_CACHE_PREFIX}:series:${seriesFunction}:${alphaSymbol}`, SERIES_TTL_MS, async () =>
    queueAlphaRequest(async () => {
      const payload = await fetchJson<Record<string, unknown>>(
        buildAlphaUrl({
          function: seriesFunction,
          symbol: alphaSymbol,
          apikey: alphaVantageApiKey,
        })
      );
      return parseAlphaSeries(payload, seriesFunction);
    })
  );
}

async function getGnewsItems() {
  if (!gnewsApiKey) return [] as MarketNewsItem[];

  return getCachedOrFetch(`${MARKET_CACHE_PREFIX}:news:gnews`, NEWS_TTL_MS, async () => {
    const payload = await fetchJson<{
      articles?: Array<{
        title?: string;
        description?: string;
        publishedAt?: string;
        source?: { name?: string };
      }>;
    }>(buildGnewsUrl());

    return (payload.articles ?? [])
      .filter((article) => article.title && article.description)
      .slice(0, 6)
      .map((article, index) => {
        const title = article.title ?? 'Market update';
        const summary = article.description ?? 'No summary available.';

        return {
          id: `gnews-${index}-${title.slice(0, 24).replace(/\s+/g, '-').toLowerCase()}`,
          source: article.source?.name ?? 'GNews',
          title,
          summary,
          tag: deriveNewsTag(title, summary),
          publishedAt: article.publishedAt ? new Date(article.publishedAt).getTime() : Date.now(),
        } satisfies MarketNewsItem;
      });
  });
}

function buildRangeSeries(
  fallback: StockQuote['priceSeries'],
  dailyBars: AlphaBar[],
  weeklyBars: AlphaBar[],
  monthlyBars: AlphaBar[],
  quote: AlphaQuote | null
) {
  const dailyPoints = dailyBars.map((bar) => createDatePoint(bar.date, bar.close, '1M'));
  const weeklyPoints = weeklyBars.map((bar) => createDatePoint(bar.date, bar.close, '1Y'));
  const monthlyPoints = monthlyBars.map((bar) => createDatePoint(bar.date, bar.close, '5Y'));

  return {
    '1D': quote ? buildSyntheticDaySeries(quote) : fallback['1D'],
    '1W': dailyBars.length >= 5 ? dailyBars.slice(-5).map((bar) => createDatePoint(bar.date, bar.close, '1W')) : fallback['1W'],
    '1M': dailyBars.length >= 10 ? dailyPoints.slice(-22) : fallback['1M'],
    '3M': dailyBars.length >= 30 ? dailyPoints.slice(-66) : fallback['3M'],
    '1Y': weeklyBars.length >= 10 ? weeklyPoints.slice(-52) : fallback['1Y'],
    '5Y': monthlyBars.length >= 12 ? monthlyPoints.slice(-60) : fallback['5Y'],
  } satisfies Record<MarketRange, PricePoint[]>;
}

function patchQuote(baseStock: StockQuote, quote: AlphaQuote | null): StockQuote {
  if (!quote) {
    return baseStock;
  }

  return {
    ...baseStock,
    exchange: 'BSE',
    price: quote.price || baseStock.price,
    change: quote.change,
    changePercent: quote.changePercent,
    volume: quote.volume ? formatCompactNumber(quote.volume) : baseStock.volume,
    dataSource: 'Alpha Vantage delayed BSE quote',
    lastTradingDay: quote.latestTradingDay,
  };
}

export function isLiveMarketDataEnabled() {
  if (configuredMode === 'mock') {
    return false;
  }

  return Boolean(alphaVantageApiKey || gnewsApiKey);
}

export async function fetchLiveMarketSnapshot(baseSnapshot: MarketSnapshot) {
  let stocks = baseSnapshot.stocks;
  let alphaApplied = false;
  let gnewsApplied = false;

  if (alphaVantageApiKey) {
    const patchedStocks = await Promise.all(
      baseSnapshot.stocks.map(async (stock) => {
        try {
          const quote = await getAlphaQuote(stock.symbol);
          return patchQuote(stock, quote);
        } catch {
          return stock;
        }
      })
    );

    alphaApplied = patchedStocks.some(
      (stock, index) =>
        stock.price !== baseSnapshot.stocks[index].price ||
        stock.changePercent !== baseSnapshot.stocks[index].changePercent
    );
    stocks = patchedStocks;
  }

  let news = baseSnapshot.news;
  if (gnewsApiKey) {
    try {
      const liveNews = await getGnewsItems();
      if (liveNews.length) {
        news = liveNews;
        gnewsApplied = true;
      }
    } catch {
      gnewsApplied = false;
    }
  }

  const providerParts: string[] = [];
  if (alphaApplied) providerParts.push('Alpha Vantage delayed BSE quotes');
  else if (alphaVantageApiKey) providerParts.push('Alpha Vantage fallback');

  providerParts.push('local index fallback');

  if (gnewsApplied) providerParts.push('GNews headlines');
  else if (gnewsApiKey) providerParts.push('fallback news');

  return {
    ...baseSnapshot,
    mode: alphaApplied || gnewsApplied ? 'hybrid' : baseSnapshot.mode,
    providerLabel: providerParts.length ? providerParts.join(' + ') : baseSnapshot.providerLabel,
    lastUpdated: alphaApplied || gnewsApplied ? Date.now() : baseSnapshot.lastUpdated,
    stocks,
    topGainers: [...stocks].sort((left, right) => right.changePercent - left.changePercent).slice(0, 4),
    topLosers: [...stocks].sort((left, right) => left.changePercent - right.changePercent).slice(0, 4),
    sectors: buildSectorPerformance(stocks),
    news,
  } satisfies MarketSnapshot;
}

export async function fetchLiveStockDetails(stock: StockQuote) {
  if (!alphaVantageApiKey) return null;

  try {
    const [quote, dailyBars, weeklyBars, monthlyBars] = await Promise.all([
      getAlphaQuote(stock.symbol),
      getAlphaSeries(stock.symbol, 'TIME_SERIES_DAILY'),
      getAlphaSeries(stock.symbol, 'TIME_SERIES_WEEKLY'),
      getAlphaSeries(stock.symbol, 'TIME_SERIES_MONTHLY'),
    ]);

    const closes = dailyBars.map((bar) => bar.close);
    const sma20 = calculateSma(closes, 20);
    const sma50 = calculateSma(closes, 50);
    const rsi14 = calculateRsi(closes, 14);
    const macd = calculateMacd(closes);
    const latestClose = quote?.price ?? closes[closes.length - 1] ?? stock.price;
    const trailingYear = weeklyBars.slice(-52);
    const high52Week = trailingYear.length ? Math.max(...trailingYear.map((bar) => bar.high)) : stock.high52Week;
    const low52Week = trailingYear.length ? Math.min(...trailingYear.map((bar) => bar.low)) : stock.low52Week;

    return {
      price: latestClose,
      change: quote?.change ?? stock.change,
      changePercent: quote?.changePercent ?? stock.changePercent,
      high52Week: Number(high52Week.toFixed(2)),
      low52Week: Number(low52Week.toFixed(2)),
      volume: quote?.volume ? formatCompactNumber(quote.volume) : stock.volume,
      lastTradingDay: quote?.latestTradingDay ?? dailyBars[dailyBars.length - 1]?.date ?? stock.lastTradingDay,
      dataSource: 'Alpha Vantage delayed daily, weekly, and monthly history',
      rsi14,
      macd,
      sma20,
      sma50,
      momentumScore: calculateMomentumScore(latestClose, sma20, sma50, rsi14, macd),
      priceSeries: buildRangeSeries(stock.priceSeries, dailyBars, weeklyBars, monthlyBars, quote),
    } satisfies Partial<StockQuote>;
  } catch {
    return null;
  }
}
