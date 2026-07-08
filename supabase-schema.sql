-- WealthMoves OS Database Schema for Supabase
-- Run this in your Supabase SQL Editor to create all required tables

-- =====================================================
-- BLUEPRINTS TABLE
-- Stores user dream life financial blueprints
-- =====================================================
CREATE TABLE blueprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
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

-- Index for fast user lookup
CREATE INDEX idx_blueprints_user_id ON blueprints(user_id);

-- =====================================================
-- SPRINTS TABLE
-- Stores user revenue sprint progress
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

-- Index for fast user lookup
CREATE INDEX idx_sprints_user_id ON sprints(user_id);

-- =====================================================
-- SPRINT TASKS TABLE
-- Stores individual tasks within each sprint
-- =====================================================
CREATE TABLE sprint_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast sprint lookup
CREATE INDEX idx_sprint_tasks_sprint_id ON sprint_tasks(sprint_id);

-- =====================================================
-- OFFERS TABLE
-- Stores user product/service offers
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

-- Index for fast user lookup
CREATE INDEX idx_offers_user_id ON offers(user_id);

-- =====================================================
-- SYSTEMS TABLE
-- Stores user revenue systems (newsletter, coaching, etc)
-- =====================================================
CREATE TABLE systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'Settings2',
  description TEXT DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('newsletter', 'coaching', 'course', 'consulting', 'affiliate', 'community')),
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'building', 'active')),
  components JSONB DEFAULT '[]',
  progress INTEGER DEFAULT 0,
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast user lookup
CREATE INDEX idx_systems_user_id ON systems(user_id);

-- =====================================================
-- DAILY STATS TABLE
-- Stores daily metrics for tracking progress
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

-- Indexes for fast user and date lookup
CREATE INDEX idx_daily_stats_user_id ON daily_stats(user_id);
CREATE INDEX idx_daily_stats_date ON daily_stats(date);
CREATE INDEX idx_daily_stats_user_date ON daily_stats(user_id, date);

-- =====================================================
-- CHAT HISTORY TABLE
-- Stores AI coach conversation history
-- =====================================================
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast user lookup and ordering
CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX idx_chat_history_user_created ON chat_history(user_id, created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures users can only access their own data
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Blueprints policies
CREATE POLICY "Users can view their own blueprints"
  ON blueprints FOR SELECT
  USING (user_id = current_setting('request.jwt.claims')::json->>'userId');

CREATE POLICY "Users can insert their own blueprints"
  ON blueprints FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims')::json->>'userId');

CREATE POLICY "Users can update their own blueprints"
  ON blueprints FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims')::json->>'userId');

CREATE POLICY "Users can delete their own blueprints"
  ON blueprints FOR DELETE
  USING (user_id = current_setting('request.jwt.claims')::json->>'userId');

-- Sprints policies
CREATE POLICY "Users can view their own sprints"
  ON sprints FOR SELECT
  USING (user_id = current_setting('request.jwt.claims')::json->>'userId');

CREATE POLICY "Users can insert their own sprints"
  ON sprints FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims')::json->>'userId');

CREATE POLICY "Users can update their own sprints"
  ON sprints FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims')::json->>'userId');

CREATE POLICY "Users can delete their own sprints"
  ON sprints FOR DELETE
  USING (user_id = current_setting('request.jwt.claims')::json->>'userId');

-- Sprint tasks policies
CREATE POLICY "Users can view their own sprint tasks"
  ON sprint_tasks FOR SELECT
  USING (sprint_id IN (SELECT id FROM sprints WHERE user_id = current_setting('request.jwt.claims')::json->>'userId'));

CREATE POLICY "Users can manage their own sprint tasks"
  ON sprint_tasks FOR ALL
  USING (sprint_id IN (SELECT id FROM sprints WHERE user_id = current_setting('request.jwt.claims')::json->>'userId'));

-- Offers policies
CREATE POLICY "Users can view their own offers"
  ON offers FOR SELECT
  USING (user_id = current_setting('request.jwt.claims')::json->>'userId');

CREATE POLICY "Users can manage their own offers"
  ON offers FOR ALL
  USING (user_id = current_setting('request.jwt.claims')::json->>'userId');

-- Systems policies
CREATE POLICY "Users can view their own systems"
  ON systems FOR SELECT
  USING (user_id = current_setting('request.jwt.claims')::json->>'userId');

CREATE POLICY "Users can manage their own systems"
  ON systems FOR ALL
  USING (user_id = current_setting('request.jwt.claims')::json->>'userId');

-- Daily stats policies
CREATE POLICY "Users can view their own daily stats"
  ON daily_stats FOR SELECT
  USING (user_id = current_setting('request.jwt.claims')::json->>'userId');

CREATE POLICY "Users can manage their own daily stats"
  ON daily_stats FOR ALL
  USING (user_id = current_setting('request.jwt.claims')::json->>'userId');

-- Chat history policies
CREATE POLICY "Users can view their own chat history"
  ON chat_history FOR SELECT
  USING (user_id = current_setting('request.jwt.claims')::json->>'userId');

CREATE POLICY "Users can manage their own chat history"
  ON chat_history FOR ALL
  USING (user_id = current_setting('request.jwt.claims')::json->>'userId');

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for blueprints
CREATE TRIGGER update_blueprints_updated_at
BEFORE UPDATE ON blueprints
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for sprints
CREATE TRIGGER update_sprints_updated_at
BEFORE UPDATE ON sprints
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for systems
CREATE TRIGGER update_systems_updated_at
BEFORE UPDATE ON systems
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS (Optional - for analytics)
-- =====================================================

-- User revenue summary view
CREATE OR REPLACE VIEW user_revenue_summary AS
SELECT 
  user_id,
  SUM(revenue_generated) as total_sprint_revenue,
  (SELECT SUM(revenue_generated) FROM offers WHERE offers.user_id = sprints.user_id) as total_offer_revenue,
  COUNT(*) as sprint_count
FROM sprints
GROUP BY user_id;

-- =====================================================
-- COMPLETE
-- =====================================================

-- Grant permissions to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ WealthMoves OS database schema created successfully!';
  RAISE NOTICE '📊 Tables created: 7';
  RAISE NOTICE '🔒 RLS policies enabled';
  RAISE NOTICE '⚡ Indexes optimized';
  RAISE NOTICE '🎯 Ready for production!';
END $$;
