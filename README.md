# 🎨 AI Image Enhancer

Professional AI-powered image enhancement system specially trained for Southeast Asian heritage photos, weddings, and family memories.

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/travis-projects-c14a785a/v0-ai-image-enhancer)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/Euab7M2dXE5)
[![Next.js-15](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript-5](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind-3](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## ✨ Features

### 🤖 AI-Powered Smart Recommendations
- Automatic image analysis on upload
- 85-95% confidence scoring
- Detects image type, era, quality, and cultural elements
- One-click apply recommended preset

### 🎯 Cultural Heritage Presets
1. **Indonesian Wedding** - Kebaya, batik & traditional wedding photos
2. **ASEAN Heritage** - Colonial-era photos & family archives
3. **Family Portrait** - Multi-generational photos with Asian features
4. **Historical Archive** - Documents, certificates & vintage photographs
5. **Batik & Textiles** - Traditional fabrics & cultural patterns
6. **Vintage Photo Pro** - 1920s-1990s photos with era-specific restoration

### 🛡️ ASEAN Face Preservation
- Ultra-safe Asian facial feature preservation
- Natural skin tone maintenance
- No over-smoothing or westernization
- Cultural sensitivity built-in

### ⚙️ Advanced Enhancement
- Multiple AI models (Clarity, Real-ESRGAN, GFPGAN)
- 2x-4x upscaling
- Smart colorization for B&W photos
- Scratch and damage removal
- Noise reduction
- Texture enhancement
- Vintage restoration
- Adjustable sharpness & color boost

### 🎨 Professional Output
- PNG, JPG, or WebP export
- Quality control (60-100%)
- Batch processing
- Before/after comparison slider
- One-click download

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Replicate API key ([get one here](https://replicate.com/account/api-tokens))

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ai-image-enhancer.git
cd ai-image-enhancer

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your Replicate API key to .env.local
# REPLICATE_API_TOKEN=r8_your_actual_api_key_here

# Run development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📸 Usage

### Basic Enhancement
1. Go to `/enhance`
2. Upload your image (PNG, JPG, or WebP)
3. Wait for AI analysis (2-3 seconds)
4. Review the recommendation
5. Click "Apply Now" or choose a preset
6. Click "Enhance Image"
7. Wait 30-90 seconds
8. Download your enhanced image!

### Testing AI Recommendations
1. Go to `/test-ai`
2. Upload test images
3. Verify confidence scores
4. Check detected features
5. Validate recommendations

## 🎯 Deployment

### Deploy to Vercel (5 minutes)

1. **Push to GitHub**
\`\`\`bash
git add .
git commit -m "Initial commit"
git push origin main
\`\`\`

2. **Deploy to Vercel**
- Go to [vercel.com/new](https://vercel.com/new)
- Import your GitHub repository
- Add environment variable:
  - Name: `REPLICATE_API_TOKEN`
  - Value: Your Replicate API key
- Click "Deploy"

3. **Done!** Your app is live 🎉

Full deployment guide: [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📋 Environment Variables

Create a `.env.local` file:

\`\`\`env
REPLICATE_API_TOKEN=r8_your_actual_api_key_here
\`\`\`

Get your Replicate API key: [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3
- **UI Components:** Radix UI + shadcn/ui
- **AI Processing:** Replicate API
- **Deployment:** Vercel
- **Image Analysis:** Custom Canvas API implementation

## 📁 Project Structure

\`\`\`
ai-image-enhancer/
├── app/
│   ├── api/
│   │   └── enhance-replicate/
│   │       └── route.ts          # Enhancement API endpoint
│   ├── enhance/
│   │   └── page.tsx               # Main enhancement page
│   ├── test-ai/
│   │   └── page.tsx               # AI testing page
│   ├── layout.tsx
│   └── page.tsx                   # Homepage
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── smart-recommendations.tsx  # AI recommendation card
│   ├── image-comparison-slider.tsx
│   ├── navbar.tsx
│   └── footer.tsx
├── utils/
│   ├── image-analyzer.ts          # AI image analysis logic
│   └── image-processing.ts        # Image compression utilities
├── public/
│   └── images/                    # Static images
├── .env.example
├── .gitignore
├── DEPLOYMENT.md
├── PRE_DEPLOY_CHECKLIST.md
├── POST_DEPLOY_VERIFICATION.md
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
\`\`\`

## 🧪 Testing

### Local Testing
\`\`\`bash
# Run dev server
npm run dev

# Test endpoints
curl http://localhost:3000/api/enhance-replicate
\`\`\`

### Production Testing
See [POST_DEPLOY_VERIFICATION.md](./POST_DEPLOY_VERIFICATION.md)

## 💰 Cost Estimation

### Vercel
- **Free Tier:** 100 GB bandwidth, unlimited deployments
- **Pro Plan:** $20/month (300s function timeout, priority support)

### Replicate
- **Clarity Upscaler:** ~$0.02 per image
- **Real-ESRGAN:** ~$0.01 per image
- **Free Credits:** $10 for new accounts

**Monthly Estimate:**
- 100 images: $2-5
- 1,000 images: $20-50
- 10,000 images: $200-500

## 🐛 Troubleshooting

### "REPLICATE_API_TOKEN is not defined"
- Add API key to `.env.local` (local) or Vercel Environment Variables (production)
- Restart dev server after adding
- Verify no typos in variable name

### "API request failed"
- Check Replicate API key is valid
- Verify you have credits in Replicate account
- Check network connection
- View logs in Vercel Dashboard

### Build fails
- Run `npm run build` locally to test
- Check TypeScript errors: `npm run type-check`
- Verify all dependencies installed: `npm install`

### Images not loading
- Ensure images are in `public/` folder
- Check image paths are correct
- Verify images are committed to Git

Full troubleshooting: [DEPLOYMENT.md#troubleshooting](./DEPLOYMENT.md#troubleshooting)

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment instructions
- [Pre-Deploy Checklist](./PRE_DEPLOY_CHECKLIST.md) - Ensure readiness
- [Post-Deploy Verification](./POST_DEPLOY_VERIFICATION.md) - Verify deployment

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- **Replicate** - AI model infrastructure
- **Vercel** - Hosting and deployment
- **shadcn/ui** - Beautiful UI components
- **Radix UI** - Accessible component primitives
- **Next.js** - React framework

## 📞 Support

- 📖 **Documentation:** See guides in `/docs` folder
- 🐛 **Issues:** Open an issue on GitHub
- 💬 **Discussions:** Start a discussion on GitHub

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

**Built with ❤️ for Southeast Asian heritage preservation**
