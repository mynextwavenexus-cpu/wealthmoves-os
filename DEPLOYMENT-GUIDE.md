# WealthMoves OS Deployment Guide

**Status:** ✅ Code Ready | ⏳ Awaiting Environment Configuration

---

## What's Been Fixed

### ✅ Completed:

1. **Dashboard Page** (`/dashboard`)
   - Full stats overview
   - Quick actions
   - Sprint and blueprint progress
   - Revenue metrics
   - Tier upgrade CTA

2. **AI Coach Page** (`/ai-coach`)
   - Full chat interface
   - Conversation history
   - Quick start prompts
   - Real-time messaging
   - Persistent chat storage

3. **Database Schema**
   - Complete Supabase SQL schema created
   - All tables, indexes, and RLS policies
   - Ready to copy/paste into Supabase

4. **Code Quality**
   - All TypeScript types defined
   - Error handling implemented
   - Loading states added
   - Mobile responsive

---

## Required: Environment Variables Setup

### Critical Path to Production:

You need to configure these environment variables in Vercel to make the platform fully functional.

---

## Step 1: Set Up Supabase (REQUIRED)

### Why It's Critical:
Without Supabase, all data is stored in-memory and gets wiped on every deployment. Users will lose their work.

### Setup Steps:

1. **Create Supabase Project**
   - Go to: https://app.supabase.com
   - Click "New Project"
   - Project name: `wealthmoves-os`
   - Choose a strong database password (save it!)
   - Select region closest to your users
   - Wait 2-3 minutes for provisioning

2. **Run Database Schema**
   - In Supabase dashboard, go to **SQL Editor** (left sidebar)
   - Click **"New Query"**
   - Open file: `supabase-schema.sql` (in this directory)
   - Copy the entire contents
   - Paste into Supabase SQL editor
   - Click **"Run"**
   - You should see: ✅ Success messages

3. **Get API Credentials**
   - In Supabase, go to **Settings** → **API**
   - Copy two values:
     - **Project URL** (e.g., `https://abcxyz.supabase.co`)
     - **anon public key** (long string starting with `eyJ...`)

4. **Add to Vercel**
   - Go to Vercel dashboard
   - Select `wealthmoves-os` project
   - Go to **Settings** → **Environment Variables**
   - Add these TWO variables:

```
Variable: NEXT_PUBLIC_SUPABASE_URL
Value: https://YOUR-PROJECT.supabase.co

Variable: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 2: Configure AI Coach (REQUIRED for AI features)

### Why It's Critical:
The AI coach won't work without an Anthropic API key. Users will see errors when trying to chat.

### Setup Steps:

1. **Get Anthropic API Key**
   - Go to: https://console.anthropic.com/
   - Sign up or log in
   - Go to **API Keys** (left sidebar)
   - Click **"Create Key"**
   - Give it a name: `wealthmoves-os-production`
   - Copy the key (starts with `sk-ant-api03-`)
   - **SAVE IT** - you won't see it again!

2. **Add to Vercel**
   - Vercel → Settings → Environment Variables
   - Add BOTH of these (same value):

```
Variable: ANTHROPIC_API_KEY
Value: sk-ant-api03-YOUR_KEY_HERE

Variable: CLAUDE_API_KEY
Value: sk-ant-api03-YOUR_KEY_HERE
```

### Cost Estimate:
- Claude Sonnet 3.5: ~$3 per million input tokens
- Average chat: ~500 tokens
- Cost per chat: ~$0.0015 (less than a penny)
- Budget: Start with $20 credit = ~13,000 conversations

---

## Step 3: Secure JWT Secret (REQUIRED)

### Why It's Critical:
Authentication tokens need a secret key. Default key is insecure.

### Setup Steps:

1. **Generate Strong Secret**
   - Go to: https://www.grc.com/passwords.htm
   - Copy the **"63 random alpha-numeric characters"**
   - OR use terminal:
     ```bash
     openssl rand -base64 32
     ```

2. **Add to Vercel**

```
Variable: JWT_SECRET
Value: [paste your generated secret]
```

---

## Step 4: Payment Integration (OPTIONAL - can add later)

### When You Need This:
When you're ready to charge users for upgrades (Starter → Pro → Sprint tiers).

### Setup Steps:

1. **Get Stripe Keys**
   - Go to: https://dashboard.stripe.com
   - For testing: Use "Test mode" keys
   - For production: Use "Live mode" keys
   - Copy:
     - Publishable key (starts with `pk_`)
     - Secret key (starts with `sk_`)

2. **Add to Vercel**

```
Variable: STRIPE_PUBLISHABLE_KEY
Value: pk_live_YOUR_KEY (or pk_test_ for testing)

Variable: STRIPE_SECRET_KEY
Value: sk_live_YOUR_KEY (or sk_test_ for testing)

Variable: STRIPE_WEBHOOK_SECRET
Value: whsec_YOUR_SECRET (optional, for webhooks)
```

---

## Step 5: CourseSprout Integration (OPTIONAL)

### When You Need This:
If you want to automatically enroll users in CourseSprout when they register.

### Setup Steps:

1. **Get CourseSprout API Key**
   - Go to: https://app.coursesprout.com
   - Go to **Settings** → **API**
   - Copy your API key

2. **Add to Vercel**

```
Variable: COURSESPROUT_API_KEY
Value: [your API key]

