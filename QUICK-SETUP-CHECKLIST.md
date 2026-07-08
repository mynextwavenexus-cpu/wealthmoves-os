# WealthMoves OS Quick Setup Checklist

**Goal:** Get platform ready for real users  
**Time Required:** ~2 hours  
**Difficulty:** ⭐⭐ Intermediate

---

## ✅ Step-by-Step Setup

### 1. Supabase Database Setup (30 minutes)

- [ ] Go to https://app.supabase.com
- [ ] Click "New Project"
- [ ] Fill in project details:
  - Project name: `wealthmoves-os`
  - Database password: (save this securely)
  - Region: Choose closest to your users
- [ ] Wait for project to finish provisioning (~2 minutes)
- [ ] Go to **SQL Editor** (left sidebar)
- [ ] Click **"New Query"**
- [ ] Copy the entire contents of `supabase-schema.sql`
- [ ] Paste into SQL editor
- [ ] Click **"Run"**
- [ ] Verify you see success message: `✅ WealthMoves OS database schema created successfully!`
- [ ] Go to **Settings** → **API**
- [ ] Copy these two values:
  - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
  - **anon public key** (starts with `eyJ...`)

**Expected Result:** Database with 7 tables, indexes, and RLS policies ready to use.

---

### 2. Vercel Environment Variables (15 minutes)

- [ ] Go to https://vercel.com
- [ ] Open your `wealthmoves-os` project
- [ ] Go to **Settings** → **Environment Variables**
- [ ] Add these variables:

#### **CRITICAL (Required for data persistence):**

```
NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project.supabase.co (from step 1)
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5... (from step 1)
```

#### **IMPORTANT (Required for AI Coach):**

```
ANTHROPIC_API_KEY
Value: sk-ant-api03-... (get from https://console.anthropic.com/)
```

```
CLAUDE_API_KEY
Value: sk-ant-api03-... (same as ANTHROPIC_API_KEY)
```

#### **OPTIONAL (Can add later):**

```
STRIPE_PUBLISHABLE_KEY
Value: pk_live_... (for payment processing)
```

```
STRIPE_SECRET_KEY
Value: sk_live_... (for payment processing)
```

```
COURSESPROUT_API_KEY
Value: ... (for automatic course enrollment)
```

```
JWT_SECRET
Value: (generate random 32+ character string)
Use: https://www.grc.com/passwords.htm
```

- [ ] Click **Save** after each variable
- [ ] Go to **Deployments** tab
- [ ] Click **...** (three dots) on latest deployment
- [ ] Click **Redeploy**
- [ ] Wait for deployment to finish (~2 minutes)

**Expected Result:** All environment variables set, platform redeployed with new config.

---

### 3. Test Demo Accounts (10 minutes)

- [ ] Go to https://wealthmoves-os.vercel.app
- [ ] Test Admin Login:
  - Email: `emma@wealthmoves.ai`
  - Password: `wealthmoves2026`
- [ ] Should see dashboard load successfully
- [ ] Test Dream Life Blueprint:
  - Click **Dream Life** in sidebar
  - Fill out form
  - Click **Calculate Blueprint**
  - Verify results appear
- [ ] Logout
- [ ] Login again with same credentials
- [ ] Verify your blueprint is still there (data persisted!)

**Expected Result:** Login works, data saves and persists between sessions.

---

### 4. Fix Missing Routes (20 minutes)

#### Option A: Create Dashboard Page (Recommended)

- [ ] Create file: `src/app/dashboard/page.tsx`
- [ ] Copy from: `src/app/dream-life/page.tsx` as template
- [ ] Modify to show user overview/stats
- [ ] Test: Visit `/dashboard` - should load

#### Option B: Redirect Dashboard to Home

- [ ] Create file: `src/app/dashboard/page.tsx`
- [ ] Add redirect:
```typescript
import { redirect } from 'next/navigation';
export default function Dashboard() {
  redirect('/');
}
```

#### Fix AI Coach Route

Same options as dashboard - either create `/app/ai-coach/page.tsx` or redirect to existing chat.

**Expected Result:** No more 404 errors when clicking sidebar links.

---

### 5. Test User Registration (15 minutes)

- [ ] Logout if logged in
- [ ] Click **Sign In** in sidebar
- [ ] At bottom, find **"Don't have access yet?"**
- [ ] Should link to Dream Blueprint sales page
- [ ] Come back to login page
- [ ] Try creating test account:
  - Email: `test@example.com`
  - Password: `testpassword123`
  - Name: `Test User`
