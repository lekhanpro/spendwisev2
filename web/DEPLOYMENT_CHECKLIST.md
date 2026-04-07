# Investment Module Deployment Checklist

## Pre-Deployment Steps

### 1. Install Dependencies
```bash
cd web
npm install
```

### 2. Verify TypeScript Compilation
```bash
npm run build
```
Expected: No TypeScript errors

### 3. Run Development Server
```bash
npm run dev
```
Expected: Server starts on http://localhost:5173

### 4. Manual Testing

#### Test Schemes Module
- [ ] Navigate to Invest → Schemes & Plans
- [ ] Filter by All/Government/Private/Tax-saving
- [ ] Search for "PPF"
- [ ] Click a scheme card
- [ ] Verify detail drawer opens
- [ ] Click official website link
- [ ] Shortlist a scheme
- [ ] Reload page and verify shortlist persists

#### Test Stock Suggester
- [ ] Navigate to Invest → Stock Suggester
- [ ] Complete risk assessment quiz
- [ ] Verify portfolio allocation table
- [ ] Sort stock table by different columns
- [ ] Track a stock
- [ ] Adjust SIP calculator sliders
- [ ] Verify chart updates
- [ ] Reload page and verify tracked stocks persist

#### Test Learning Dashboard
- [ ] Navigate to Invest → Learn
- [ ] Select a topic from sidebar
- [ ] Read article content
- [ ] Complete quiz (try wrong answers first)
- [ ] Submit quiz with 2/3 correct
- [ ] Verify topic marked complete
- [ ] Complete all 9 topics
- [ ] Verify "Finance Literate" badge appears
- [ ] Check streak counter

#### Test Notifications
- [ ] Click notification bell
- [ ] Verify panel opens
- [ ] Add income transaction ≥ ₹10,000
- [ ] Verify savings milestone notification
- [ ] Create budget and exceed 80%
- [ ] Verify budget alert notification
- [ ] Mark notification as read
- [ ] Dismiss a notification
- [ ] Verify high-priority shows toast

#### Test Mobile Responsiveness
- [ ] Open DevTools → Toggle device toolbar
- [ ] Test on iPhone SE (375px)
- [ ] Test on iPad (768px)
- [ ] Test on Desktop (1920px)
- [ ] Verify all layouts adapt correctly
- [ ] Test swipe-to-dismiss on notifications

#### Test Dark Mode
- [ ] Toggle dark mode in Settings
- [ ] Navigate through all Invest tabs
- [ ] Verify colors are readable
- [ ] Verify charts render correctly
- [ ] Verify borders and backgrounds adapt

### 5. Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### 6. Performance Checks
- [ ] Open DevTools → Performance
- [ ] Record page load
- [ ] Verify no memory leaks
- [ ] Check bundle size (should be reasonable)
- [ ] Verify no console errors
- [ ] Check network tab (no failed requests)

### 7. LocalStorage Verification
Open DevTools → Application → Local Storage:
- [ ] `spendwise_shortlisted_schemes` exists
- [ ] `spendwise_risk_profile` exists
- [ ] `spendwise_tracked_stocks` exists
- [ ] `spendwise_learn_progress` exists
- [ ] `spendwise_learn_streak` exists
- [ ] `spendwise_notifications` exists
- [ ] All values are valid JSON

### 8. Accessibility
- [ ] Tab navigation works
- [ ] Screen reader compatible
- [ ] Sufficient color contrast
- [ ] Touch targets ≥ 44x44px
- [ ] Focus indicators visible
- [ ] ARIA labels present

## Deployment Steps

### 1. Version Control
```bash
git add .
git commit -m "feat: Add investment module with 4 features"
git push origin main
```

### 2. Build for Production
```bash
npm run build
```

### 3. Test Production Build
```bash
npm run preview
```

### 4. Deploy to Hosting
Choose your platform:

#### Vercel
```bash
vercel --prod
```

#### Netlify
```bash
netlify deploy --prod
```

#### Firebase
```bash
firebase deploy
```

### 5. Post-Deployment Verification
- [ ] Visit production URL
- [ ] Test all 4 modules
- [ ] Verify data persists
- [ ] Check mobile responsiveness
- [ ] Test dark mode
- [ ] Verify notifications work

## Rollback Plan

If issues occur:

### 1. Immediate Rollback
```bash
git revert HEAD
git push origin main
```

### 2. Redeploy Previous Version
```bash
vercel rollback
# or
netlify rollback
```

### 3. Clear User Data (if needed)
Provide users with script:
```javascript
// Clear investment data
localStorage.removeItem('spendwise_shortlisted_schemes');
localStorage.removeItem('spendwise_risk_profile');
localStorage.removeItem('spendwise_tracked_stocks');
localStorage.removeItem('spendwise_learn_progress');
localStorage.removeItem('spendwise_learn_streak');
localStorage.removeItem('spendwise_notifications');
localStorage.removeItem('spendwise_invest_visited');
```

## Monitoring

### Key Metrics to Track
- [ ] Page load time for /invest
- [ ] User engagement with each module
- [ ] Notification click-through rate
- [ ] Learning completion rate
- [ ] Error rate in console
- [ ] LocalStorage usage

### Analytics Events to Track
- `invest_tab_viewed`
- `scheme_shortlisted`
- `risk_quiz_completed`
- `stock_tracked`
- `learning_topic_completed`
- `notification_clicked`

## Known Issues

None at deployment time.

## Support Documentation

- Technical: `INVESTMENT_MODULE_README.md`
- Testing: `INVESTMENT_QUICKSTART.md`
- Summary: `INVESTMENT_IMPLEMENTATION_SUMMARY.md`

## Sign-Off

- [ ] Code reviewed
- [ ] Tests passed
- [ ] Documentation complete
- [ ] Stakeholders approved
- [ ] Ready for production

---

**Deployment Date:** _____________
**Deployed By:** _____________
**Version:** 2.0.0
**Status:** ⏳ Pending / ✅ Complete
