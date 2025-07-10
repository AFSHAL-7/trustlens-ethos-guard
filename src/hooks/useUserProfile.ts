
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface UserStats {
  total_analyses: number;
  high_risk_analyses: number;
  average_risk_score: number;
  consent_decisions_count: number;
  last_active: string | null;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setStats(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
        } else {
          setProfile(profileData);
        }

        // Fetch or create stats
        const { data: statsData, error: statsError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (statsError) {
          if (statsError.code === 'PGRST116') {
            // No stats found, create initial stats
            const { data: newStats, error: createError } = await supabase
              .from('user_stats')
              .insert({
                user_id: user.id,
                total_analyses: 0,
                high_risk_analyses: 0,
                average_risk_score: 0,
                consent_decisions_count: 0
              })
              .select()
              .single();

            if (createError) {
              console.error('Error creating stats:', createError);
            } else {
              setStats(newStats);
            }
          } else {
            console.error('Error fetching stats:', statsError);
          }
        } else {
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error in fetchProfile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return { profile, stats, loading };
};
