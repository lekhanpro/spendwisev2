#!/bin/bash

# SpendWise v2 Deployment Script

echo "🚀 Starting SpendWise v2 deployment..."

# Check if we're in the web directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the web directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Vercel
    echo "🌐 Deploying to Vercel..."
    npx vercel --prod
    
    if [ $? -eq 0 ]; then
        echo "✅ Deployment successful!"
        echo "🎉 SpendWise v2 is now live!"
    else
        echo "❌ Deployment failed. Please check the error messages above."
        exit 1
    fi
else
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi
