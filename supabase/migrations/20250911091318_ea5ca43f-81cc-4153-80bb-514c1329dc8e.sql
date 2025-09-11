-- Reset all user statistics to zero
UPDATE user_stats 
SET 
  total_analyses = 0,
  high_risk_analyses = 0,
  average_risk_score = 0,
  consent_decisions_count = 0,
  updated_at = NOW();