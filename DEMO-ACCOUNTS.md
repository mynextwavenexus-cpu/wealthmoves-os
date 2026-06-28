# WealthMoves OS Demo Accounts

## Demo Account 1 - Starter Tier

**Email:** `demo1@wealthmoves.ai`  
**Password:** `demo1`  
**Tier:** Starter

### Starter Tier Access:
✅ Dashboard  
✅ Dream Life Blueprint  
✅ Revenue Planning  
✅ AI Coach (basic)  
✅ Resources  
✅ Community Access  

❌ Offers Builder  
❌ Systems Builder  
❌ PDF Downloads  
❌ Revenue Sprint  

---

## Demo Account 2 - Pro Tier

**Email:** `demo2@wealthmoves.ai`  
**Password:** `demo2`  
**Tier:** Pro

### Pro Tier Access:
✅ Dashboard  
✅ Dream Life Blueprint  
✅ Revenue Planning  
✅ **Offers Builder**  
✅ **Systems Builder**  
✅ AI Coach (full)  
✅ Resources  
✅ **PDF Downloads**  
✅ **Revenue Gap Analysis**  
✅ **Action Plans**  
✅ **Reminders**  
✅ Community Access  

❌ Revenue Sprint (30-day)  
❌ 1-on-1 Coaching Calls  

---

## Admin Account

**Email:** `emma@wealthmoves.ai`  
**Password:** `wealthmoves2026`  
**Tier:** Sprint (Full Access)

---

## Login URL

Local: http://localhost:3000/login  
Production: Deploy to your hosting and use `/login`

---

## Testing Permissions

1. **Login as demo1** → Try to access `/offers` → Should see upgrade prompt
2. **Login as demo2** → Access `/offers` → Should work ✅
3. **Login as demo2** → Try to access `/sprint` → Should see upgrade prompt

---

## Notes

- Demo accounts are stored in-memory (reset on server restart)
- For production, migrate to a real database (Supabase, PostgreSQL, etc.)
- Passwords are hashed with bcrypt
- Sessions expire after 7 days