Variable: COURSESPROUT_POD_ID
Value: 965

Variable: COURSESPROUT_PRICING_OPTION_ID
Value: 1022
```

---

## Step 6: Deploy!

### After Adding Environment Variables:

1. **Redeploy**
   - Vercel → Deployments
   - Click **...** (three dots) on latest deployment
   - Click **"Redeploy"**
   - Wait ~2 minutes

2. **Verify Deployment**
   - Go to your live URL
   - Check for errors in browser console (F12)
   - No errors = successful deployment!

---

## Step 7: Test Everything

### Test Checklist:

- [ ] **Database Working**
  - Login with demo account
  - Create dream blueprint
  - Logout and login again
  - Blueprint should still be there (data persisted!)

- [ ] **AI Coach Working**
  - Go to `/ai-coach`
  - Send a test message
  - Should get AI response
  - Refresh page
  - Chat history should load

- [ ] **Dashboard Working**
  - Go to `/dashboard`
  - Should see stats
  - No 404 errors
  - All quick action buttons work

- [ ] **User Registration**
  - Logout
  - Create new test account
  - Should auto-login after signup
  - Can create blueprint
  - Data persists

- [ ] **Mobile Test**
  - Open on phone or resize browser
  - All features work
  - Navigation works
  - Forms work

---

## Environment Variables Summary

### CRITICAL (Platform won't work without these):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-api03-...
CLAUDE_API_KEY=sk-ant-api03-...
JWT_SECRET=your-random-32char-secret
```

### OPTIONAL (Can add later):

```bash
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
COURSESPROUT_API_KEY=...
COURSESPROUT_POD_ID=965
COURSESPROUT_PRICING_OPTION_ID=1022
NEXT_PUBLIC_APP_URL=https://wealthmoves-os.vercel.app
```

---

## Current Demo Accounts

These work RIGHT NOW (even without configuration):

| Email | Password | Tier | Access |
|-------|----------|------|--------|
| `emma@wealthmoves.ai` | `wealthmoves2026` | Sprint | Full access |
| `demo1@wealthmoves.ai` | `demo1` | Starter | Limited |
| `demo2@wealthmoves.ai` | `demo2` | Pro | Most features |

**Note:** Data for demo accounts will persist once Supabase is configured.

---

## Troubleshooting

### Problem: "Database not configured" message

**Solution:**
- Verify `NEXT_PUBLIC_SUPABASE_URL` starts with `https://`
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the **anon** key (not service role)
- Redeploy after adding variables

### Problem: AI Coach shows "Connection error"

**Solution:**
- Verify `ANTHROPIC_API_KEY` starts with `sk-ant-api03-`
- Check Anthropic account has credits
- Look at Vercel function logs for errors

### Problem: Users can see other users' data

**Solution:**
- Check Supabase RLS policies are enabled
- Run the full schema again (includes RLS policies)
- Verify API routes check `userId` from JWT

### Problem: "401 Unauthorized" on all API calls

**Solution:**
- Clear browser cookies
- Login again
- Check JWT_SECRET is set
- Check cookies aren't blocked

---

## Post-Launch Monitoring

### Things to Watch:

1. **Supabase Usage**
   - Go to Supabase → Settings → Usage
   - Free tier: 500MB database, 2GB bandwidth
   - Upgrade to Pro if approaching limits

2. **Anthropic API Usage**
   - Go to Anthropic → Usage
   - Monitor token consumption
   - Set up billing alerts

3. **Vercel Analytics**
   - Vercel → Analytics
   - Monitor page views
   - Check error rates

4. **User Feedback**
   - Watch for bug reports
   - Monitor support requests
   - Track feature requests

---

## Security Checklist (Before Public Launch)

- [ ] Change JWT_SECRET to strong random value
- [ ] Use Stripe live keys (not test keys)
- [ ] Enable Supabase RLS policies
- [ ] Set up rate limiting (optional)
- [ ] Add email verification (optional)
- [ ] Configure CORS properly
- [ ] Review all environment variables
- [ ] Test permission boundaries
- [ ] Verify data isolation between users

---

## Next Steps

1. **Immediate** (Today):
   - [ ] Set up Supabase
   - [ ] Get Anthropic API key
   - [ ] Add environment variables to Vercel
   - [ ] Redeploy
   - [ ] Test with demo accounts

2. **This Week**:
   - [ ] Invite 5-10 beta users
   - [ ] Monitor for bugs
   - [ ] Collect feedback
   - [ ] Fix any issues

3. **Before Public Launch**:
   - [ ] Complete security checklist
   - [ ] Set up Stripe payments
   - [ ] Add CourseSprout integration
   - [ ] Configure monitoring/alerts
   - [ ] Prepare support documentation

---

## Support

**Platform Status:** ✅ Code Complete  
**Deployment Status:** ⏳ Awaiting Environment Configuration  
**Estimated Setup Time:** 1-2 hours  
**Difficulty:** ⭐⭐ Intermediate

**Questions?** Check the troubleshooting section above or review Vercel function logs.

---

**Ready to launch! 🚀**
