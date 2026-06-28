-- Seed data for WealthMoves OS
-- This runs after migrations during db reset

-- Insert default blueprint for Emma (user_001)
INSERT INTO blueprints (
  user_id, name, monthly_income, current_income, 
  yearly_target, monthly_target, weekly_target, daily_target, hourly_target,
  home_cost, vehicle_cost, travel_cost, food_cost, trainer_cost, chef_cost,
  college_cost, retirement_cost, other_cost, other_description,
  skills, experience, passion
) VALUES (
  'user_001', 'Emma Jackson', 20700, 7245,
  248400, 20700, 4777, 955, 120,
  4500, 1200, 2000, 1500, 500, 0,
  1000, 5000, 4700, 'Business operations, team management, software tools',
  'Business strategy, AI automation, marketing, coaching, community building',
  'Built multiple 6-figure businesses, 10+ years in digital marketing, helped 100+ entrepreneurs scale',
  'Helping people build freedom through entrepreneurship and AI-powered systems'
) ON CONFLICT (user_id) DO NOTHING;

-- Insert default sprint for Emma
INSERT INTO sprints (user_id, day, total_days, start_date, revenue_generated) VALUES
  ('user_001', 12, 30, '2026-06-10', 1240) ON CONFLICT (user_id) DO NOTHING;

-- Insert sprint tasks
DO $$
DECLARE
  sprint_uuid UUID;
BEGIN
  SELECT id INTO sprint_uuid FROM sprints WHERE user_id = 'user_001' LIMIT 1;
  
  IF sprint_uuid IS NOT NULL THEN
    INSERT INTO sprint_tasks (sprint_id, label, completed, category) VALUES
      (sprint_uuid, 'Define your dream life income goal', true, 'strategy'),
      (sprint_uuid, 'Identify 3 potential revenue streams', true, 'strategy'),
      (sprint_uuid, 'Create your first offer outline', false, 'offers'),
      (sprint_uuid, 'Set up your sales system', false, 'systems'),
      (sprint_uuid, 'Reach out to 5 prospects', false, 'sales'),
      (sprint_uuid, 'Create content for your audience', false, 'content'),
      (sprint_uuid, 'Track your first revenue', false, 'analytics')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Insert default offers
INSERT INTO offers (user_id, name, description, price, status, revenue_generated) VALUES
  ('user_001', 'AI Revenue Sprint', '30-day intensive to build your first AI-powered revenue system', 297, 'active', 5940),
  ('user_001', 'WealthMoves Pro', 'Complete access to all tools and systems', 49, 'active', 2450)
ON CONFLICT DO NOTHING;

-- Insert default system
INSERT INTO systems (user_id, name, type, status, metrics) VALUES
  ('user_001', 'Newsletter Growth System', 'newsletter', 'active', '{"leads": 234, "conversions": 12, "revenue": 1240}'::jsonb)
ON CONFLICT DO NOTHING;
