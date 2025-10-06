#!/bin/bash

echo "🚀 AI Image Enhancer - Deployment Script"
echo "========================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git not initialized. Run 'git init' first."
    exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "📝 Found uncommitted changes. Committing..."
    git add .
    
    # Prompt for commit message
    echo "Enter commit message (or press Enter for default):"
    read commit_msg
    
    if [ -z "$commit_msg" ]; then
        commit_msg="deploy: update AI Image Enhancer"
    fi
    
    git commit -m "$commit_msg"
    echo "✅ Changes committed"
else
    echo "✅ No uncommitted changes"
fi

# Check for remote
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ No git remote found. Add remote first:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git"
    exit 1
fi

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Pushed to GitHub successfully"
else
    echo "❌ Failed to push to GitHub"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo ""
    echo "⚠️  Vercel CLI not found. Install it with:"
    echo "   npm i -g vercel"
    echo ""
    echo "Then run: vercel --prod"
    exit 1
fi

# Deploy to Vercel
echo ""
echo "☁️  Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo "========================================"
    echo "Your app is now live!"
    echo ""
    echo "Next steps:"
    echo "1. Visit your app URL"
    echo "2. Test the enhancement feature"
    echo "3. Verify AI recommendations work"
    echo "4. Check the logs in Vercel Dashboard"
else
    echo "❌ Deployment failed. Check Vercel logs for details."
    exit 1
fi
