
import { useState, useEffect, useRef } from 'react';
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!user || !session) {
      setProfile(null);
      setStats(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Don't proceed if session is expired
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      console.log('Session expired, waiting for refresh...');
      setError('Session expired, refreshing...');
      return;
    }

    // Debounce the fetch to prevent rapid successive calls during auth state changes
    timeoutRef.current = setTimeout(() => {
      const fetchUserData = async () => {
        try {
          setLoading(true);
          setError(null);

          // Fetch or create profile with better error handling
          let { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          // Handle auth-related errors differently
          if (profileError) {
            if (profileError.code === 'PGRST116') {
              // No rows found - this is expected for new users
            } else if (profileError.code === '42501' || profileError.message?.includes('JWT')) {
              console.log('Auth error fetching profile, skipping creation to avoid conflicts');
              setError('Authentication issue - please refresh the page');
              return;
            } else {
              console.error('Error fetching profile:', profileError);
              throw new Error('Failed to fetch profile');
            }
          }

          // Create profile if it doesn't exist and we have valid auth
          if (!profileData && session && user) {
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
              // If creation fails due to RLS/auth issues, don't error out - just wait for next auth cycle
              if (createError.code === '42501' || createError.message?.includes('JWT') || createError.message?.includes('row-level security')) {
                console.log('Profile creation skipped due to auth issue, will retry on next session refresh');
                setError('Loading profile - please wait...');
                return;
              }
              console.error('Error creating profile:', createError);
              throw new Error('Failed to create profile');
            }

            profileData = newProfile;
          }

          setProfile(profileData);

          // Fetch or create stats with better error handling
          let { data: statsData, error: statsError } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          // Handle auth-related errors for stats
          if (statsError) {
            if (statsError.code === 'PGRST116') {
              // No rows found - this is expected for new users
            } else if (statsError.code === '42501' || statsError.message?.includes('JWT')) {
              console.log('Auth error fetching stats, skipping creation to avoid conflicts');
              setError('Authentication issue - please refresh the page');
              return;
            } else {
              console.error('Error fetching stats:', statsError);
              throw new Error('Failed to fetch stats');
            }
          }

          // Create stats if they don't exist and we have valid auth
          if (!statsData && session && user) {
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
              // If creation fails due to RLS/auth issues, don't error out - just wait for next auth cycle
              if (createStatsError.code === '42501' || createStatsError.message?.includes('JWT') || createStatsError.message?.includes('row-level security')) {
                console.log('Stats creation skipped due to auth issue, will retry on next session refresh');
                setError('Loading user stats - please wait...');
                return;
              }
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
    }, 300); // 300ms debounce

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
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
