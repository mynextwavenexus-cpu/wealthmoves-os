-- Supabase Schema for WealthMoves OS
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Blueprints table
CREATE TABLE IF NOT EXISTS blueprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  name TEXT DEFAULT '',
  monthly_income DECIMAL(12, 2) DEFAULT 0,
  current_income DECIMAL(12, 2) DEFAULT 0,
  yearly_target DECIMAL(12, 2) DEFAULT 0,
  monthly_target DECIMAL(12, 2) DEFAULT 0,
  weekly_target DECIMAL(12, 2) DEFAULT 0,
  daily_target DECIMAL(12, 2) DEFAULT 0,
  hourly_target DECIMAL(12, 2) DEFAULT 0,
  home_cost DECIMAL(12, 2) DEFAULT 0,
  vehicle_cost DECIMAL(12, 2) DEFAULT 0,
  travel_cost DECIMAL(12, 2) DEFAULT 0,
  food_cost DECIMAL(12, 2) DEFAULT 0,
  trainer_cost DECIMAL(12, 2) DEFAULT 0,
  chef_cost DECIMAL(12, 2) DEFAULT 0,
  college_cost DECIMAL(12, 2) DEFAULT 0,
  retirement_cost DECIMAL(12, 2) DEFAULT 0,
  other_cost DECIMAL(12, 2) DEFAULT 0,
  other_description TEXT DEFAULT '',
  skills TEXT DEFAULT '',
  experience TEXT DEFAULT '',
  passion TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sprints table
CREATE TABLE IF NOT EXISTS sprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  day INTEGER DEFAULT 1,
  total_days INTEGER DEFAULT 30,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revenue_generated DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sprint tasks table
CREATE TABLE IF NOT EXISTS sprint_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sprint_id UUID REFERENCES sprints(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price DECIMAL(12, 2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused')),
  revenue_generated DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Systems table
CREATE TABLE IF NOT EXISTS systems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'automation' CHECK (type IN ('newsletter', 'funnel', 'automation', 'content')),
  status TEXT DEFAULT 'building' CHECK (status IN ('building', 'active', 'optimizing')),
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily stats table
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  new_leads INTEGER DEFAULT 0,
  conversations INTEGER DEFAULT 0,
  revenue DECIMAL(12, 2) DEFAULT 0,
  content_published INTEGER DEFAULT 0,
  actions_completed JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Chat history table
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blueprints_user_id ON blueprints(user_id);
CREATE INDEX IF NOT EXISTS idx_sprints_user_id ON sprints(user_id);
CREATE INDEX IF NOT EXISTS idx_sprint_tasks_sprint_id ON sprint_tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_offers_user_id ON offers(user_id);
CREATE INDEX IF NOT EXISTS idx_systems_user_id ON systems(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_id ON daily_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now - update with auth later)
CREATE POLICY "Allow all" ON blueprints FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON sprints FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON sprint_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON offers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON systems FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON daily_stats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON chat_history FOR ALL USING (true) WITH CHECK (true);

-- Insert default data for Emma (user_001)
INSERT INTO blueprints (
  user_id, name, monthly_income, current_income, 
  yearly_target, monthly_target, weekly_target, daily_target, hourly_target,
  home_cost, vehicle_cost, travel_cost, food_cost, trainer_cost, chef_cost,
  college_cost, retirement_cost, other_cost, skills, experience, passion
) VALUES (
  'user_001', 'Emma Jackson', 20700, 7245,
  248400, 20700, 4777, 955, 120,
  4500, 1200, 2000, 1500, 500, 0,
  1000, 5000, 4700,
  'Business strategy, AI automation, marketing, coaching, community building',
  'Built multiple 6-figure businesses, 10+ years in digital marketing, helped 100+ entrepreneurs scale',
  'Helping people build freedom through entrepreneurship and AI-powered systems'
) ON CONFLICT (user_id) DO NOTHING;

INSERT INTO sprints (user_id, day, total_days, start_date, revenue_generated) VALUES
  ('user_001', 12, 30, '2026-06-10', 1240) ON CONFLICT (user_id) DO NOTHING;

INSERT INTO offers (user_id, name, description, price, status, revenue_generated) VALUES
  ('user_001', 'AI Revenue Sprint', '30-day intensive to build your first AI-powered revenue system', 297, 'active', 5940),
  ('user_001', 'WealthMoves Pro', 'Complete access to all tools and systems', 49, 'active', 2450);

INSERT INTO systems (user_id, name, type, status, metrics) VALUES
  ('user_001', 'Newsletter Growth System', 'newsletter', 'active', '{"leads": 234, "conversions": 12, "revenue": 1240}');
