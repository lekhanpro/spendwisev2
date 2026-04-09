# Vercel Deployment Guide for SpendWise v2

## Issue: Path Configuration Error

The Vercel project is currently configured to look for `web/web` instead of just `web`. This needs to be fixed in the Vercel dashboard.

## Solution: Fix Vercel Project Settings

### Option 1: Update via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/lekhan-hrs-projects/spendwisev2/settings

2. **Update Root Directory:**
   - Navigate to: Settings → General → Root Directory
   - Change from: `web` (or `web/web`)
   - Change to: `.` (dot - means root of repository)
   - Click "Save"

3. **Update Build Settings:**
   - Navigate to: Settings → Build & Development Settings
   - Framework Preset: `Vite`
   - Build Command: `cd web && npm install && npm run build`
   - Output Directory: `web/dist`
   - Install Command: `npm install`

4. **Redeploy:**
   ```bash
   cd web
   npx vercel --prod
   ```

### Option 2: Deploy from Repository Root

Since the Vercel project expects the root directory, deploy from the repository root:

```bash
# From repository root (spendwisev2-main)
npx vercel --prod
```

### Option 3: Create New Vercel Project

If the above doesn't work, create a fresh Vercel project:

1. **Remove existing Vercel configuration:**
   ```bash
   cd web
   rm -rf .vercel
   ```

2. **Initialize new Vercel project:**
   ```bash
   npx vercel
   ```

3. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N`
   - Project name: `spendwisev2`
   - In which directory is your code located? `./`
   - Want to override settings? `Y`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Development Command: `npm run dev`

4. **Deploy to production:**
   ```bash
   npx vercel --prod
   ```

## Alternative: Deploy via GitHub Integration

### Setup Automatic Deployments

1. **Connect GitHub to Vercel:**
   - Go to: https://vercel.com/new
   - Click "Import Git Repository"
   - Select: `lekhanpro/spendwisev2`

2. **Configure Project:**
   - Framework Preset: `Vite`
   - Root Directory: `web`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables (if needed):**
   - Add any required environment variables
   - Click "Deploy"

4. **Automatic Deployments:**
   - Every push to `main` branch will auto-deploy
   - Pull requests will get preview deployments

## Manual Deployment Steps

If CLI doesn't work, use the Vercel dashboard:

1. **Build locally:**
   ```bash
   cd web
   npm install
   npm run build
   ```

2. **Upload to Vercel:**
   - Go to: https://vercel.com/lekhan-hrs-projects/spendwisev2
   - Click "Deployments" tab
   - Click "Deploy" button
   - Upload the `web/dist` folder

## Verify Deployment

After successful deployment:

1. **Check the deployment URL:**
   - Should be: https://spendwisev2.vercel.app (or similar)

2. **Test all features:**
   - [ ] Navigate to Invest tab
   - [ ] Test Schemes & Plans
   - [ ] Test Stock Suggester
   - [ ] Test Learning Dashboard
   - [ ] Test Notifications
   - [ ] Test on mobile
   - [ ] Test dark mode

3. **Check console for errors:**
   - Open DevTools → Console
   - Should have no errors

## Troubleshooting

### Error: "The provided path does not exist"
**Solution:** Update Root Directory in Vercel settings to `.` or remove it entirely.

### Error: "Build failed"
**Solution:** 
```bash
cd web
npm install
npm run build
```
Check for any build errors locally first.

### Error: "Module not found"
**Solution:** Ensure all dependencies are in `package.json`:
```bash
cd web
npm install recharts
npm install
```

### Error: "Firebase configuration missing"
**Solution:** Add Firebase environment variables in Vercel:
- Go to: Settings → Environment Variables
- Add your Firebase config variables

## Current Deployment Status

✅ Code pushed to GitHub: https://github.com/lekhanpro/spendwisev2
⏳ Vercel deployment: Pending configuration fix

## Quick Deploy Commands

### From web directory:
```bash
cd web
npm install
npm run build
npx vercel --prod
```

### From repository root:
```bash
npx vercel --prod
```

### Using deployment script:
```bash
cd web
./deploy.sh    # Linux/Mac
deploy.bat     # Windows
```

## Support

If deployment issues persist:
1. Check Vercel logs: https://vercel.com/lekhan-hrs-projects/spendwisev2/deployments
2. Review build logs for errors
3. Verify all environment variables are set
4. Contact Vercel support if needed

---

**Last Updated:** April 7, 2026
**Status:** Configuration fix required in Vercel dashboard
