-- Fix database issues for user profiles and stats

-- First, clean up duplicate user_stats entries (keep the latest one for each user)
DELETE FROM user_stats 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id 
  FROM user_stats 
  ORDER BY user_id, created_at DESC
);

-- Add unique constraint to prevent duplicate user_stats
ALTER TABLE user_stats ADD CONSTRAINT unique_user_stats_user_id UNIQUE (user_id);

-- Drop and recreate RLS policies for profiles table
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create proper RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Drop and recreate RLS policies for user_stats table
DROP POLICY IF EXISTS "Users can create their own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can view their own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can update their own stats" ON user_stats;

-- Create proper RLS policies for user_stats
CREATE POLICY "Users can view their own stats" 
ON user_stats FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" 
ON user_stats FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" 
ON user_stats FOR UPDATE 
USING (auth.uid() = user_id);

-- Fix function search paths (security improvement)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Update the increment_user_stats function to have proper search path
CREATE OR REPLACE FUNCTION public.increment_user_stats(
  user_id UUID,
  new_risk_score INTEGER,
  is_high_risk BOOLEAN
)
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;