# Deployment Guide - SpendWise

This guide explains how to deploy the SpendWise app to Vercel using GitHub Actions.

## Overview

The app is automatically deployed to Vercel whenever you push to the `main` branch. Pull requests create preview deployments for testing before merging.

## Prerequisites

- GitHub repository: `spendwisev2`
- Vercel account with the project already set up
- Firebase project configured for authentication

## Setup Instructions

### 1. Get Vercel Credentials

You need three values from Vercel:

#### Get Vercel Token
1. Go to https://vercel.com/account/tokens
2. Create a new token (name it "GitHub Actions")
3. Copy the token (you'll only see it once)

#### Get Organization ID and Project ID
Run these commands in your project directory:
```bash
npm install --global vercel@latest
vercel login
vercel link
```

After linking, run:
```bash
cat .vercel/project.json
```

You'll see:
```json
{
  "orgId": "your_org_id_here",
  "projectId": "your_project_id_here"
}
```

### 2. Configure GitHub Secrets

Go to your GitHub repository: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

Add these secrets:

#### Vercel Secrets
- `VERCEL_TOKEN` - Your Vercel token from step 1
- `VERCEL_ORG_ID` - Your organization ID
- `VERCEL_PROJECT_ID` - Your project ID

#### Firebase Secrets
Get these from Firebase Console → Project Settings → General → Your apps:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### 3. Configure Firebase Authentication

#### Enable Email/Password Authentication
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable "Email/Password" provider
3. Enable "Email link (passwordless sign-in)" if needed

#### Configure Email Templates
1. Go to Authentication → Templates
2. Customize these templates:
   - **Email verification** - Sent when users sign up
   - **Password reset** - Sent when users request password reset
   - **Email address change** - Sent when users change email

#### Add Authorized Domains
1. Go to Authentication → Settings → Authorized domains
2. Add your Vercel domain (e.g., `your-app.vercel.app`)
3. Add any custom domains you're using

### 4. Deploy

Once secrets are configured, deployment is automatic:

- **Production**: Push to `main` branch
  ```bash
  git add .
  git commit -m "Your commit message"
  git push origin main
  ```

- **Preview**: Create a pull request
  - Preview deployments are created automatically
  - Test changes before merging to main

### 5. Monitor Deployment

1. Go to your GitHub repository
2. Click the "Actions" tab
3. Watch the workflow progress
4. Once complete, visit your Vercel dashboard for the deployment URL

## Workflow Details

The GitHub Actions workflow (`.github/workflows/vercel-deploy.yml`) does the following:

1. **Checkout code** - Gets the latest code from your repository
2. **Setup Node.js** - Installs Node.js v20
3. **Install dependencies** - Runs `npm ci` for clean install
4. **Build project** - Runs `npm run build` with Firebase env vars
5. **Deploy to Vercel** - Uses Vercel CLI to deploy
   - Production deployment for `main` branch
   - Preview deployment for pull requests

## Environment Variables in Vercel

The workflow passes Firebase environment variables during build. You can also set them directly in Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the same Firebase variables
3. Set them for "Production", "Preview", and "Development" environments

## Testing Firebase Features

After deployment, test these features:

### Email Verification
1. Sign up with a new email
2. Check for verification email
3. Click the verification link
4. Confirm account is verified

### Password Reset
1. Click "Forgot Password"
2. Enter your email
3. Check for reset email
4. Click the reset link
5. Set a new password
6. Confirm you can log in with new password

## Troubleshooting

### Build Fails
- Check that all GitHub Secrets are set correctly
- Verify Firebase configuration values
- Check the Actions tab for detailed error logs

### Firebase Not Working in Production
- Verify authorized domains include your Vercel domain
- Check that environment variables are set in Vercel dashboard
- Ensure Firebase API key is not restricted to specific domains

### Deployment Succeeds but App Doesn't Load
- Check browser console for errors
- Verify all environment variables are prefixed with `VITE_`
- Ensure `.env.example` matches your actual `.env.local`

### Email Verification/Reset Not Sending
- Check Firebase Console → Authentication → Templates
- Verify email templates are enabled
- Check spam folder
- Ensure Firebase project has email sending enabled

## Manual Deployment

If you need to deploy manually:

```bash
# Install Vercel CLI
npm install --global vercel@latest

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
