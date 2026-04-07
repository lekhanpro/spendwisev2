# SpendWise Investment Module

Complete implementation of 4 investment features for SpendWise v2.

## 🎯 Implemented Modules

### MODULE 1 - Government & Investment Info Box
**Location:** `src/components/invest/SchemeInfoBox.tsx`
**Data:** `src/data/schemes.json`

Features:
- ✅ Filterable card grid (All | Government | Private | Tax-saving)
- ✅ 11 Indian financial schemes (PPF, NPS, Sukanya Samriddhi, SCSS, APY, SGB, ELSS, Corporate FDs, REITs, Nifty 50, ULIPs)
- ✅ Returns badge with color coding (green >8%, amber 5-8%, gray <5%)
- ✅ Risk pills (Low/Medium/High)
- ✅ Min amount and tenure display
- ✅ Slide-over drawer with full details + official links
- ✅ "You can start with ₹X" message based on monthly savings
- ✅ Search functionality
- ✅ Shortlist feature (localStorage: spendwise_shortlisted_schemes)

### MODULE 2 - Personalised Stock Suggester
**Location:** `src/components/invest/StockSuggester.tsx`, `src/components/invest/RiskProfileForm.tsx`
**Data:** `src/data/stocksData.json`

Features:
- ✅ 5-question risk assessment quiz
- ✅ Risk profiles: Conservative / Moderate / Aggressive (localStorage: spendwise_risk_profile)
- ✅ Portfolio allocation table based on profile + savings
  - Conservative: 60% debt MF + 20% PPF + 10% gold ETF + 10% large-cap
  - Moderate: 40% large-cap + 20% mid-cap + 20% debt + 10% REIT + 10% gold
  - Aggressive: 50% small/mid-cap + 20% sectoral + 15% direct stocks + 10% crypto ETF + 5% international
- ✅ Curated stock watchlist (15 stocks: 5 blue-chip, 5 mid-cap, 5 dividend)
- ✅ Sortable table (by name, price, change, dividend yield)
- ✅ "Track this" button (localStorage: spendwise_tracked_stocks)
- ✅ SIP calculator with recharts bar chart showing projected corpus

### MODULE 3 - Newbie Learning Dashboard
**Location:** `src/pages/invest/LearnPage.tsx`
**Data:** `src/data/learningTopics.json`

Features:
- ✅ 9 financial topics with sidebar navigation
  1. Saving basics
  2. Understanding Stocks
  3. Mutual Funds
  4. SIPs
  5. Bonds & FDs
  6. Index Funds
  7. Taxes & 80C
  8. Reading Balance Sheets
  9. Diversification
- ✅ Each topic includes: article content + key takeaway box + 3-question MCQ quiz
- ✅ Progress tracking (localStorage: spendwise_learn_progress)
- ✅ Overall completion percentage in sidebar
- ✅ "Finance Literate" badge on 100% completion
- ✅ Streak counter for daily visits (localStorage: spendwise_learn_streak)
- ✅ Auto-redirect new users to /invest/learn on first visit

### MODULE 4 - Custom Notification System
**Location:** 
- Context: `src/context/NotificationContext.tsx`
- Components: `src/components/notifications/NotificationBell.tsx`, `NotificationPanel.tsx`, `Toast.tsx`
- Hook: `src/hooks/useNotifications.ts`

Features:
- ✅ Notification types:
  - sip_reminder (1st of month)
  - savings_milestone (₹10k/50k/1L/2L/5L)
  - budget_alert (>80% category spend)
  - learn_streak (every 7 days)
  - scheme_deadline (PPF March 31)
  - weekly_scheme_tip (every Monday)
- ✅ Bell icon with unread count badge
- ✅ Right slide-over panel grouped by Today / This week / Earlier
- ✅ Priority levels (high/medium/low) with color-coded borders
- ✅ High-priority notifications show toast (top-right, 5s auto-dismiss)
- ✅ Swipe-to-dismiss on mobile
- ✅ Persist in localStorage (max 50 notifications)
- ✅ Auto-generation via checkAndGenerateNotifications() on app load

## 🔧 Technical Implementation

### Context Architecture
```
AppProvider (existing)
  └── FinanceProvider (new)
      └── NotificationProvider (new)
          └── App Components
```

### FinanceContext
Provides:
- `monthlySavings` - calculated from transactions
- `monthlyIncome` - calculated from transactions
- `riskProfile` - Conservative/Moderate/Aggressive
- `shortlistedSchemes` - array of scheme IDs
- `trackedStocks` - array of stock IDs
- `learnProgress` - object mapping topic IDs to completion status
- `learnStreak` - number of consecutive days

### NotificationContext
Provides:
- `notifications` - array of notification objects
- `unreadCount` - number of unread notifications
- `markAsRead()` - mark single notification as read
- `markAllAsRead()` - mark all as read
- `dismissNotification()` - remove notification
- `addNotification()` - add new notification

### LocalStorage Keys
- `spendwise_shortlisted_schemes` - JSON array
- `spendwise_risk_profile` - string (conservative/moderate/aggressive)
- `spendwise_tracked_stocks` - JSON array
- `spendwise_learn_progress` - JSON object
- `spendwise_learn_streak` - number
- `spendwise_learn_last_visit` - date string
- `spendwise_notifications` - JSON array (max 50)
- `spendwise_invest_visited` - boolean flag

## 🎨 Design Patterns

### Mobile-First Responsive
- All components use Tailwind responsive classes
- Touch-friendly tap targets (min 44x44px)
- Swipe gestures for mobile interactions
- Sticky headers and bottom navigation

### Dark Mode Support
- All components support dark mode via Tailwind dark: classes
- Consistent color palette matching existing SpendWise design

### Currency Format
- All amounts in INR (₹)
- Uses `toLocaleString('en-IN')` for proper formatting

## 🚀 Usage

### Navigate to Investment Hub
```typescript
setActiveView('invest')
```

### Access Finance Context
```typescript
import { useFinance } from '../context/FinanceContext';

const { monthlySavings, riskProfile, toggleShortlist } = useFinance();
```

### Access Notifications
```typescript
import { useNotifications } from '../hooks/useNotifications';

const { notifications, unreadCount, addNotification } = useNotifications();
```

## 📊 Data Sources

All data is static (no live API calls):
- Schemes: `web/data/schemes.json` (11 schemes)
- Stocks: `web/data/stocksData.json` (15 stocks)
- Learning: `web/data/learningTopics.json` (9 topics)

## ✅ Requirements Checklist

- [x] All routes under /invest
- [x] No breaking changes to existing code
- [x] Mobile-first responsive design
- [x] Dark mode support
- [x] INR currency format
- [x] No live API calls
- [x] LocalStorage persistence
- [x] FinanceContext for shared state
- [x] Notification system with toast
- [x] Auto-redirect to learn page for new users
- [x] All 4 modules fully implemented

## 🎯 Future Enhancements

Potential improvements:
- Real-time stock price integration
- More investment schemes
- Advanced portfolio analytics
- Investment goal tracking
- Tax calculator
- Comparison tools
- Export portfolio reports