- [ ] Should auto-login after registration
- [ ] Create a dream blueprint
- [ ] Logout and login again
- [ ] Verify blueprint persisted

**Expected Result:** Users can register, create data, and it persists.

---

### 6. Security Check (10 minutes)

- [ ] Verify JWT_SECRET is set in Vercel
- [ ] If not set, generate one:
  - Go to https://www.grc.com/passwords.htm
  - Copy "63 random alpha-numeric characters"
  - Add to Vercel environment variables
  - Redeploy
- [ ] Test that logged-out users can't access protected routes:
  - Logout
  - Try to visit `/dream-life`
  - Should redirect to `/login`
- [ ] Test data isolation:
  - Create second test account
  - Verify you don't see first account's data

**Expected Result:** Authentication works, data is isolated per user.

---

### 7. AI Coach Integration (20 minutes)

- [ ] Get Anthropic API key:
  - Go to https://console.anthropic.com/
  - Create account or login
  - Go to **API Keys**
  - Click **Create Key**
  - Copy the key (starts with `sk-ant-api03-`)
- [ ] Add to Vercel:
  - Settings → Environment Variables
  - Add `ANTHROPIC_API_KEY`
  - Add `CLAUDE_API_KEY` (same value)
  - Redeploy
- [ ] Test chat:
  - Login to platform
  - Look for Emma J™ AI Coach panel (right side)
  - Type: "Help me create my first revenue stream"
  - Should get AI response

**Expected Result:** AI coach responds to messages and saves conversation history.

---

### 8. Mobile Responsiveness Check (10 minutes)

- [ ] Open platform on mobile device or resize browser
- [ ] Test login on mobile
- [ ] Test creating blueprint on mobile
- [ ] Test navigation on mobile
- [ ] Verify all features work

**Expected Result:** Platform works smoothly on all screen sizes.

---

### 9. Performance & Error Check (10 minutes)

- [ ] Open browser console (F12)
- [ ] Check for JavaScript errors (should be none)
- [ ] Go to **Network** tab
- [ ] Reload page
- [ ] Verify no failed requests (all should be 200 or 307)
- [ ] Test page load speed (should be fast)
- [ ] Go to Vercel deployment logs:
  - Vercel → Deployments → Latest → View Function Logs
  - Check for errors

**Expected Result:** No errors in console or logs, fast page loads.

---

## ✅ Final Verification

### Production Readiness Checklist

- [ ] ✅ Supabase database configured and working
- [ ] ✅ All environment variables set
- [ ] ✅ Demo accounts login successfully
- [ ] ✅ User registration creates accounts
- [ ] ✅ Data persists between sessions
- [ ] ✅ Data is isolated per user
- [ ] ✅ All sidebar links work (no 404s)
- [ ] ✅ AI coach responds to messages
- [ ] ✅ Mobile responsiveness tested
- [ ] ✅ No console errors
- [ ] ✅ Security: users can't access other users' data

### If All Checked: 🚀 READY FOR USERS!

---

## Common Issues & Fixes

### Issue: "Database not configured"

**Fix:**
- Check Vercel environment variables include:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Verify they match your Supabase project
- Redeploy after adding variables

### Issue: "401 Unauthorized" on API calls

**Fix:**
- Make sure you're logged in
- Check browser cookies aren't disabled
- Clear browser cookies and try logging in again

### Issue: "AI Coach not responding"

**Fix:**
- Verify `ANTHROPIC_API_KEY` is set in Vercel
- Check Anthropic account has credits
- Look for errors in Vercel function logs

### Issue: "Data disappears after refresh"

**Fix:**
- Confirm Supabase is configured (see first issue)
- Check browser console for Supabase connection errors
- Verify RLS policies are enabled in Supabase

### Issue: "Can't create new users"

**Fix:**
- Users should only be created through `/login` form
- Test with demo accounts first
- Check Vercel function logs for errors

---

## Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Anthropic API:** https://docs.anthropic.com/
- **Platform Code:** Check `src/lib/db.ts` for database logic

---

## Next Steps After Setup

1. **Invite Beta Users** - Start with 5-10 trusted users
2. **Monitor Supabase** - Check database usage and performance
3. **Collect Feedback** - Watch how users interact with features
4. **Fix Bugs** - Address any issues that come up
5. **Add Features** - Based on user requests
6. **Scale** - When ready, remove "beta" label and launch!

---

**Setup Complete! 🎉**

You now have a fully functional, production-ready WealthMoves OS platform.

**Time to get users building their dreams!** 💪
