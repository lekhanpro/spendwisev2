# 💰 SpendWise

A comprehensive money management platform built with React Native (Expo) and Firebase.

[![GitHub release](https://img.shields.io/github/v/release/lekhanpro/spendwisev2?style=flat-square)](https://github.com/lekhanpro/spendwisev2/releases)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20Web-green.svg?style=flat-square)]()
[![CI](https://github.com/lekhanpro/spendwisev2/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/lekhanpro/spendwisev2/actions/workflows/ci.yml)

## 📥 Download

**[📱 Download Android App (APK)](https://github.com/lekhanpro/spendwisev2/releases/latest)** - Get the latest release

**[🌐 Use Web App](https://spendwisev2.vercel.app)** - Access the app directly in your browser

**[📖 Documentation](https://lekhanpro.github.io/spendwisev2/)**

**[🤖 CodeWiki](https://codewiki.google/github.com/lekhanpro/spendwisev2)** - AI-powered codebase documentation - View complete documentation

---

## 📖 Overview

SpendWise helps you take control of your finances by tracking income and expenses, managing budgets, setting savings goals, and getting AI-powered insights. The app features personalized recommendations powered by Groq's LLaMA 3.3 70B model.

---

## ✨ Features

### 💳 Core Features
- **Smart Dashboard**: View balance, weekly spending charts, and recent transactions
- **Transaction Tracking**: Add income/expenses with categories, payment methods, and notes
- **Budget Management**: Set spending limits by category with visual progress tracking
- **Savings Goals**: Create goals with deadlines and priority levels

### 🤖 AI Features
- **Financial Health Score**: AI-calculated score from 0-100 based on your habits
- **Personalized Insights**: Get success, warning, and tip messages about your finances
- **Smart Recommendations**: Actionable advice tailored to your spending patterns
- **Weekly AI Summaries**: Automated analysis every Monday morning

### 📊 Analytics Features
- **Visual Reports**: Pie charts for category breakdown, bar charts for daily spending
- **Time Range Selection**: View weekly, monthly, or yearly analytics
- **Spending Trends**: Understand patterns in your financial behavior

### 🔔 Notification Features
- **Budget Alerts**: Get notified at 80% and 100% of budget limits
- **Daily Reminders**: Optional reminder to log expenses at 8 PM
- **Weekly Insights**: AI summary notifications every Monday

### 🛠️ Additional Features
- **Multi-Currency Support**: USD, EUR, GBP, INR, and more
- **Dark/Light Theme**: Automatic system theme support
- **Cloud Sync**: Real-time data sync across devices with Firebase
- **Offline Support**: Works offline with automatic sync when online
- **Web App Support**: Access via browser with responsive design

---

## 🛠️ Tech Stack

### Frontend (Mobile App)
| Technology | Purpose |
|------------|---------|
| React Native 0.76 | Cross-platform mobile framework |
| Expo SDK 52 | Development and build tooling |
| Expo Router | File-based navigation |
| TypeScript | Type-safe development |
| React Context | State management |
| react-native-chart-kit | Data visualization |
| Expo Notifications | Push notifications |

### Backend Services
| Service | Purpose |
|---------|---------|
| Firebase Auth | User authentication |
| Firebase Realtime DB | Data storage & sync |
| Groq API | AI insights (LLaMA 3.3 70B) |

### Build & Deploy
| Service | Purpose |
|---------|---------|
| EAS Build | Cloud APK/AAB builds |
| GitHub Actions | CI/CD automation |
| GitHub Pages | Documentation hosting |
| Vercel | Web app hosting |

---

## 📁 Project Structure

```
spendwise-native/
├── app/                          # Expo Router screens
│   ├── (auth)/                   # Authentication screens
│   │   ├── _layout.tsx           # Auth stack layout
│   │   └── login.tsx             # Login/Register
│   ├── (tabs)/                   # Main tab screens
│   │   ├── _layout.tsx           # Tab navigator (7 tabs)
│   │   ├── index.tsx             # Dashboard
│   │   ├── transactions.tsx      # Transaction list
│   │   ├── insights.tsx          # AI Insights
│   │   ├── reports.tsx           # Charts & analytics
│   │   ├── budget.tsx            # Budget management
│   │   ├── goals.tsx             # Savings goals
│   │   └── settings.tsx          # App settings
│   └── _layout.tsx               # Root layout
├── lib/                          # Service modules
│   ├── firebase.ts               # Firebase config
│   ├── auth.ts                   # Auth helpers
│   ├── database.ts               # DB operations
│   ├── ai.ts                     # Groq AI integration
│   └── notifications.ts          # Notifications
├── context/
│   └── AppContext.tsx            # Global state
├── types/
│   └── index.ts                  # TypeScript interfaces
├── constants/
│   └── app.ts                    # Categories, colors
├── docs/                         # GitHub Pages site
├── .github/workflows/            # CI/CD
│   ├── build-android.yml         # EAS Build
│   └── pages.yml                 # Pages deploy
├── app.json                      # Expo config
├── eas.json                      # EAS Build profiles
└── package.json                  # Dependencies
```

---

## 🚀 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)

### Setup

```bash
# Clone the repository
git clone https://github.com/lekhanpro/spendwisev2.git
cd spendwisev2

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env and add your GROQ API key

# Start development server
npm start
```

### Building for Production

```bash
# Login to EAS
npx eas-cli login

# Build APK (for testing)
npx eas-cli build --platform android --profile preview

# Build AAB (for Play Store)
npx eas-cli build --platform android --profile production
```

---

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_GROQ_API_KEY` | Groq API key for AI insights | ✅ Yes |

### Local Development
Create a `.env` file in the project root:
```
EXPO_PUBLIC_GROQ_API_KEY=gsk_your_api_key_here
```

### Production (EAS)
```bash
npx eas-cli secret:create --name EXPO_PUBLIC_GROQ_API_KEY --value gsk_your_key
```

---

## 🗄️ Database Schema

### Firebase Realtime Database Structure

```
/users/{userId}/
│
├── transactions/{transactionId}
│   ├── id: string
│   ├── type: "income" | "expense"
│   ├── amount: number
│   ├── category: string
│   ├── date: timestamp
│   ├── note: string
│   └── paymentMethod: string
│
├── budgets/{budgetId}
│   ├── id: string
│   ├── category: string
│   ├── limit: number
│   └── period: "daily" | "weekly" | "monthly" | "yearly"
│
├── goals/{goalId}
│   ├── id: string
│   ├── name: string
│   ├── targetAmount: number
│   ├── currentAmount: number
│   ├── deadline: timestamp
│   └── priority: "low" | "medium" | "high"
│
└── settings/
    ├── currency: { code, symbol, name }
    └── darkMode: boolean
```

---

## 🔌 API Endpoints

### Groq AI API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `api.groq.com/openai/v1/chat/completions` | Generate financial insights |

### Firebase Services
| Service | Operations |
|---------|-----------|
| Auth | signUp, signIn, logout, resetPassword |
| Database | CRUD for transactions, budgets, goals, settings |
| Real-time | Subscribe to data changes with onValue() |

---

## 📱 Key Services

### authService (`lib/auth.ts`)
```typescript
signUp(email, password): Promise<User>
signIn(email, password): Promise<User>
logout(): Promise<void>
resetPassword(email): Promise<void>
```

### databaseService (`lib/database.ts`)
```typescript
saveTransaction(userId, transaction): Promise<void>
saveBudget(userId, budget): Promise<void>
saveGoal(userId, goal): Promise<void>
subscribeToTransactions(userId, callback): Unsubscribe
subscribeToBudgets(userId, callback): Unsubscribe
subscribeToGoals(userId, callback): Unsubscribe
```

### aiService (`lib/ai.ts`)
```typescript
getFinancialInsights(transactions, budgets, goals, currency): Promise<AIInsightResponse>
getQuickTip(): string
```

### notificationService (`lib/notifications.ts`)
```typescript
requestNotificationPermission(): Promise<boolean>
sendNotification(title, body, data?): Promise<void>
sendBudgetAlert(category, percentage): Promise<void>
scheduleDailyReminder(hour, minute): Promise<void>
scheduleWeeklySummary(): Promise<void>
```

---

## 🔔 Push Notifications

### Notification Types
| Type | Trigger | Channel |
|------|---------|---------|
| Budget Alert | 80% or 100% budget used | budget-alerts (HIGH) |
| Daily Reminder | 8:00 PM daily | default |
| Weekly Summary | Monday 9:00 AM | insights |

---

## 👨‍💻 Development Team

| Name | Role | GitHub |
|------|------|--------|
| Lekhan | Full Stack Developer | [@lekhanpro](https://github.com/lekhanpro) |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💬 Support

- **Documentation**: [lekhanpro.github.io/spendwisev2](https://lekhanpro.github.io/spendwisev2/)
- **Issues**: [GitHub Issues](https://github.com/lekhanpro/spendwisev2/issues)
- **Email**: Create an issue for support

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/lekhanpro">Lekhan</a>
</p>
