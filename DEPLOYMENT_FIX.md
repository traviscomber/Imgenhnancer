# Deployment Fix Guide

## Issue
Vercel detected `pnpm-lock.yaml` but tried to run `npm install`, causing a conflict.

## Solution Steps

### 1. Clean Up Lock Files Locally
\`\`\`bash
# Remove conflicting lock files
rm -f pnpm-lock.yaml yarn.lock bun.lockb

# Keep only npm
rm -rf node_modules
npm install

# This creates/updates package-lock.json
\`\`\`

### 2. Commit Changes
\`\`\`bash
git add .
git commit -m "fix: remove pnpm lock file, use npm only"
git push origin main
\`\`\`

### 3. Vercel Will Auto-Deploy
Vercel will detect the push and automatically deploy with the correct configuration.

## Verification

After deployment:
1. Check Vercel build logs - should show "Running 'npm install'"
2. Visit your site URL
3. Test the /enhance page
4. Upload an image and test enhancement

## If Still Failing

### Option A: Manual Vercel Settings
1. Go to Vercel Dashboard → Your Project
2. Settings → General
3. Build & Development Settings
4. Install Command: `npm install`
5. Build Command: `npm run build`
6. Save and redeploy

### Option B: Fresh Deployment
1. Delete the project from Vercel
2. Re-import from GitHub
3. Add environment variable: `REPLICATE_API_TOKEN`
4. Deploy

## What Changed
- ✅ Added `vercel.json` with explicit npm commands
- ✅ Added `packageManager: "npm@10.8.2"` to package.json
- ✅ Updated `.gitignore` to exclude other lock files
- ✅ Removed unnecessary dependencies (path, buffer)
