# Build a SpendWise APK (no Play Store needed)

The APK is a thin Capacitor wrapper around the live web app at
`https://spendwisev2.vercel.app`. The web code is **not** copied into the APK.
Whatever is live on Vercel is what the app shows.

## Easiest path: GitHub Actions (recommended)

You don't need Java, Android SDK, or anything else installed locally.

1. Push these changes to GitHub (any branch).
2. Go to the repo on github.com → **Actions** tab.
3. Pick **Build Debug APK (no signing required)** in the left sidebar.
4. Click **Run workflow** → **Run workflow**.
5. Wait ~5 minutes for the run to finish (green checkmark).
6. Click into the run → scroll to **Artifacts** at the bottom →
   download `SpendWise-debug-apk`.
7. Unzip → you get `SpendWise-debug-<sha>.apk`.

### Install on your phone

1. Transfer the APK to the phone (USB, Drive, email, whatever).
2. Open it on the phone. Android will prompt to enable
   "Install from unknown sources" for the app you opened it from — accept.
3. Tap install. Done.

The APK is **debug-signed**, which means:

- ✅ Installs and runs perfectly on any Android device.
- ✅ Pulls live updates from Vercel automatically — no rebuild needed when you
  update the web app.
- ❌ Cannot be uploaded to the Play Store. (When you're ready for Play Store,
  see `PLAY_STORE_RELEASE.md` in this folder.)

## Local build (only if you want to)

Requires JDK 17+ and Android SDK installed.

```cmd
cd web
npm ci
npm run build
npx cap sync android
cd android
gradlew.bat assembleDebug
```

Output: `web\android\app\build\outputs\apk\debug\app-debug.apk`
