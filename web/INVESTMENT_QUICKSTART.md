# Investment Module Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd web
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Access Investment Hub
- Click on the "Invest" tab in the bottom navigation (📈 icon)
- Or set `activeView` to 'invest' programmatically

## 🎯 Testing Each Module

### MODULE 1: Schemes & Plans

**Test Steps:**
1. Navigate to Investment Hub → "Schemes & Plans" tab
2. Try filtering: All | Government | Private | Tax-saving
3. Search for "PPF" or "ELSS"
4. Click any scheme card to open detail drawer
5. Click star icon to shortlist a scheme
6. Check localStorage: `spendwise_shortlisted_schemes`

**Expected Behavior:**
- Cards show returns badge (color-coded)
- Risk pills display correctly
- If monthly savings ≥ minAmount, see "You can start with ₹X" message
- Drawer shows full details + official link
- Shortlist persists across page reloads

### MODULE 2: Stock Suggester

**Test Steps:**
1. Navigate to "Stock Suggester" tab
2. Complete 5-question risk quiz
3. View portfolio allocation table
4. Sort stock table by different columns
5. Click "Track" on any stock
6. Adjust SIP calculator sliders
7. Check localStorage: `spendwise_risk_profile`, `spendwise_tracked_stocks`

**Expected Behavior:**
- Quiz saves profile (Conservative/Moderate/Aggressive)
- Portfolio allocation changes based on profile
- Stock table sorts correctly
- SIP calculator shows bar chart with projections
- Tracked stocks persist

### MODULE 3: Learning Dashboard

**Test Steps:**
1. Navigate to "Learn" tab
2. Click any topic in sidebar
3. Read article and key takeaway
4. Complete 3-question quiz
5. Submit quiz (need 2/3 correct to pass)
6. Complete all 9 topics
7. Check localStorage: `spendwise_learn_progress`, `spendwise_learn_streak`

**Expected Behavior:**
- Progress percentage updates in header
- Completed topics show ✓ in sidebar
- Streak counter increments on daily visits
- "Finance Literate" badge appears at 100% completion
- New users auto-redirect to Learn page on first visit

### MODULE 4: Notifications

**Test Steps:**
1. Click notification bell icon in header
2. View notifications panel (grouped by Today/This week/Earlier)
3. Click notification to mark as read
4. Swipe notification left on mobile to dismiss
5. Add transactions to trigger budget alerts
6. Check localStorage: `spendwise_notifications`

**Trigger Notifications:**
- **SIP Reminder**: Change system date to 1st of month
- **Savings Milestone**: Add income transactions totaling ₹10,000+
- **Budget Alert**: Add expenses >80% of budget limit
- **Learn Streak**: Visit Learn page daily for 7 days
- **Scheme Deadline**: Change system date to March 25-31
- **Weekly Tip**: Change system date to Monday

**Expected Behavior:**
- Bell shows unread count badge
- High-priority notifications show toast (top-right, 5s)
- Panel groups by time period
- Swipe-to-dismiss works on mobile
- Max 50 notifications stored

## 🧪 Test Data

### Sample Monthly Savings
To test "You can start with ₹X" messages:
1. Add income transaction: ₹50,000
2. Add expense transactions: ₹30,000
3. Monthly savings = ₹20,000
4. Schemes with minAmount ≤ ₹20,000 will show the message

### Sample Budget Alert
1. Create budget: Food category, ₹5,000 limit
2. Add food expenses totaling ₹4,000+ (80%+)
3. Notification should appear

## 📱 Mobile Testing

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Touch Gestures
- Swipe left on notification to dismiss
- Tap to select quiz answers
- Tap scheme cards to open drawer

## 🎨 Dark Mode Testing

Toggle dark mode in Settings to verify:
- All components render correctly
- Colors are readable
- Borders and backgrounds adapt
- Charts remain visible

## 🔍 LocalStorage Inspection

Open browser DevTools → Application → Local Storage:

```javascript
// View all investment data
localStorage.getItem('spendwise_shortlisted_schemes')
localStorage.getItem('spendwise_risk_profile')
localStorage.getItem('spendwise_tracked_stocks')
localStorage.getItem('spendwise_learn_progress')
localStorage.getItem('spendwise_learn_streak')
localStorage.getItem('spendwise_notifications')
localStorage.getItem('spendwise_invest_visited')

// Clear all investment data
localStorage.removeItem('spendwise_shortlisted_schemes')
localStorage.removeItem('spendwise_risk_profile')
localStorage.removeItem('spendwise_tracked_stocks')
localStorage.removeItem('spendwise_learn_progress')
localStorage.removeItem('spendwise_learn_streak')
localStorage.removeItem('spendwise_notifications')
localStorage.removeItem('spendwise_invest_visited')
```

## 🐛 Troubleshooting

### Issue: Notifications not appearing
**Solution:** Check that NotificationProvider wraps the app in App.tsx

### Issue: Monthly savings showing 0
**Solution:** Add income and expense transactions in current month

### Issue: Learn page not auto-redirecting
**Solution:** Clear `spendwise_invest_visited` from localStorage

### Issue: Charts not rendering
**Solution:** Ensure recharts is installed: `npm install recharts`

### Issue: Dark mode colors wrong
**Solution:** Verify Tailwind dark mode is enabled in config

## 📊 Performance Tips

- Notifications are checked every hour (not every render)
- LocalStorage has 50 notification limit (auto-pruned)
- Stock data is static (no API calls)
- Scheme data is static (no API calls)

## ✅ Verification Checklist

- [ ] All 4 modules accessible from Invest tab
- [ ] Filters and search work in Schemes
- [ ] Risk quiz saves profile correctly
- [ ] Portfolio allocation matches profile
- [ ] SIP calculator shows chart
- [ ] Learning progress persists
- [ ] Streak counter increments daily
- [ ] Notifications appear and persist
- [ ] Toast shows for high-priority notifications
- [ ] Mobile responsive on all screens
- [ ] Dark mode works everywhere
- [ ] No console errors
- [ ] LocalStorage keys correct

## 🎉 Success Criteria

You've successfully implemented the investment module when:
1. ✅ Users can browse and shortlist 11 investment schemes
2. ✅ Users can assess risk profile and get personalized portfolio
3. ✅ Users can track stocks and calculate SIP returns
4. ✅ Users can learn 9 financial topics with quizzes
5. ✅ Users receive contextual notifications
6. ✅ All data persists across sessions
7. ✅ Mobile and desktop experiences are smooth
8. ✅ No breaking changes to existing features
