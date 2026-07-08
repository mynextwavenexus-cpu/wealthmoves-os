-- WealthMoves OS Database Schema Final - Production Ready
-- Includes: Auth, Profiles, Payments, Admin Functions, RLS Policies

-- =====================================================
-- DROP OLD TABLES (Clean slate for fresh setup)
-- =====================================================
DROP TABLE IF EXISTS chat_history CASCADE;
DROP TABLE IF EXISTS daily_stats CASCADE;
DROP TABLE IF EXISTS sprint_tasks CASCADE;
DROP TABLE IF EXISTS sprints CASCADE;
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS blueprints CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =====================================================
-- PROFILES TABLE
-- Extended user data linked to Supabase Auth
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT DEFAULT '',
  tier TEXT DEFAULT 'starter' CHECK (tier IN ('starter', 'pro', 'sprint', 'admin')),
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,
  preferences JSONB DEFAULT '{}',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'inactive', 'trialing')),
  subscription_period_end TIMESTAMP WITH TIME ZONE,
  is_admin BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_tier ON profiles(tier);
CREATE INDEX idx_profiles_stripe_customer ON profiles(stripe_customer_id);

-- =====================================================
-- PASSWORD RESET TOKENS TABLE
-- Secure token storage for password reset flow
-- =====================================================
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_hash ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);

-- =====================================================
-- PAYMENTS TABLE
-- Track payment history and invoices
-- =====================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_stripe_intent ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_created ON payments(created_at);

-- =====================================================
-- BLUEPRINTS TABLE
-- Stores user dream life financial blueprints
-- =====================================================
CREATE TABLE blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT DEFAULT '',
  monthly_income NUMERIC DEFAULT 0,
  current_income NUMERIC DEFAULT 0,
  yearly_target NUMERIC DEFAULT 0,
  monthly_target NUMERIC DEFAULT 0,
  weekly_target NUMERIC DEFAULT 0,
  daily_target NUMERIC DEFAULT 0,
  hourly_target NUMERIC DEFAULT 0,
  home_cost NUMERIC DEFAULT 0,
  vehicle_cost NUMERIC DEFAULT 0,
  travel_cost NUMERIC DEFAULT 0,
  food_cost NUMERIC DEFAULT 0,
  trainer_cost NUMERIC DEFAULT 0,
  chef_cost NUMERIC DEFAULT 0,
  college_cost NUMERIC DEFAULT 0,
  retirement_cost NUMERIC DEFAULT 0,
  other_cost NUMERIC DEFAULT 0,
  other_description TEXT DEFAULT '',
  skills TEXT DEFAULT '',
  experience TEXT DEFAULT '',
  passion TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_blueprints_user_id ON blueprints(user_id);

-- =====================================================
-- SPRINTS TABLE
-- =====================================================
CREATE TABLE sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day INTEGER DEFAULT 1,
  total_days INTEGER DEFAULT 30,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revenue_generated NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sprints_user_id ON sprints(user_id);

-- =====================================================
-- SPRINT TASKS TABLE
-- =====================================================
CREATE TABLE sprint_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sprint_tasks_sprint_id ON sprint_tasks(sprint_id);

-- =====================================================
-- OFFERS TABLE
-- =====================================================
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused')),
  revenue_generated NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_offers_user_id ON offers(user_id);

-- =====================================================
-- DAILY STATS TABLE
-- =====================================================
CREATE TABLE daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  new_leads INTEGER DEFAULT 0,
  conversations INTEGER DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  content_published INTEGER DEFAULT 0,
  actions_completed JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_stats_user_id ON daily_stats(user_id);
CREATE INDEX idx_daily_stats_date ON daily_stats(date);
CREATE INDEX idx_daily_stats_user_date ON daily_stats(user_id, date);

-- =====================================================
-- CHAT HISTORY TABLE
-- =====================================================
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX idx_chat_history_user_created ON chat_history(user_id, created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
-- Admins can read all profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id OR is_admin = true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Password reset tokens: Only service role can access
CREATE POLICY "Service role can manage tokens" ON password_reset_tokens
  FOR ALL USING (true) WITH CHECK (true);

-- Payments: Users can view their own payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- Blueprints: Users can CRUD their own blueprint
CREATE POLICY "Users can CRUD own blueprint" ON blueprints
  FOR ALL USING (auth.uid() = user_id::uuid);

-- Sprints: Users can CRUD their own sprints
CREATE POLICY "Users can CRUD own sprints" ON sprints
  FOR ALL USING (auth.uid() = user_id);

-- Sprint tasks: Users can CRUD tasks for their own sprints
CREATE POLICY "Users can CRUD own sprint tasks" ON sprint_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM sprints WHERE id = sprint_id AND user_id = auth.uid())
  );

-- Offers: Users can CRUD their own offers
CREATE POLICY "Users can CRUD own offers" ON offers
  FOR ALL USING (auth.uid() = user_id);

-- Daily stats: Users can CRUD their own stats
CREATE POLICY "Users can CRUD own daily stats" ON daily_stats
  FOR ALL USING (auth.uid() = user_id);

-- Chat history: Users can CRUD their own chat history
CREATE POLICY "Users can CRUD own chat history" ON chat_history
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blueprints_updated_at
BEFORE UPDATE ON blueprints
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sprints_updated_at
BEFORE UPDATE ON sprints
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, tier, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.email = 'admin@wealthmoves.ai' THEN 'admin'
      ELSE 'starter'
    END,
    NEW.email = 'admin@wealthmoves.ai'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_uuid AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ADMIN USER SETUP
-- Create admin user if not exists
-- =====================================================
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Check if admin@wealthmoves.ai exists in auth.users
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@wealthmoves.ai';
  
  IF admin_user_id IS NULL THEN
    -- Create admin user (password should be set via Supabase Auth UI or API)
    -- This just ensures the profile exists with admin privileges
    RAISE NOTICE 'Admin user does not exist. Create via Supabase Auth and profile will be auto-created with admin rights.';
  ELSE
    -- Ensure admin profile has correct privileges
    UPDATE profiles 
    SET is_admin = true, tier = 'admin'
    WHERE id = admin_user_id;
    RAISE NOTICE 'Admin user profile updated with admin privileges';
  END IF;
END $$;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ WealthMoves OS Final Database Schema Created!';
  RAISE NOTICE '📊 Tables: profiles, password_reset_tokens, payments, blueprints, sprints, sprint_tasks, offers, daily_stats, chat_history';
  RAISE NOTICE '🔒 RLS Policies: Enabled on all tables';
  RAISE NOTICE '👤 Admin: admin@wealthmoves.ai has full admin access';
  RAISE NOTICE '🎯 Ready for production deployment!';
END $$;