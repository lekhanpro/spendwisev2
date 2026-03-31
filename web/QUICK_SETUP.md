# Quick Setup Script for GitHub Secrets

This guide will help you quickly get all the values needed for GitHub Secrets.

## Step 1: Get Vercel Credentials

### Option A: Using Vercel CLI (Recommended)

1. **Open a NEW PowerShell/Terminal window** (to refresh PATH)

2. **Login to Vercel:**
   ```bash
   vercel login
   ```
   Follow the prompts to authenticate.

3. **Link your project:**
   ```bash
   cd "c:\Users\lekhan hr\Downloads\spendwisev4-main\spendwisev4-main"
   vercel link
   ```
   - Select your existing project when prompted
   - Choose the "spendwisev2" project

4. **Get your credentials:**
   ```bash
   cat .vercel/project.json
   ```
   
   Copy the `orgId` and `projectId` values.

5. **Get Vercel Token:**
   - Go to: https://vercel.com/account/tokens
   - Click "Create Token"
   - Name it: "GitHub Actions"
   - Copy the token immediately (you won't see it again!)

### Option B: Get from Vercel Dashboard (Alternative)

1. **Get Project ID:**
   - Go to your Vercel dashboard
   - Open your project settings
   - Project ID is in the URL or settings page

2. **Get Org ID:**
   - Go to your team/account settings
   - Find your organization ID

3. **Get Token:**
   - https://vercel.com/account/tokens
   - Create new token

## Step 2: Add All Secrets to GitHub

Go to: **https://github.com/YOUR_USERNAME/spendwisev2/settings/secrets/actions**

Click "New repository secret" for each of these:

### Vercel Secrets

| Secret Name | Value |
|------------|-------|
| `VERCEL_TOKEN` | [Your token from vercel.com/account/tokens] |
| `VERCEL_ORG_ID` | [From .vercel/project.json or dashboard] |
| `VERCEL_PROJECT_ID` | [From .vercel/project.json or dashboard] |

### Firebase Secrets (Copy these exactly)

| Secret Name | Value |
|------------|-------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyCtQkTfAaPNNHoc4vdn0DDYg9or7QiUTgM` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `spendwise-be25a.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `spendwise-be25a` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `spendwise-be25a.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `587962306992` |
| `VITE_FIREBASE_APP_ID` | `1:587962306992:web:abd7374fdab20b485b4675` |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-6CTB1CDSW8` |

## Step 3: Configure Firebase (5 minutes)

### Enable Email Authentication
1. Go to: https://console.firebase.google.com/project/spendwise-be25a/authentication/providers
2. Click "Email/Password"
3. Toggle "Enable"
4. Click "Save"

### Add Authorized Domain
1. Go to: https://console.firebase.google.com/project/spendwise-be25a/authentication/settings
2. Scroll to "Authorized domains"
3. Click "Add domain"
4. Add your Vercel domain (e.g., `your-app.vercel.app`)
5. You can find your Vercel domain in your Vercel dashboard

### Customize Email Templates (Optional but Recommended)
1. Go to: https://console.firebase.google.com/project/spendwise-be25a/authentication/templates
2. Customize:
   - Email verification template
   - Password reset template

## Step 4: Deploy to GitHub

```bash
# Make sure you're in the project directory
cd "c:\Users\lekhan hr\Downloads\spendwisev4-main\spendwisev4-main"

# Add all files
git add .

# Commit
git commit -m "Add GitHub Actions workflow for Vercel deployment"

# Push to GitHub (this will trigger the deployment)
git push origin main
```

## Step 5: Monitor Deployment

1. **GitHub Actions:**
   - Go to your repository
   - Click "Actions" tab
   - Watch the workflow run

2. **Vercel Dashboard:**
   - Check your Vercel dashboard for deployment status
   - Get your live URL

## Verification Checklist

- [ ] Vercel CLI installed (`vercel --version` works)
- [ ] Logged into Vercel (`vercel whoami` shows your account)
- [ ] Project linked (`.vercel/project.json` exists)
- [ ] All 10 GitHub Secrets added
- [ ] Firebase Email/Password authentication enabled
- [ ] Vercel domain added to Firebase authorized domains
- [ ] Code pushed to GitHub
- [ ] GitHub Action running successfully
- [ ] App deployed and accessible on Vercel

## Troubleshooting

### "vercel command not found" after installation
- Close and reopen your terminal/PowerShell
- Or restart VS Code
- The PATH needs to be refreshed

### Can't find Vercel project
- Make sure you're logged into the correct Vercel account
- Check that the project exists in your Vercel dashboard
- You may need to create a new project on Vercel first

### GitHub Action fails
- Check the Actions tab for detailed error logs
- Verify all secrets are spelled correctly (case-sensitive!)
- Ensure no extra spaces in secret values

### Firebase not working in production
- Verify Vercel domain is in Firebase authorized domains
- Check browser console for specific errors
- Ensure all Firebase secrets are set correctly

## Quick Links

- **GitHub Secrets:** https://github.com/YOUR_USERNAME/spendwisev2/settings/secrets/actions
- **Vercel Tokens:** https://vercel.com/account/tokens
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Firebase Console:** https://console.firebase.google.com/project/spendwise-be25a
- **Firebase Auth Providers:** https://console.firebase.google.com/project/spendwise-be25a/authentication/providers
- **Firebase Auth Settings:** https://console.firebase.google.com/project/spendwise-be25a/authentication/settings

---

**Estimated Time:** 10-15 minutes total

**Need Help?** Check DEPLOYMENT.md for more detailed explanations.
