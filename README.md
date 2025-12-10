# SpendWise Native

A fully native Android app for smart money management, built with React Native (Expo).

## 📱 Features

- 💰 **Track Transactions** - Record income and expenses with categories
- 📊 **Budget Management** - Set budgets and track spending
- 🎯 **Savings Goals** - Create and track financial goals
- 📈 **Reports & Charts** - Visualize your spending patterns
- 🔐 **Secure Auth** - Firebase authentication
- ☁️ **Cloud Sync** - Data synced across devices in real-time

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)

### Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android
```

### Build APK

```bash
# Configure EAS (first time only)
eas build:configure

# Build preview APK
eas build --platform android --profile preview
```

## 📁 Project Structure

```
spendwise-native/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Login/Register screens
│   ├── (tabs)/            # Main tab screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
├── context/               # React Context (AppContext)
├── lib/                   # Firebase, database helpers
├── types/                 # TypeScript types
├── constants/             # App constants, theme colors
└── assets/               # Images, fonts
```

## 🔧 Configuration

1. Update Firebase config in `lib/firebase.ts`
2. Update `app.json` with your Expo project ID
3. Set up EAS: `eas build:configure`

## 📄 License

Apache 2.0
