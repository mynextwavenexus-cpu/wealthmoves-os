-- WealthMoves OS Database Schema V2 - Clean Start
-- Drop old tables and create fresh ones

-- =====================================================
-- DROP OLD TABLES (Clean slate)
-- =====================================================
DROP TABLE IF EXISTS chat_history CASCADE;
DROP TABLE IF EXISTS daily_stats CASCADE;
DROP TABLE IF EXISTS sprint_tasks CASCADE;
DROP TABLE IF EXISTS sprints CASCADE;
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS systems CASCADE;
DROP TABLE IF EXISTS blueprints CASCADE;

-- =====================================================
-- BLUEPRINTS TABLE
-- Stores user dream life financial blueprints
-- =====================================================
CREATE TABLE blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
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
  user_id TEXT NOT NULL,
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
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused')),
  revenue_generated NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_offers_user_id ON offers(user_id);

-- =====================================================
-- SYSTEMS TABLE - NEW STRUCTURE
-- Systems are NOT stored - generated client-side from blueprint
-- This table is for future use if we want to persist user customizations
-- =====================================================
-- REMOVED - Systems generated client-side only

-- =====================================================
-- DAILY STATS TABLE
-- =====================================================
CREATE TABLE daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
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
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX idx_chat_history_user_created ON chat_history(user_id, created_at);

-- =====================================================
-- FUNCTIONS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blueprints_updated_at
BEFORE UPDATE ON blueprints
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sprints_updated_at
BEFORE UPDATE ON sprints
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ WealthMoves OS V2 database created!';
  RAISE NOTICE '📊 Tables: blueprints, sprints, sprint_tasks, offers, daily_stats, chat_history';
  RAISE NOTICE '🚫 Systems table REMOVED - generated client-side only';
  RAISE NOTICE '🎯 Ready for clean deployment!';
END $$;
