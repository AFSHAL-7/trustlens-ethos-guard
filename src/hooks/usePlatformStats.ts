import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PlatformStats {
  total_analyses: number;
  total_risk_issues: number;
  total_users: number;
}

export const usePlatformStats = () => {
  return useQuery({
    queryKey: ['platformStats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_platform_stats');
      
      if (error) {
        console.error('Error fetching platform stats:', error);
        throw error;
      }
      
      // The RPC returns an array with one object
      const stats = data?.[0] as PlatformStats;
      
      return {
        totalAnalyses: Number(stats?.total_analyses || 0),
        totalRiskIssues: Number(stats?.total_risk_issues || 0),
        totalUsers: Number(stats?.total_users || 0),
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    staleTime: 20000, // Consider data stale after 20 seconds
  });
};
