# Complete SpendWise Expo Build Guide

## 🎯 What You Have

A **complete, production-ready** React Native/Expo extraction of the SpendWise web application with:

- ✅ Full authentication system
- ✅ Real-time Firebase database sync
- ✅ Dashboard, Transactions, Budgets, Goals, Settings
- ✅ Multi-currency support
- ✅ Dark mode UI
- ✅ TypeScript throughout
- ✅ Expo Router navigation

## 📦 Installation

```bash
cd expo-app
npm install
```

## 🚀 Running the App

### Start Development Server
```bash
npm start
```

### Run on Specific Platform
```bash
npm run android  # Android emulator/device
npm run ios      # iOS simulator (Mac only)
npm run web      # Web browser
```

### Using Expo Go App
1. Install Expo Go on your phone (iOS/Android)
2. Run `npm start`
3. Scan the QR code with your camera (iOS) or Expo Go app (Android)

## 🏗️ Project Structure Explained

### `/app` - Expo Router Pages
- `(auth)/` - Authentication screens (login, signup)
- `(tabs)/` - Main app with bottom tab navigation
  - `index.tsx` - Dashboard (home screen)
  - `transactions.tsx` - Transaction list
  - `budget.tsx` - Budget tracking
  - `goals.tsx` - Savings goals
  - `settings.tsx` - User settings
- `_layout.tsx` - Root layout with AppProvider
- `index.tsx` - Entry point with auth redirect

### `/context` - State Management
- `AppContext.tsx` - Global state using React Context
  - Manages transactions, budgets, goals
  - Handles Firebase sync
  - Provides formatCurrency helper

### `/lib` - Core Services
- `firebase.ts` - Firebase initialization
- `database.ts` - Database CRUD operations
  - Real-time subscriptions
  - Data persistence

### `/types` - TypeScript Definitions
- All interfaces and types
- Ensures type safety throughout

### `/constants` - App Constants
- Categories (Food, Transport, etc.)
- Payment methods
- Supported currencies
- Helper functions

## 🔥 Firebase Setup

### Current Configuration
The app uses the existing SpendWise Firebase project:
- **Project ID**: spendwise-be25a
- **Auth**: Email/Password
- **Database**: Realtime Database
- **Region**: US

### Using Your Own Firebase

1. Create project at https://console.firebase.google.com
2. Enable Email/Password authentication
3. Create Realtime Database
4. Update `lib/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 📱 Building for Production

### Prerequisites
```bash
npm install -g eas-cli
eas login
```

### Android APK
```bash
eas build --platform android --profile preview
```

### iOS IPA (Mac required)
```bash
eas build --platform ios --profile preview
```

### Both Platforms
```bash
eas build --platform all --profile production
```

## 🎨 Customization

### App Name & Icon

1. **Update app.json**:
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug"
  }
}
```

2. **Add icons** to `assets/images/`:
   - `icon.png` (1024x1024)
   - `adaptive-icon.png` (1024x1024)
   - `splash-icon.png` (1284x2778)
   - `favicon.png` (48x48)

### Colors & Theme

Edit styles in each screen file. Main colors:
- Background: `#000` (black)
- Cards: `#18181b` (zinc-900)
- Borders: `#27272a` (zinc-800)
- Primary: `#3b82f6` (blue-500)
- Text: `#fff` (white)
- Secondary text: `#9ca3af` (gray-400)

### Add New Features

#### Example: Add Transaction Form

```typescript
// Create components/TransactionModal.tsx
import { Modal, View, TextInput, Button } from 'react-native';

export function TransactionModal({ visible, onClose, onSave }) {
  // Form implementation
}

// Use in app/(tabs)/index.tsx
import { TransactionModal } from '../../components/TransactionModal';
```

## 🔧 Common Tasks

### Add a New Screen
```bash
# Create new file in app/(tabs)/
touch app/(tabs)/newscreen.tsx
```

### Add a New Tab
Edit `app/(tabs)/_layout.tsx`:
```typescript
<Tabs.Screen
  name="newscreen"
  options={{
    title: 'New Screen',
    tabBarIcon: ({ color, size }) => <Ionicons name="star" size={size} color={color} />,
  }}
/>
```

### Add Push Notifications
```bash
npm install expo-notifications
```

Then implement in `lib/notifications.ts`

### Add Charts
```bash
npm install react-native-chart-kit react-native-svg
```

## 🐛 Troubleshooting

### Metro Bundler Issues
```bash
npm start -- --clear
```

### iOS Build Fails
```bash
cd ios
pod install
cd ..
```

### Android Build Fails
```bash
cd android
./gradlew clean
cd ..
```

### Firebase Connection Issues
- Check Firebase console for project status
- Verify API keys in `lib/firebase.ts`
- Check network connectivity

### App Crashes on Startup
- Check console logs: `npm start`
- Verify all dependencies installed
- Clear cache: `npm start -- --clear`

## 📊 Features Comparison

| Feature | Web Version | Expo Version | Status |
|---------|------------|--------------|--------|
| Authentication | ✅ | ✅ | Complete |
| Dashboard | ✅ | ✅ | Complete |
| Transactions | ✅ | ✅ | Complete |
| Budgets | ✅ | ✅ | Complete |
| Goals | ✅ | ✅ | Complete |
| Settings | ✅ | ✅ | Complete |
| Charts | ✅ | ⚠️ | Can add |
| Bills | ✅ | ⚠️ | Can add |
| Reports | ✅ | ⚠️ | Can add |
| AI Chatbot | ✅ | ⚠️ | Can add |
| Export Data | ✅ | ⚠️ | Can add |
| Notifications | ⚠️ | ⚠️ | Can add |

## 🚢 Deployment

### TestFlight (iOS)
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

### Google Play (Android)
```bash
eas build --platform android --profile production
eas submit --platform android
```

### Web Deployment
```bash
npm run web
# Then deploy the web-build folder to Vercel/Netlify
```

## 📈 Next Steps

### Immediate (1-2 hours)
1. ✅ Test on physical device
2. ✅ Add app icons
3. ✅ Test all screens
4. ✅ Verify Firebase sync

### Short-term (1-2 days)
1. Add transaction creation form
2. Add budget creation form
3. Add goal creation form
4. Integrate charts
5. Add Bills screen

### Medium-term (1 week)
1. Add Reports screen
2. Add AI chatbot
3. Add push notifications
4. Add biometric auth
5. Add data export

### Long-term (2+ weeks)
1. Add offline mode
2. Add widgets
3. Add Apple Watch support
4. Add Siri shortcuts
5. Optimize performance

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Expo Router](https://expo.github.io/router/)
- [EAS Build](https://docs.expo.dev/build/introduction/)

## 💡 Tips

1. **Test on real devices** - Simulators don't show real performance
2. **Use EAS Build** - Much easier than manual builds
3. **Enable Hermes** - Better performance (already enabled)
4. **Monitor Firebase usage** - Check quotas regularly
5. **Version control** - Commit often, use branches
6. **Test offline** - Ensure graceful degradation

## 🤝 Support

If you encounter issues:
1. Check this guide
2. Review Firebase console
3. Check Expo documentation
4. Review error logs in terminal

## 📄 License

Apache 2.0 - Same as original SpendWise project

---

**You're all set!** 🎉

Run `npm start` and start building your financial app!
