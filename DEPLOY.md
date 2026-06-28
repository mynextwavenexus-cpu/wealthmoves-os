# WealthMoves OS - Deployment Instructions

## Changes Made
- **Removed hard-coded user info** from `src/components/top-bar.tsx`
  - Removed "Emma Jackson" (Member Name)
  - Removed "Founder Member" text
  - Changed avatar from "EJ" initials to a User icon

## Code Status
✅ Code updated locally
✅ Committed to git
✅ Pushed to GitHub: https://github.com/mynextwavenexus-cpu/wealthmoves-os

## To Deploy to Vercel

### Option 1: Link GitHub Repo (Recommended - Automatic deployments)
1. Go to https://vercel.com/dashboard
2. Find your "wealthmoves-os" project (or search for it)
3. Click on the project
4. Go to **Settings** → **Git**
5. Click **Connect Git Repository**
6. Select **GitHub**
7. Choose: `mynextwavenexus-cpu/wealthmoves-os`
8. Select branch: `master`
9. Click **Connect**

Vercel will automatically deploy and all future pushes to `master` will auto-deploy.

### Option 2: Manual Deploy via CLI
1. Get a new Vercel token:
   - Go to https://vercel.com/account/tokens
   - Click "Create Token"
   - Copy the token
   
2. Run deployment:
```bash
cd /root/.openclaw/workspace/wealthmoves-os
VERCEL_TOKEN=your_new_token_here vercel --prod --yes
```

### Option 3: Manual Redeploy (Quick fix)
1. Go to https://vercel.com/dashboard
2. Find "wealthmoves-os" project
3. Click **Deployments** tab
4. Find the latest deployment
5. Click the **...** menu
6. Click **Redeploy**
7. Check "Use existing build cache" for faster deploy
8. Click **Redeploy**

Note: This won't pull new code unless GitHub is linked first.

## Verification
After deployment, visit: https://wealthmoves-os.vercel.app/

The top right should now show only the avatar icon without "Emma Jackson" or "Founder Member" text.

## Repository Info
- GitHub: https://github.com/mynextwavenexus-cpu/wealthmoves-os
- Vercel Project ID: `prj_9arsRARNNOgxxaYuy0rh3ekAWl0J`
- Latest Commit: "Remove hard-coded Member Name and Founder Member from top bar"
