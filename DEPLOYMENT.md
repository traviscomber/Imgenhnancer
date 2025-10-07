# Deployment Guide - AI Image Enhancer

Complete step-by-step guide to deploy your AI Image Enhancer to Vercel.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- ✅ GitHub account
- ✅ Vercel account (sign up at [vercel.com](https://vercel.com))
- ✅ Replicate API key ([replicate.com/account/api-tokens](https://replicate.com/account/api-tokens))
- ✅ All code committed to a GitHub repository

---

## 🚀 Step 1: Push Code to GitHub

### Option A: New Repository

\`\`\`bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: AI Image Enhancer"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/ai-image-enhancer.git
git branch -M main
git push -u origin main
\`\`\`

### Option B: Existing Repository

\`\`\`bash
# Add all changes
git add .

# Commit with deployment message
git commit -m "feat: complete AI enhancement system with smart recommendations"

# Push to main branch
git push origin main
\`\`\`

---

## 🔧 Step 2: Get Your Replicate API Key

1. Go to [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
2. Sign in or create an account
3. Click **"Create token"**
4. Copy your API token (starts with `r8_`)
5. **Save it securely** - you'll need it in the next step

**Example:** `r8_ABC123def456GHI789jkl012MNO345pqr678STU`

---

## ☁️ Step 3: Deploy to Vercel

### Quick Start

### Step 1: Get Replicate API Key

1. Go to https://replicate.com/account/api-tokens
2. Sign up or log in
3. Click "Create token"
4. Copy your API token (starts with `r8_...`)

### Step 2: Deploy to Vercel

#### Option A: Deploy Button (Easiest)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ai-image-enhancer)

1. Click the button above
2. Import your repository
3. Add environment variable:
   - **Name**: `REPLICATE_API_TOKEN`
   - **Value**: Your Replicate API token from Step 1
4. Click "Deploy"

#### Option B: Vercel Dashboard

1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. **Before deploying**, add environment variable:
   - Go to "Environment Variables" section
   - Add: `REPLICATE_API_TOKEN` = `your_token_here`
5. Click "Deploy"

#### Option C: Vercel CLI

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (will prompt for env vars)
vercel

# Add environment variable
vercel env add REPLICATE_API_TOKEN

# Production deployment
vercel --prod
\`\`\`

### Method 1: Vercel Dashboard (Recommended)

1. **Go to [vercel.com/new](https://vercel.com/new)**

2. **Import Your Repository:**
   - Click "Import Git Repository"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project:**
   - **Project Name:** `ai-image-enhancer` (or your preferred name)
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (leave as is)
   - **Build Command:** `npm run build` (auto-filled)
   - **Output Directory:** `.next` (auto-filled)
   - **Install Command:** `npm install` (auto-filled)

4. **Add Environment Variables:**
   Click "Environment Variables" and add:

   \`\`\`
   Name: REPLICATE_API_TOKEN
   Value: r8_YOUR_ACTUAL_API_KEY_HERE
   \`\`\`

   - ✅ Check: Production
   - ✅ Check: Preview
   - ✅ Check: Development

5. **Click "Deploy"** 🚀

6. **Wait 2-3 minutes** for deployment to complete

7. **Your app is live!** 🎉
   - You'll get a URL like: `https://ai-image-enhancer.vercel.app`

### Method 2: Vercel CLI

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name? ai-image-enhancer
# - Directory? ./
# - Override settings? N

# Add environment variable
vercel env add REPLICATE_API_TOKEN

# Paste your API key when prompted
# Select: Production, Preview, Development

# Deploy to production
vercel --prod
\`\`\`

---

## 🔐 Step 4: Verify Environment Variables

After deployment:

1. Go to your project dashboard: `https://vercel.com/YOUR_USERNAME/ai-image-enhancer`
2. Click **Settings** → **Environment Variables**
3. Verify `REPLICATE_API_TOKEN` is listed
4. If missing, add it:
   - Name: `REPLICATE_API_TOKEN`
   - Value: Your Replicate API key
   - Environments: Production ✓ Preview ✓ Development ✓
5. Click **Save**

---

## ✅ Step 5: Test Your Deployment

### Test 1: Homepage
1. Visit your deployed URL: `https://your-app.vercel.app`
2. ✅ Page loads without errors
3. ✅ Images load correctly
4. ✅ Navigation works

### Test 2: Enhancement Page
1. Go to `/enhance`
2. ✅ Upload a test image
3. ✅ AI recommendation appears (purple card)
4. ✅ Click "Apply Now"
5. ✅ Click "Enhance Image"
6. ✅ Wait for processing (30-90 seconds)
7. ✅ Enhanced image appears
8. ✅ Download works

### Test 3: AI Test Page
1. Go to `/test-ai`
2. ✅ Upload a wedding photo
3. ✅ Analysis completes
4. ✅ Confidence shows 85-92% for wedding photos
5. ✅ Recommendations are accurate

---

## 🐛 Troubleshooting

### Issue: "REPLICATE_API_TOKEN is not defined"

**Solution:**
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add `REPLICATE_API_TOKEN` with your API key
3. Redeploy: Settings → Deployments → Latest → ⋯ → Redeploy

### Issue: "API request failed"

**Check:**
1. Replicate API key is correct
2. Environment variable name is exactly: `REPLICATE_API_TOKEN` (no typos)
3. API key has no extra spaces
4. Your Replicate account has available credits

**Fix:**
\`\`\`bash
# Update environment variable
vercel env rm REPLICATE_API_TOKEN production
vercel env add REPLICATE_API_TOKEN production
# Paste correct API key
vercel --prod
\`\`\`

### Issue: Build fails

**Check:**
1. All files are committed to Git
2. `package.json` has all dependencies
3. No TypeScript errors locally

**Fix:**
\`\`\`bash
# Test build locally first
npm run build

# If successful, commit and push
git add .
git commit -m "fix: resolve build errors"
git push origin main

# Vercel will auto-redeploy
\`\`\`

### Issue: Images not loading

**Check:**
1. Image paths in code
2. All image files are in `public/` folder
3. Images are committed to Git

**Fix:**
\`\`\`bash
# Verify images exist
ls public/images/

# If missing, add them
git add public/images/
git commit -m "feat: add missing images"
git push origin main
\`\`\`

### Issue: API timeout

**Cause:** Image processing takes longer than 10 seconds (Vercel hobby plan limit)

**Solution:**
- Upgrade to Vercel Pro plan (300 second timeout)
- Or reduce image size before uploading
- Or use image compression (already implemented)

---

## 🔄 Redeploying After Changes

### Automatic Deployment (Recommended)
Every time you push to GitHub, Vercel automatically redeploys:

\`\`\`bash
git add .
git commit -m "feat: add new feature"
git push origin main
# Vercel deploys automatically! 🚀
\`\`\`

### Manual Deployment
\`\`\`bash
vercel --prod
\`\`\`

### Rollback to Previous Version
1. Go to Vercel Dashboard → Deployments
2. Find the working deployment
3. Click ⋯ → Promote to Production

---

## 📊 Monitoring Your App

### View Logs
1. Vercel Dashboard → Your Project
2. Click "Deployments" → Latest deployment
3. Click "View Function Logs"
4. See real-time API calls and errors

### Check Analytics
1. Vercel Dashboard → Your Project
2. Click "Analytics"
3. View page views, performance, errors

### Monitor API Usage
1. Go to [replicate.com/account](https://replicate.com/account)
2. Check API usage and costs
3. Set up billing alerts if needed

---

## 🎯 Performance Optimization

### Enable Caching
Already configured in `vercel.json`:
\`\`\`json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 300
    }
  }
}
\`\`\`

### Image Optimization
Already implemented:
- Automatic image compression before upload
- Next.js Image component for optimal loading
- Lazy loading for enhanced images

### Speed Tips
1. Upload smaller images (< 5MB)
2. Use WebP format when possible
3. Compress images before enhancement
4. Use the "All Filters OFF" for fastest processing

---

## 🔒 Security Best Practices

### Environment Variables
✅ Never commit `.env` files to Git
✅ Use Vercel's encrypted environment variables
✅ Rotate API keys regularly
✅ Limit API key permissions if possible

### API Protection
✅ Implement rate limiting (consider Upstash)
✅ Add authentication for production use
✅ Monitor unusual API usage

---

## 💰 Cost Estimation

### Typical Usage

| Volume | Monthly Cost (Replicate) |
|--------|-------------------------|
| 100 images | $10-30 |
| 500 images | $50-150 |
| 1000 images | $100-300 |

### Vercel Costs

- **Hobby Plan**: Free
  - 100 GB bandwidth
  - 100 hours function execution
  - Good for personal projects
  
- **Pro Plan**: $20/month
  - 1 TB bandwidth
  - 1000 hours function execution
  - Good for small businesses

---

## 🎉 Success!

Your AI Image Enhancer is now live! 

**Next Steps:**
1. ✅ Share your URL with friends/family
2. ✅ Test all features thoroughly
3. ✅ Monitor logs for any issues
4. ✅ Set up custom domain (optional)
5. ✅ Add authentication for production use
6. ✅ Implement usage limits if public

**Your Live URLs:**
- Production: `https://your-app.vercel.app`
- Enhancement: `https://your-app.vercel.app/enhance`
- AI Test: `https://your-app.vercel.app/test-ai`

---

## 📞 Support

### Need Help?

1. **Check logs**: `vercel logs`
2. **Check Replicate status**: https://status.replicate.com
3. **Vercel support**: https://vercel.com/help
4. **GitHub Issues**: [Your repo]/issues

### Common Solutions

- **Slow performance**: Check your Vercel region matches users
- **High costs**: Enable caching, optimize image sizes
- **API errors**: Check token validity, account credits
