# SpendWise Expo App

Full React Native version of SpendWise extracted from the web application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on platforms:
```bash
npm run android  # Android
npm run ios      # iOS
npm run web      # Web
```

## Features

- ✅ Firebase Authentication (Email/Password)
- ✅ Real-time data sync with Firebase Realtime Database
- ✅ Dashboard with financial overview
- ✅ Transaction management
- ✅ Budget tracking
- ✅ Savings goals
- ✅ Settings & user profile
- ✅ Multi-currency support
- ✅ Dark mode UI

## Build for Production

### Android
```bash
npm run build:android
```

### iOS
```bash
npm run build:ios
```

## Project Structure

```
expo-app/
├── app/
│   ├── (auth)/          # Authentication screens
│   ├── (tabs)/          # Main app tabs
│   └── _layout.tsx      # Root layout
├── context/
│   └── AppContext.tsx   # Global state management
├── lib/
│   ├── firebase.ts      # Firebase configuration
│   └── database.ts      # Database operations
├── types/
│   └── index.ts         # TypeScript types
├── constants/
│   └── index.ts         # App constants
└── assets/              # Images and fonts
```

## Firebase Configuration

The app uses the same Firebase project as the web version:
- Project ID: spendwise-be25a
- Authentication: Email/Password
- Database: Firebase Realtime Database

## Notes

- This is a complete extraction from the web version at spendwisev2.vercel.app
- All core functionality has been converted to React Native
- Uses Expo Router for navigation
- Fully typed with TypeScript
