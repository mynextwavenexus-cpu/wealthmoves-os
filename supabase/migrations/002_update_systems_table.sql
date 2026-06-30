-- Update systems table to support new fields
-- Migration: 002_update_systems_table.sql

-- Add new columns to systems table
ALTER TABLE systems 
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'Settings2',
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS components JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;

-- Update type enum to include new system types
ALTER TABLE systems 
DROP CONSTRAINT IF EXISTS systems_type_check;

ALTER TABLE systems
ADD CONSTRAINT systems_type_check 
CHECK (type IN ('newsletter', 'coaching', 'course', 'consulting', 'affiliate', 'community'));

-- Update status enum to use new values
ALTER TABLE systems
DROP CONSTRAINT IF EXISTS systems_status_check;

ALTER TABLE systems
ADD CONSTRAINT systems_status_check
CHECK (status IN ('planning', 'building', 'active'));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_systems_user_id ON systems(user_id);
CREATE INDEX IF NOT EXISTS idx_systems_status ON systems(status);
CREATE INDEX IF NOT EXISTS idx_systems_type ON systems(type);

-- Update existing rows with default values
UPDATE systems
SET 
  icon = CASE 
    WHEN type = 'newsletter' THEN 'Mail'
    WHEN type = 'coaching' THEN 'Users'
    WHEN type = 'course' THEN 'BookOpen'
    WHEN type = 'consulting' THEN 'Briefcase'
    WHEN type = 'affiliate' THEN 'Share2'
    WHEN type = 'community' THEN 'MessageCircle'
    ELSE 'Settings2'
  END,
  description = CASE 
    WHEN type = 'newsletter' THEN 'Build an audience and monetize through sponsorships and products.'
    WHEN type = 'coaching' THEN '1-on-1 or group coaching with booking, payment, and delivery.'
    WHEN type = 'course' THEN 'Create, host, and sell online courses on autopilot.'
    WHEN type = 'consulting' THEN 'High-ticket consulting with proposals, contracts, and delivery.'
    WHEN type = 'affiliate' THEN 'Promote products and earn commissions on autopilot.'
    WHEN type = 'community' THEN 'Build a paid community with recurring revenue.'
    ELSE ''
  END,
  components = '[]'::jsonb,
  progress = 0
WHERE icon IS NULL OR icon = '';

COMMENT ON COLUMN systems.icon IS 'Icon name from lucide-react';
COMMENT ON COLUMN systems.description IS 'System description displayed to user';
COMMENT ON COLUMN systems.components IS 'Array of system components with completion status';
COMMENT ON COLUMN systems.progress IS 'Overall completion percentage (0-100)';
