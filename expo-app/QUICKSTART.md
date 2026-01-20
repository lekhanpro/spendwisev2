# SpendWise Expo - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- Expo CLI (will be installed automatically)
- For iOS: Xcode and CocoaPods
- For Android: Android Studio

### Installation

1. **Navigate to the expo-app directory:**
```bash
cd expo-app
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm start
```

4. **Run on your device:**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Press `w` for web browser

## 📱 Testing the App

### Test Account
You can create a new account or use:
- Email: test@spendwise.com
- Password: test123456

**Note:** You'll need to verify your email after signing up.

## 🏗️ Building for Production

### Android APK
```bash
npm run build:android
```

### iOS IPA
```bash
npm run build:ios
```

## 🔧 Configuration

### Firebase Setup
The app is pre-configured with the SpendWise Firebase project. If you want to use your own:

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Email/Password authentication
3. Create a Realtime Database
4. Update `lib/firebase.ts` with your config

### App Icons
Place your app icons in `assets/images/`:
- `icon.png` - 1024x1024 app icon
- `adaptive-icon.png` - 1024x1024 Android adaptive icon
- `splash-icon.png` - Splash screen image
- `favicon.png` - 48x48 web favicon

## 📂 Project Structure

```
expo-app/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Login/signup screens
│   ├── (tabs)/            # Main app tabs
│   └── _layout.tsx        # Root layout
├── context/               # React Context
│   └── AppContext.tsx     # Global state
├── lib/                   # Utilities
│   ├── firebase.ts        # Firebase config
│   └── database.ts        # DB operations
├── types/                 # TypeScript types
├── constants/             # App constants
└── assets/                # Images & fonts
```

## 🎨 Features Included

✅ Firebase Authentication
✅ Real-time data synchronization
✅ Dashboard with financial overview
✅ Transaction management
✅ Budget tracking
✅ Savings goals
✅ Multi-currency support
✅ Dark mode UI
✅ Responsive design

## 🐛 Troubleshooting

### Metro bundler issues
```bash
npm start -- --clear
```

### iOS build issues
```bash
cd ios && pod install && cd ..
```

### Android build issues
```bash
cd android && ./gradlew clean && cd ..
```

## 📚 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Expo Router](https://expo.github.io/router/docs/)

## 🤝 Support

For issues or questions:
1. Check the README.md
2. Review Firebase console for auth/database issues
3. Check Expo documentation

## 📄 License

Apache 2.0 - Same as the original SpendWise project
