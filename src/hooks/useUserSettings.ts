import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UserSettings {
  id?: string;
  company_name: string;
  contact_email: string | null;
  enable_analytics: boolean;
  email_notifications: boolean;
  risk_threshold: number;
  enhanced_privacy_analysis: boolean;
  gdpr_compliance_check: boolean;
  ccpa_compliance_check: boolean;
  api_key: string | null;
  webhook_url: string | null;
  webhook_consent_created: boolean;
  webhook_consent_updated: boolean;
  webhook_risk_detected: boolean;
}

export const useUserSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        let { data: settingsData, error: fetchError } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching settings:', fetchError);
          throw new Error('Failed to fetch settings');
        }

        // Create default settings if they don't exist
        if (!settingsData) {
          const defaultSettings = {
            user_id: user.id,
            company_name: 'TrustLens Inc.',
            contact_email: user.email,
            enable_analytics: true,
            email_notifications: true,
            risk_threshold: 75,
            enhanced_privacy_analysis: true,
            gdpr_compliance_check: true,
            ccpa_compliance_check: false,
            api_key: `tl_${Date.now()}_${Math.random().toString(36).substring(2)}`,
            webhook_url: null,
            webhook_consent_created: true,
            webhook_consent_updated: true,
            webhook_risk_detected: true
          };

          const { data: newSettings, error: createError } = await supabase
            .from('user_settings')
            .insert(defaultSettings)
            .select()
            .single();

          if (createError) {
            console.error('Error creating settings:', createError);
            throw new Error('Failed to create default settings');
          }

          settingsData = newSettings;
        }

        setSettings(settingsData);
      } catch (err: any) {
        console.error('Error in fetchSettings:', err);
        setError(err.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user || !settings) return false;

    try {
      const { error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating settings:', error);
        toast.error('Failed to update settings');
        return false;
      }

      setSettings(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Settings updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating settings:', err);
      toast.error('Failed to update settings');
      return false;
    }
  };

  return { 
    settings, 
    loading, 
    error, 
    updateSettings 
  };
};