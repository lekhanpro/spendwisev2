# SpendWise

A modern, comprehensive personal finance management application built with React, TypeScript, and Firebase.

## Live Demo

**[Use Web App](https://spendwisev2.vercel.app)** - Access the app directly in your browser

## Overview

SpendWise helps you take control of your finances with powerful tracking, budgeting, and goal-setting features. Built with a modern dark theme and glass-morphism design, SpendWise provides an intuitive and beautiful interface for managing your money.

## Features

### Core Features

- **Transaction Tracking**: Record income and expenses with detailed categorization
- **Smart Dashboard**: Visual analytics with charts showing spending patterns
- **Budget Management**: Set and track budgets for different categories
- **Goal Setting**: Create and monitor financial goals with progress tracking
- **Detailed Reports**: Comprehensive financial reports and insights

### User Experience

- **Modern Dark Theme**: Beautiful glass-morphism design inspired by modern UI trends
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Sync**: Firebase-powered real-time data synchronization
- **Secure Authentication**: Email/password and Google Sign-In support
- **Email Verification**: Secure account verification process

### Analytics & Insights

- **Spending by Category**: Visual breakdown with interactive pie charts
- **7-Day Spending Trend**: Track your spending patterns over time
- **Savings Rate**: Monitor your savings percentage
- **Budget Alerts**: Get notified when approaching budget limits
- **Monthly Overview**: Comprehensive monthly financial summary

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript 5 | Type-safe development |
| Vite 5 | Build tool and dev server |
| Tailwind CSS 3 | Utility-first styling |
| Recharts 2 | Data visualization |
| Firebase JS SDK 12 | Authentication & Database |

### Backend & Services

| Service | Purpose |
|---------|---------|
| Firebase Authentication | User authentication |
| Firebase Firestore | Real-time database |
| Vercel | Hosting and deployment |
| GitHub Actions | CI/CD pipeline |

### Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| PostCSS | CSS processing |
| Autoprefixer | CSS vendor prefixing |

## Project Structure

```
spendwise/
├── .github/
│   └── workflows/
│       └── vercel-deploy.yml    # CI/CD pipeline
├── components/                   # React components
│   ├── Auth.tsx                 # Authentication UI
│   ├── Dashboard.tsx            # Main dashboard
│   ├── Layout.tsx               # App layout
│   ├── Transactions.tsx         # Transaction list
│   ├── BudgetView.tsx           # Budget management
│   ├── Goals.tsx                # Financial goals
│   ├── Reports.tsx              # Analytics & reports
│   ├── Settings.tsx             # User settings
│   ├── Modal.tsx                # Reusable modal
│   ├── TransactionForm.tsx      # Add/edit transactions
│   ├── BudgetForm.tsx           # Budget creation
│   ├── GoalForm.tsx             # Goal creation
│   ├── Icons.tsx                # Icon components
│   └── ErrorBoundary.tsx        # Error handling
├── context/
│   └── AppContext.tsx           # Global state management
├── lib/
│   ├── auth.ts                  # Firebase auth functions
│   ├── firebase.ts              # Firebase configuration
│   └── supabase.ts              # Legacy (deprecated)
├── public/
│   └── logo.png                 # App logo
├── constants.ts                 # App constants & categories
├── types.ts                     # TypeScript definitions
├── App.tsx                      # Root component
├── index.tsx                    # Entry point
├── index.html                   # HTML template
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
├── .env.example                 # Environment variables template
├── DEPLOYMENT.md                # Deployment guide
├── GITHUB_SECRETS_SETUP.md      # GitHub secrets guide
└── QUICK_SETUP.md               # Quick start guide
```

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project
- Vercel account (for deployment)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/spendwise.git
   cd spendwise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google)
   - Create a Firestore database
   - Copy your configuration to `.env.local`

5. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Building for Production

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

## Deployment

### Vercel Deployment (Recommended)

The project includes automated deployment via GitHub Actions.

#### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/spendwise)

#### Manual Setup

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configure Environment Variables**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add all Firebase configuration variables

#### Automated Deployment

The project uses GitHub Actions for CI/CD:

1. **Set up GitHub Secrets**
   - `VERCEL_TOKEN`: Your Vercel token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID
   - All Firebase configuration variables

2. **Push to main branch**
   ```bash
   git push origin main
   ```

   The app will automatically deploy to Vercel.

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Database Schema

### Firestore Collections

```
users/
├── {userId}
│   ├── email
│   ├── displayName
│   ├── photoURL
│   ├── createdAt
│   └── settings
│       ├── currency
│       ├── darkMode
│       └── minimumSavingsRate

transactions/
├── {transactionId}
│   ├── userId
│   ├── type (income|expense)
│   ├── amount
│   ├── category
│   ├── description
│   ├── date
│   └── createdAt

budgets/
├── {budgetId}
│   ├── userId
│   ├── category
│   ├── limit
│   ├── period (monthly|weekly)
│   ├── startDate
│   └── endDate

goals/
├── {goalId}
│   ├── userId
│   ├── name
│   ├── targetAmount
│   ├── currentAmount
│   ├── deadline
│   ├── category
│   └── createdAt
```

## Key Features Explained

### Authentication System

- **Email/Password**: Secure authentication with email verification
- **Google Sign-In**: One-click authentication with Google
- **Password Reset**: Email-based password recovery
- **Session Management**: Persistent login with Firebase

### Transaction Management

- **Quick Add**: Fast transaction entry with smart defaults
- **Categories**: Pre-defined categories with custom icons
- **Filtering**: Filter by type, category, and date range
- **Search**: Find transactions quickly
- **Edit/Delete**: Modify or remove transactions

### Budget Tracking

- **Category Budgets**: Set limits for each spending category
- **Progress Tracking**: Visual progress bars
- **Alerts**: Warnings at 80% and 100% of budget
- **Monthly Reset**: Automatic budget period management

### Goal Setting

- **Savings Goals**: Set targets for specific purposes
- **Progress Tracking**: Monitor progress with visual indicators
- **Deadline Management**: Track time remaining
- **Contribution Tracking**: Record progress towards goals

### Reports & Analytics

- **Spending Breakdown**: Pie charts by category
- **Trend Analysis**: 7-day spending trends
- **Savings Rate**: Calculate and track savings percentage
- **Monthly Summary**: Comprehensive financial overview

## State Management

### AppContext

The app uses React Context for global state management:

| State | Purpose |
|-------|---------|
| `user` | Current authenticated user |
| `transactions` | All user transactions |
| `budgets` | Budget configurations |
| `goals` | Financial goals |
| `categories` | Spending categories |
| `currency` | User's preferred currency |
| `darkMode` | Theme preference |

## Supported Currencies

- USD ($) - US Dollar
- EUR (€) - Euro
- GBP (£) - British Pound
- INR (₹) - Indian Rupee
- JPY (¥) - Japanese Yen
- CAD (C$) - Canadian Dollar
- AUD (A$) - Australian Dollar
- CNY (¥) - Chinese Yuan

## Development Team

| Name | Role | Contact |
|------|------|---------|
| **[Your Name]** | Lead Developer | your.email@example.com |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [ ] Mobile app (React Native/Flutter)
- [ ] Recurring transactions
- [ ] Bill reminders
- [ ] Investment tracking
- [ ] Multi-currency support
- [ ] Export to CSV/PDF
- [ ] Dark/Light theme toggle
- [ ] Collaborative budgets
- [ ] AI-powered insights

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/YOUR_USERNAME/spendwise/issues) page.

## Acknowledgments

- Design inspired by modern finance apps
- Icons from Lucide React
- Charts powered by Recharts
- Authentication by Firebase

---

**Version**: 1.0.0  
**Built with**: ❤️ and React  
**Deployed on**: Vercel
