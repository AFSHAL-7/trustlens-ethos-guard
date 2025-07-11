
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string | null;
}

interface UserStats {
  total_analyses: number;
  high_risk_analyses: number;
  average_risk_score: number;
  consent_decisions_count: number;
  last_active: string | null;
}

export const useUserProfile = () => {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !session) {
      setProfile(null);
      setStats(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch or create profile
        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
          throw new Error('Failed to fetch profile');
        }

        // Create profile if it doesn't exist
        if (!profileData) {
          console.log('Creating new profile for user:', user.id);
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || null,
              avatar_url: user.user_metadata?.avatar_url || null
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            throw new Error('Failed to create profile');
          }

          profileData = newProfile;
        }

        setProfile(profileData);

        // Fetch or create stats
        let { data: statsData, error: statsError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (statsError && statsError.code !== 'PGRST116') {
          console.error('Error fetching stats:', statsError);
          throw new Error('Failed to fetch stats');
        }

        // Create stats if they don't exist
        if (!statsData) {
          console.log('Creating new stats for user:', user.id);
          const { data: newStats, error: createStatsError } = await supabase
            .from('user_stats')
            .insert({
              user_id: user.id,
              total_analyses: 0,
              high_risk_analyses: 0,
              average_risk_score: 0,
              consent_decisions_count: 0,
              last_active: new Date().toISOString()
            })
            .select()
            .single();

          if (createStatsError) {
            console.error('Error creating stats:', createStatsError);
            throw new Error('Failed to create stats');
          }

          statsData = newStats;
        }

        setStats(statsData);

      } catch (err: any) {
        console.error('Error in fetchUserData:', err);
        setError(err.message || 'Failed to load user data');
        toast.error('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, session]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
        return false;
      }

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Profile updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile');
      return false;
    }
  };

  const updateStats = async (updates: Partial<UserStats>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_stats')
        .update({ ...updates, last_active: new Date().toISOString() })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating stats:', error);
        return false;
      }

      setStats(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (err) {
      console.error('Error updating stats:', err);
      return false;
    }
  };

  return { 
    profile, 
    stats, 
    loading, 
    error, 
    updateProfile, 
    updateStats 
  };
};
