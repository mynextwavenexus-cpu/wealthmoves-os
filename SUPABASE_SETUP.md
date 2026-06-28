# Supabase Setup Guide for WealthMoves OS

## Step 1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Choose your organization
4. Enter project name: `wealthmoves-os`
5. Choose a database password (save this!)
6. Select region closest to your users (e.g., US East)
7. Click "Create new project"

## Step 2: Get Your API Keys

1. In your Supabase dashboard, go to Project Settings → API
2. Copy the following values:
   - **URL** (e.g., `https://xyzabc123.supabase.co`)
   - **anon public** API key (starts with `eyJ...`)

## Step 3: Set Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

For Vercel deployment, add these in:
- Project Settings → Environment Variables

## Step 4: Create Database Tables

1. In Supabase dashboard, go to SQL Editor
2. Click "New query"
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click "Run"

This creates all tables:
- `blueprints` - User dream life blueprints
- `sprints` - 30-day sprint data
- `sprint_tasks` - Individual sprint tasks
- `offers` - User offers/products
- `systems` - Revenue systems
- `daily_stats` - Daily metrics tracking
- `chat_history` - AI Coach conversation history

## Step 5: Test the Connection

1. Start your local dev server: `npm run dev`
2. Log in to the app
3. Go to Dream Life and complete the wizard
4. Check Supabase Table Editor to see if data was saved

## Database Schema Overview

### blueprints
Stores user dream life calculations and skills/experience.

### sprints
Tracks 30-day revenue sprint progress.

### sprint_tasks
Individual tasks within a sprint.

### offers
User's products/services for sale.

### systems
Revenue-generating systems (newsletters, funnels, etc.).

### daily_stats
Daily metrics for dashboard (leads, conversations, revenue).

### chat_history
AI Coach conversation history.

## Troubleshooting

### "Failed to fetch blueprint" error
- Check that Supabase URL and anon key are correct
- Verify tables were created in SQL Editor
- Check browser console for detailed error

### Data not persisting
- Ensure RLS policies are set (included in schema.sql)
- Check that user_id is being passed correctly
- Verify JWT authentication is working

### Connection timeout
- Check your Supabase project is active
- Verify you're using the correct region
- Try refreshing the page

## Row Level Security (RLS)

The schema includes basic RLS policies that allow all access. For production, update these policies to restrict users to only their own data:

```sql
-- Example: Restrict blueprints to owner only
CREATE POLICY "Users can only access their own blueprints"
  ON blueprints FOR ALL
  USING (auth.uid()::text = user_id);
```

## Next Steps

1. Set up authentication with Supabase Auth (optional)
2. Add real-time subscriptions for live updates
3. Set up database backups
4. Configure connection pooling for production

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- OpenClaw Docs: https://docs.openclaw.ai
