-- Clear existing dashboard data (reset to start fresh)
DELETE FROM consent_analyses;
DELETE FROM user_stats;

-- Reset any auto-increment or sequence values if they exist
-- This ensures we start clean from zero