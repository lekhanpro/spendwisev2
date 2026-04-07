# SpendWise Invest Setup

## What ships locally right now

- A new `Invest` view in the main navigation without replacing `Reports`
- Responsive investment dashboard with dark mode support
- Market overview, stock workbench, portfolio tracker, scheme comparison, and personalized roadmap
- Quiet notification center: panel-only, opt-in, no auto toasts
- Local persistence for watchlist, holdings, goals, profile, and notification preferences
- Safe fallback mode: the dashboard falls back to bundled simulation data whenever a live provider is unavailable or rate-limited

## Recommended data stack

These are the services the module is designed around:

1. Stock market data
- Preferred when available: your official NSE/BSE credentials or a server-side proxy that wraps them
- Current localhost integration: Alpha Vantage delayed BSE quotes and history with aggressive local caching
- Recommended production upgrade: replace Alpha Vantage with official NSE/BSE or another licensed India-capable feed

2. Government schemes
- There is no single dependable public API for all Indian small-savings schemes
- Recommended approach: one server-side normalizer that pulls from official sources
- Primary official sources:
  - India Post small savings pages
  - RBI notices for Sovereign Gold Bonds
  - NPS Trust / PFRDA pages for NPS and APY

3. Mutual fund data
- Official baseline source: AMFI NAV feed / reports
- Recommended production approach: AMFI NAV data plus a normalized backend for factsheets, expense ratios, category tags, and portfolio disclosures

4. News feed
- Current localhost integration: GNews when the key is valid, otherwise bundled fallback headlines
- Recommended production approach: your own market news endpoint that filters to Indian equities, RBI, SEBI, budget, and rate-sensitive policy events

5. Optional AI layer
- The repo already has a Groq-backed AI utility
- Use it only for personalized summaries and roadmap narration, not for raw market data

## Env vars

Create `web/.env.local` from `web/.env.example`.

```bash
VITE_MARKET_DATA_MODE=live
VITE_MARKET_PROVIDER=alpha-vantage
VITE_ALPHA_VANTAGE_API_KEY=your_key_here
VITE_GNEWS_API_KEY=your_key_here
VITE_TWELVE_DATA_API_KEY=
VITE_YAHOO_FINANCE_PROXY_URL=https://your-proxy.example.com/yahoo
VITE_NSE_PROXY_URL=https://your-proxy.example.com/nse
VITE_BSE_PROXY_URL=https://your-proxy.example.com/bse
VITE_SCHEME_DATA_URL=https://your-api.example.com/schemes
VITE_MUTUAL_FUND_DATA_URL=https://your-api.example.com/mutual-funds
VITE_MARKET_NEWS_URL=https://your-api.example.com/news
VITE_GROQ_API_KEY=your_key_here
```

## File structure

```text
web/
  App.tsx
  .env.example
  INVESTMENT_SETUP.md
  context/
    InvestmentContext.tsx
    NotificationContext.tsx
  lib/
    investment/
      mockData.ts
  pages/
    invest/
      InvestPage.tsx
  components/
    investment/
      format.ts
      InvestUI.tsx
      MarketOverviewSection.tsx
      StocksSection.tsx
      PortfolioSection.tsx
      SchemesSection.tsx
      RoadmapSection.tsx
    notifications/
      NotificationBell.tsx
      NotificationPanel.tsx
```

## Implementation phases

1. Shell integration
- Add `Invest` navigation
- Preserve `Reports`
- Widen layout only for the investment page

2. Data model and persistence
- Investor profile
- Holdings
- Watchlist
- Goal plans
- Panel-only notification preferences

3. Dashboard sections
- Overview
- Stocks
- Portfolio
- Schemes
- Roadmap

4. Live data hardening
- Replace mock market snapshot with a provider-backed fetcher
- Add caching and TTLs
- Move scheme and mutual fund normalization server-side

5. Production quality gates
- Rate limiting
- Error boundaries and stale-data banners
- API fallback order
- Push and deploy

## Localhost run

1. Install dependencies in `web/`
2. Copy `.env.example` to `.env.local`
3. Set `VITE_MARKET_DATA_MODE=live` only when your market keys are present
4. Start the dev server if `node_modules` is already available

```bash
npm run dev
```

## Notes

- The current scheme numbers in the UI are reference snapshots, not authoritative live rates
- The current Alpha Vantage integration is quota-aware because the free key is limited to 25 requests per day and 1 request per second
- Direct Nifty 50, Sensex, and Bank Nifty index feeds still need an official Indian market-data source; the current cards use local fallback values
- All alerts stay inside the notification panel unless the user explicitly enables those categories
