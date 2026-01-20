# Remaining Tasks

## ✅ Completed
1. **AI Chatbot in Header** - DONE & PUSHED
   - Added AI button in header next to Settings
   - Opens in global modal
   - Available across all tabs

## 🔄 Partially Complete (Need to Commit & Push)

### 1. AIChatbot Component Modal Mode
- File: `web/components/AIChatbot.tsx`
- Status: Code written but needs to be committed
- Changes:
  - Added modal mode support with `onClose` prop
  - Refactored rendering logic
  - Fixed TypeScript errors

### 2. LinkedIn URL Update
- File: `web/components/Settings.tsx`
- Current: `https://linkedin.com/in/lekhanhr`
- Needs: `https://www.linkedin.com/in/lekhan-hr-507b89371/`
- Status: Need to apply change

### 3. Instant Notifications in AppContext
- File: `web/context/AppContext.tsx`
- Status: Need to apply changes
- Changes needed:
  - Import `sendBudgetAlert` from notifications
  - Update `addTransaction` to check budgets instantly
  - Send notification at 80% and 100% thresholds

### 4. Custom Alerts Instant Notifications
- File: `web/components/CustomAlerts.tsx`
- Status: Need to apply changes
- Changes needed:
  - Import `sendNotification`
  - Update useEffect to check alerts on transaction changes
  - Add 5-minute cooldown logic
  - Enhanced notification messages

### 5. Light Mode for All Tabs
- Files: 
  - `web/components/Transactions.tsx`
  - `web/components/BudgetView.tsx`
  - `web/components/Reports.tsx`
  - `web/components/Goals.tsx`
  - `web/components/Dashboard.tsx` (remove AIChatbot)
- Status: Need to apply changes
- Pattern:
  - `bg-white dark:bg-zinc-900/50`
  - `text-gray-900 dark:text-white`
  - `border-gray-200 dark:border-zinc-800`
  - Colorful icons with 2px borders
  - shadow-lg for depth

## 📝 Quick Apply Instructions

To complete the remaining tasks, apply these changes:

### Settings.tsx - LinkedIn URL
```typescript
// Line ~438
href="https://www.linkedin.com/in/lekhan-hr-507b89371/"
```

### AppContext.tsx - Instant Budget Alerts
```typescript
// Add import
import { sendBudgetAlert } from '../lib/notifications';

// Update addTransaction function
const addTransaction = async (transaction: Transaction) => {
  const newTransactions = [transaction, ...transactions];
  setTransactions(newTransactions);
  syncTransactions(newTransactions);
  
  // Check budget alerts instantly
  if (transaction.type === 'expense') {
    const budget = budgets.find(b => b.category === transaction.category);
    if (budget) {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
      
      const monthlySpending = newTransactions
        .filter(t => 
          t.type === 'expense' && 
          t.category === transaction.category && 
          t.date >= monthStart && 
          t.date <= monthEnd
        )
        .reduce((sum, t) => sum + t.amount, 0);
      
      const percentUsed = (monthlySpending / budget.limit) * 100;
      
      if (percentUsed >= 80) {
        const categoryName = categories.find(c => c.id === transaction.category)?.name || 'Unknown';
        await sendBudgetAlert(categoryName, percentUsed);
      }
    }
  }
};
```

### CustomAlerts.tsx - Instant Notifications
```typescript
// Add import
import { sendNotification } from '../lib/notifications';

// Update useEffect
useEffect(() => {
  const checkAndNotify = async () => {
    for (const alert of alerts.filter(a => a.enabled && a.frequency === 'instant')) {
      const shouldTrigger = checkAlert(alert);
      if (shouldTrigger) {
        const lastNotified = localStorage.getItem(`alert_${alert.id}_last`);
        const now = Date.now();
        if (!lastNotified || now - parseInt(lastNotified) > 5 * 60 * 1000) {
          await showNotification(alert);
          localStorage.setItem(`alert_${alert.id}_last`, now.toString());
        }
      }
    }
  };
  checkAndNotify();
}, [transactions, alerts]);

// Update showNotification
const showNotification = async (alert: CustomAlert) => {
  const cat = alert.category ? categories.find(c => c.id === alert.category) : null;
  const catName = cat ? cat.name : '';
  
  let message = '';
  switch (alert.type) {
    case 'spending':
      message = `Your daily spending has ${alert.condition} ${formatCurrency(alert.amount)}!`;
      break;
    case 'category':
      message = `Your ${catName} spending has ${alert.condition} ${formatCurrency(alert.amount)}!`;
      break;
    case 'balance':
      message = `Your account balance is ${alert.condition} ${formatCurrency(alert.amount)}!`;
      break;
  }
  
  await sendNotification(`🔔 ${alert.name}`, message);
};
```

## 🎯 Priority Order
1. LinkedIn URL (quick fix)
2. Instant notifications (AppContext + CustomAlerts)
3. Light mode for all tabs (can be done incrementally)

## 📚 Documentation Created
- `LIGHT_MODE_UPDATE_COMPLETE.md` - Full light mode documentation
- `INSTANT_NOTIFICATIONS_UPDATE.md` - Instant notifications guide
- `REMAINING_TASKS.md` - This file

All the code is ready - just needs to be applied and committed!
