-- EMERGENCY FIX: Delete ALL old systems from database
-- This will force the page to generate fresh systems from blueprint

-- Delete all systems data
DELETE FROM systems;

-- Verify deletion
SELECT COUNT(*) as remaining_systems FROM systems;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ All old systems deleted!';
  RAISE NOTICE '🔄 Refresh /systems page to see blueprint-based data';
END $$;
