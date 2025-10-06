-- Create a function to get platform-wide statistics
CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS TABLE (
  total_analyses bigint,
  total_risk_issues bigint,
  total_users bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE((SELECT COUNT(*) FROM consent_analyses), 0) as total_analyses,
    COALESCE((SELECT SUM(high_risk_analyses) FROM user_stats), 0) as total_risk_issues,
    COALESCE((SELECT COUNT(DISTINCT user_id) FROM consent_analyses), 0) as total_users;
END;
$$;