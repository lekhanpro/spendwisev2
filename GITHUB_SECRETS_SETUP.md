# GitHub Secrets Setup Guide

Follow these steps to add the required secrets to your GitHub repository for automated Vercel deployment.

## Step 1: Navigate to GitHub Secrets

1. Go to your repository: `https://github.com/YOUR_USERNAME/spendwisev2`
2. Click **Settings** (top menu)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret** button

## Step 2: Add Vercel Secrets

You need to add three Vercel-related secrets. Here's how to get them:

### Get Vercel Token

1. Go to https://vercel.com/account/tokens
2. Click **Create Token**
3. Name it: `GitHub Actions`
4. Copy the token (you'll only see it once!)

**Add to GitHub:**
- **Name**: `VERCEL_TOKEN`
- **Value**: `[paste your token here]`

### Get Vercel Organization ID and Project ID

Run these commands in your project directory:

```bash
# Install Vercel CLI if you haven't already
npm install --global vercel@latest

# Login to Vercel
vercel login

# Link your project
vercel link

# View your project configuration
cat .vercel/project.json
```

The output will show:
```json
{
  "orgId": "team_xxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxx"
}
```

**Add to GitHub:**
- **Name**: `VERCEL_ORG_ID`
- **Value**: `[your orgId from above]`

- **Name**: `VERCEL_PROJECT_ID`
- **Value**: `[your projectId from above]`

## Step 3: Add Firebase Secrets

Add these Firebase configuration secrets (copy the values exactly as shown):

### VITE_FIREBASE_API_KEY
- **Name**: `VITE_FIREBASE_API_KEY`
- **Value**: `AIzaSyCtQkTfAaPNNHoc4vdn0DDYg9or7QiUTgM`

### VITE_FIREBASE_AUTH_DOMAIN
- **Name**: `VITE_FIREBASE_AUTH_DOMAIN`
- **Value**: `spendwise-be25a.firebaseapp.com`

### VITE_FIREBASE_PROJECT_ID
- **Name**: `VITE_FIREBASE_PROJECT_ID`
- **Value**: `spendwise-be25a`

### VITE_FIREBASE_STORAGE_BUCKET
- **Name**: `VITE_FIREBASE_STORAGE_BUCKET`
- **Value**: `spendwise-be25a.firebasestorage.app`

### VITE_FIREBASE_MESSAGING_SENDER_ID
- **Name**: `VITE_FIREBASE_MESSAGING_SENDER_ID`
- **Value**: `587962306992`

### VITE_FIREBASE_APP_ID
- **Name**: `VITE_FIREBASE_APP_ID`
- **Value**: `1:587962306992:web:abd7374fdab20b485b4675`

### VITE_FIREBASE_MEASUREMENT_ID (Optional - for Analytics)
- **Name**: `VITE_FIREBASE_MEASUREMENT_ID`
- **Value**: `G-6CTB1CDSW8`

## Step 4: Verify All Secrets Are Added

Your GitHub Secrets page should show these 10 secrets:
- ✅ `VERCEL_TOKEN`
- ✅ `VERCEL_ORG_ID`
- ✅ `VERCEL_PROJECT_ID`
- ✅ `VITE_FIREBASE_API_KEY`
- ✅ `VITE_FIREBASE_AUTH_DOMAIN`
- ✅ `VITE_FIREBASE_PROJECT_ID`
- ✅ `VITE_FIREBASE_STORAGE_BUCKET`
- ✅ `VITE_FIREBASE_MESSAGING_SENDER_ID`
- ✅ `VITE_FIREBASE_APP_ID`
- ✅ `VITE_FIREBASE_MEASUREMENT_ID`

## Step 5: Configure Firebase Authentication

1. **Enable Email/Password Authentication**
   - Go to: https://console.firebase.google.com/project/spendwise-be25a/authentication/providers
   - Click on **Email/Password**
   - Enable it and save

2. **Configure Email Templates**
   - Go to: https://console.firebase.google.com/project/spendwise-be25a/authentication/templates
   - Customize templates for:
     - Email verification
     - Password reset
     - Email address change

3. **Add Authorized Domains**
   - Go to: https://console.firebase.google.com/project/spendwise-be25a/authentication/settings
   - Scroll to **Authorized domains**
   - Add your Vercel domain (e.g., `your-app.vercel.app`)
   - Add any custom domains you're using

## Step 6: Test the Deployment

Once all secrets are added:

```bash
# Commit and push your changes
git add .
git commit -m "Add GitHub Actions workflow for Vercel deployment"
git push origin main
```

The GitHub Action will automatically:
1. Build your project with Firebase configuration
2. Deploy to Vercel
3. Make it live!

## Monitoring

- **GitHub Actions**: Check the **Actions** tab in your repository
- **Vercel Dashboard**: Check your Vercel project dashboard
- **Deployment URL**: Find it in Vercel dashboard or GitHub Actions logs

## Troubleshooting

### If deployment fails:
1. Check the Actions tab for error logs
2. Verify all secrets are spelled correctly (case-sensitive!)
3. Ensure Vercel project is properly linked
4. Check that Firebase configuration is correct

### If Firebase doesn't work in production:
1. Verify authorized domains include your Vercel URL
2. Check browser console for errors
3. Ensure all environment variables are set
4. Test email verification and password reset features

## Quick Reference

**GitHub Repository Settings URL:**
```
https://github.com/YOUR_USERNAME/spendwisev2/settings/secrets/actions
```

**Firebase Console:**
```
https://console.firebase.google.com/project/spendwise-be25a
```

**Vercel Dashboard:**
```
https://vercel.com/dashboard
```
