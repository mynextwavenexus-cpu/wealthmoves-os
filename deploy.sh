#!/bin/bash

# Quick deployment script for WealthMoves OS
# Usage: ./deploy.sh [VERCEL_TOKEN]

set -e

echo "🚀 WealthMoves OS Deployment Script"
echo "======================================"

# Check if token provided
if [ -z "$1" ]; then
    echo "❌ Error: Vercel token required"
    echo "Usage: ./deploy.sh YOUR_VERCEL_TOKEN"
    echo ""
    echo "Get a token at: https://vercel.com/account/tokens"
    exit 1
fi

TOKEN=$1

echo "✓ Token provided"
echo "📦 Installing dependencies..."
npm install --silent

echo "🔨 Building project..."
npm run build

echo "🚀 Deploying to Vercel..."
VERCEL_TOKEN=$TOKEN vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo "🌐 Visit: https://wealthmoves-os.vercel.app"
echo ""
echo "Changes deployed:"
echo "  - Removed 'Emma Jackson' from top bar"
echo "  - Removed 'Founder Member' badge"
echo "  - Clean avatar-only display"
