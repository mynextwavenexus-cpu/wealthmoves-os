#!/bin/bash
# Deploy WealthMoves OS with environment variables
# Run this script after setting your actual API keys below

# =============================================================================
# STEP 1: Fill in your actual values below
# =============================================================================

# Get from https://console.anthropic.com/
ANTHROPIC_API_KEY="your-anthropic-key-here"

# Get from https://dashboard.stripe.com/apikeys
STRIPE_PUBLISHABLE_KEY="your-stripe-pk-here"
STRIPE_SECRET_KEY="your-stripe-sk-here"
STRIPE_WEBHOOK_SECRET="your-webhook-secret-here"

# Create these in Stripe Dashboard → Products → Pricing
STRIPE_STARTER_PRICE_ID="price_your_starter_id"
STRIPE_PRO_PRICE_ID="price_your_pro_id"
STRIPE_SPRINT_PRICE_ID="price_your_sprint_id"

# Get from https://app.supabase.com/project/_/settings/api
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"

# Your URLs
APP_URL="https://wealthmoves-os.vercel.app"
SALES_PAGE_URL="https://your-sales-page.vercel.app"
UPGRADE_URL="https://buy.stripe.com/your-checkout-link"
COURSESPROUT_URL="https://your-account.coursesprout.com"

# =============================================================================
# STEP 2: Deploy to Vercel with environment variables
# =============================================================================

echo "Deploying WealthMoves OS with environment variables..."

# Pull latest
vercel pull --yes

# Set environment variables
echo "Setting environment variables..."

vercel env add JWT_SECRET production <<< "$(openssl rand -base64 32)"
vercel env add ANTHROPIC_API_KEY production <<< "$ANTHROPIC_API_KEY"
vercel env add STRIPE_PUBLISHABLE_KEY production <<< "$STRIPE_PUBLISHABLE_KEY"
vercel env add STRIPE_SECRET_KEY production <<< "$STRIPE_SECRET_KEY"
vercel env add STRIPE_WEBHOOK_SECRET production <<< "$STRIPE_WEBHOOK_SECRET"
vercel env add STRIPE_STARTER_PRICE_ID production <<< "$STRIPE_STARTER_PRICE_ID"
vercel env add STRIPE_PRO_PRICE_ID production <<< "$STRIPE_PRO_PRICE_ID"
vercel env add STRIPE_SPRINT_PRICE_ID production <<< "$STRIPE_SPRINT_PRICE_ID"
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "$SUPABASE_URL"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "$SUPABASE_ANON_KEY"
vercel env add NEXT_PUBLIC_APP_URL production <<< "$APP_URL"
vercel env add NEXT_PUBLIC_SALES_PAGE_URL production <<< "$SALES_PAGE_URL"
vercel env add NEXT_PUBLIC_UPGRADE_CHECKOUT_URL production <<< "$UPGRADE_URL"
vercel env add NEXT_PUBLIC_COURSESPROUT_URL production <<< "$COURSESPROUT_URL"

# Deploy
echo "Deploying..."
vercel --prod

echo "Done! Check your deployment at $APP_URL"
