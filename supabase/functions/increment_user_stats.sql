
CREATE OR REPLACE FUNCTION increment_user_stats(
  user_id UUID,
  new_risk_score INTEGER,
  is_high_risk BOOLEAN
)
RETURNS void AS $$
DECLARE
  current_stats RECORD;
  new_average DECIMAL;
BEGIN
  -- Get current stats or create if not exists
  SELECT * INTO current_stats 
  FROM user_stats 
  WHERE user_stats.user_id = increment_user_stats.user_id;
  
  IF NOT FOUND THEN
    -- Create new stats record
    INSERT INTO user_stats (
      user_id, 
      total_analyses, 
      high_risk_analyses, 
      average_risk_score, 
      consent_decisions_count,
      last_active
    ) VALUES (
      increment_user_stats.user_id,
      1,
      CASE WHEN is_high_risk THEN 1 ELSE 0 END,
      new_risk_score,
      1,
      NOW()
    );
  ELSE
    -- Calculate new average
    new_average := ((current_stats.average_risk_score * current_stats.total_analyses) + new_risk_score) / (current_stats.total_analyses + 1);
    
    -- Update existing stats
    UPDATE user_stats SET
      total_analyses = current_stats.total_analyses + 1,
      high_risk_analyses = current_stats.high_risk_analyses + CASE WHEN is_high_risk THEN 1 ELSE 0 END,
      average_risk_score = new_average,
      consent_decisions_count = current_stats.consent_decisions_count + 1,
      last_active = NOW(),
      updated_at = NOW()
    WHERE user_stats.user_id = increment_user_stats.user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
