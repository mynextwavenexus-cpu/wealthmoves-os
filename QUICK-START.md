# WealthMoves OS - Quick Start

**Platform:** https://wealthmoves-os.vercel.app  
**Status:** ✅ Code Complete | ⏳ Needs Environment Setup

---

## 🎯 What You Need (1-2 Hours Total)

### 1. Supabase Account (30 min)
- Go to: https://app.supabase.com
- Create project
- Run SQL from `supabase-schema.sql`
- Copy Project URL + API key
- Add to Vercel

### 2. Anthropic API Key (15 min)
- Go to: https://console.anthropic.com/
- Create API key
- Add to Vercel

### 3. JWT Secret (5 min)
- Generate: https://www.grc.com/passwords.htm
- Add to Vercel

### 4. Redeploy (5 min)
- Vercel → Redeploy
- Wait 2 minutes
- Test!

---

## 📋 Environment Variables Needed

### Add These to Vercel:

```bash
# Database (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# AI Coach (REQUIRED)
ANTHROPIC_API_KEY=sk-ant-api03-...
CLAUDE_API_KEY=sk-ant-api03-...

# Security (REQUIRED)
JWT_SECRET=your-random-secret-32chars

# Payments (OPTIONAL - add later)
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

---

## 🧪 Test After Setup

1. **Login:** `emma@wealthmoves.ai` / `wealthmoves2026`
2. **Create blueprint** at `/dream-life`
3. **Logout and login again**
4. **Verify blueprint still there** (data persisted!)
5. **Test AI coach** at `/ai-coach`
6. **Check dashboard** at `/dashboard`

All working? **🎉 You're live!**

---

## 📚 Full Documentation

- **Complete Guide:** `DEPLOYMENT-GUIDE.md`
- **Setup Checklist:** `QUICK-SETUP-CHECKLIST.md`
- **Platform Assessment:** `WEALTHMOVES-OS-ASSESSMENT.md`
- **Completion Report:** `WEALTHMOVES-FIXES-COMPLETE.md`

---

## ⚡ Demo Accounts (Work Now)

- **Admin:** `emma@wealthmoves.ai` / `wealthmoves2026`
- **Starter:** `demo1@wealthmoves.ai` / `demo1`
- **Pro:** `demo2@wealthmoves.ai` / `demo2`

---

## 🐛 Problems?

### "Database not configured"
→ Add Supabase env vars and redeploy

### "AI Coach error"
→ Add Anthropic API key and redeploy

### "401 Unauthorized"
→ Clear cookies, login again

### Still stuck?
→ Check `DEPLOYMENT-GUIDE.md` troubleshooting section

---

**Ready to launch! 🚀**
