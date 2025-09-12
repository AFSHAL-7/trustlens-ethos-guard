-- Reset all user stats to zero to start fresh
UPDATE user_stats SET 
  total_analyses = 0,
  high_risk_analyses = 0,
  average_risk_score = 0,
  consent_decisions_count = 0,
  last_active = NOW(),
  updated_at = NOW();

-- Create table for user settings
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT DEFAULT 'TrustLens Inc.',
  contact_email TEXT,
  enable_analytics BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  risk_threshold INTEGER DEFAULT 75,
  enhanced_privacy_analysis BOOLEAN DEFAULT true,
  gdpr_compliance_check BOOLEAN DEFAULT true,
  ccpa_compliance_check BOOLEAN DEFAULT false,
  api_key TEXT,
  webhook_url TEXT,
  webhook_consent_created BOOLEAN DEFAULT true,
  webhook_consent_updated BOOLEAN DEFAULT true,
  webhook_risk_detected BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user_settings
CREATE POLICY "Users can view their own settings" 
ON public.user_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
ON public.user_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.user_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on user_settings
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_last_active();

-- Add columns to consent_analyses for individual terms tracking
ALTER TABLE public.consent_analyses 
ADD COLUMN IF NOT EXISTS individual_terms_decisions JSONB DEFAULT '[]'::jsonb;