# SpendWise — Play Store release guide

This document covers how to take the existing Capacitor wrapper (which simply
loads `https://spendwisev2.vercel.app` in a WebView) and ship it to the Google
Play Store as a signed release.

The web app itself is **not modified** — the APK/AAB is just a launcher.

---

## 0. One-time prerequisites

- A Google Play Developer account ($25 one-time fee): https://play.google.com/console/signup
- The repo cloned locally
- JDK 17 (or 21) on `PATH`, `ANDROID_HOME` set
- From `web/`, a working web build (`npm ci && npm run build`)

---

## 1. Generate the upload keystore (do once, then guard with your life)

The upload keystore is the only key Google Play will accept for future updates
of `com.spendwise.app`. Lose it and you'll have to contact Play support to
reset, which takes days.

```cmd
cd web\android
generate-keystore.bat
```

You will be prompted for:

- **keystore password** — pick a strong one
- **key password** — usually the same as the keystore password
- name / org details — used in the cert subject; not user-visible

When done you'll have `web/android/app/spendwise-upload.jks`.

> **Back this file up immediately**, e.g. encrypted in a password manager
> attachment, plus a second offline copy. It is gitignored.

Create `web/android/app/keystore.properties` (also gitignored) so local builds
can sign:

```properties
storeFile=spendwise-upload.jks
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=spendwise-upload
keyPassword=YOUR_KEY_PASSWORD
```

---

## 2. First-time build locally to verify

```cmd
cd web
npm ci
npm run build
npx cap sync android
cd android
release-build.bat
```

Outputs:

- `web/android/app/build/outputs/bundle/release/app-release.aab` — upload this to Play
- `web/android/app/build/outputs/apk/release/app-release.apk` — sideload to test on a phone first

Sideload the APK on a real device and confirm the live web app loads correctly
before continuing.

---

## 3. Create the app in Play Console

1. https://play.google.com/console → **Create app**
2. App name: `SpendWise`
3. Default language: English (United States)
4. App or game: **App**
5. Free or paid: **Free**
6. Accept the declarations.

After creation, fill in the required entries from the left nav:

- **App content** → privacy policy URL, ads, content rating, target audience,
  data safety, news app, COVID-19, government
- **Main store listing** → short description, full description, app icon
  (512×512), feature graphic (1024×500), at least 2 phone screenshots
- **Pricing & distribution** → countries, free
- **App access** → if the app needs login, provide demo creds

Privacy policy is mandatory. If you don't have one yet, host a simple page on
Vercel under `/privacy` and reference it.

---

## 4. Set up Play App Signing and upload the first release

1. Left nav → **Release → Setup → App integrity → App signing**
2. Choose **Use Play App Signing** (this is the default; Google manages the
   final signing key, you keep the upload key)
3. Left nav → **Release → Testing → Internal testing → Create new release**
4. Upload `SpendWise-x.y.z.aab`
5. Add release notes
6. **Save → Review release → Start rollout to internal testing**
7. Add yourself (and any testers) as testers under the **Testers** tab and use
   the opt-in URL to install via the Play Store.

Promote internal → closed (alpha) → open (beta) → production once you're happy.
Each track promotion is a button click in Play Console — no rebuild needed.

---

## 5. Automate releases via GitHub Actions

The workflow at `.github/workflows/build-apk.yml` will, on every `v*` git tag:

1. Build the web app
2. Sync Capacitor
3. Build a signed AAB + APK
4. Attach them to a GitHub Release
5. Upload the AAB to Play Console internal track

### 5a. Required GitHub repo secrets

Go to **Settings → Secrets and variables → Actions → New repository secret**:

| Secret name                     | How to obtain                                                                     |
| ------------------------------- | --------------------------------------------------------------------------------- |
| `ANDROID_KEYSTORE_BASE64`       | `certutil -encode web\android\app\spendwise-upload.jks tmp.b64` then paste content (strip the `BEGIN/END` lines), or on macOS/Linux: `base64 -w 0 spendwise-upload.jks` |
| `ANDROID_KEYSTORE_PASSWORD`     | Keystore password from step 1                                                     |
| `ANDROID_KEY_ALIAS`             | `spendwise-upload`                                                                |
| `ANDROID_KEY_PASSWORD`          | Key password from step 1                                                          |
| `PLAY_SERVICE_ACCOUNT_JSON`     | See step 5b                                                                       |

### 5b. Create a Play Console service account

1. Play Console → **Setup → API access**
2. **Create new service account** → opens Google Cloud Console
3. In Cloud Console: pick or create a project, **Create service account**
   - Name: `play-publisher`
   - Role: skip (you'll grant in Play Console)
   - **Keys → Add key → JSON** → download the `.json`
4. Back in Play Console → **API access** → **Grant access** for the new account
   - Permissions: at minimum **Releases** for the SpendWise app, **Admin (all
     permissions)** if you also want metadata uploads
5. Paste the entire JSON file contents into the GitHub secret
   `PLAY_SERVICE_ACCOUNT_JSON`

### 5c. Cut a release

```cmd
git tag v1.0.0
git push origin v1.0.0
```

The workflow will build, attach artifacts to a GitHub Release named
`SpendWise v1.0.0`, and push the AAB to the **internal testing** track on Play.

You can also trigger manually via **Actions → Build & Release Android →
Run workflow**.

To promote from internal → production, do it from Play Console (one click) so
you can review the rollout.

---

## 6. Versioning notes

- `versionCode` (integer, must increase per upload) is set from the GitHub
  Actions run number, which always grows.
- `versionName` (user-visible) is taken from the tag, e.g. `v1.0.0` → `1.0.0`.
- For local Windows builds, `versionCode` defaults to `1` and `versionName` to
  `1.0.0`. Override via env vars before running `release-build.bat`:

  ```cmd
  set SPENDWISE_VERSION_CODE=42
  set SPENDWISE_VERSION_NAME=1.0.1
  release-build.bat
  ```

---

## 7. What about the "no changes to the web app" guarantee?

The Capacitor config (`web/capacitor.config.ts`) sets:

```ts
server: {
  url: 'https://spendwisev2.vercel.app',
  cleartext: true
}
```

This means the WebView loads your live, deployed site — exactly the same HTML,
CSS, JS, and behaviour as the browser version. No code is bundled into the APK
beyond the launcher, splash, and icons. Updates to the web app appear in the
APK immediately on next launch with no Play Store update needed.

The only Android-side touch points are:

- App icon and name (already set)
- `usesCleartextTraffic="true"` in the manifest (required for the WebView to
  load mixed content if any subresource is HTTP)
- Signing config (this PR)

---

## 8. Troubleshooting

- **"Your APK has been signed with the debug certificate"** — `keystore.properties`
  was missing or env vars weren't set. Check `app/keystore.properties` exists.
- **"Version code 1 has already been used"** — bump `SPENDWISE_VERSION_CODE`
  or push a new tag (CI uses the run number which always grows).
- **"Upload failed: APK is not signed with the upload certificate"** — the
  keystore in CI doesn't match what Play has on file. You probably regenerated
  the keystore. If you really need to rotate, request an upload key reset in
  Play Console.
- **WebView shows blank** — open Chrome on the device, visit
  `https://spendwisev2.vercel.app` directly to confirm the deploy is healthy.
