
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { 
  User, 
  LogOut, 
  BarChart3, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

const UserProfileDropdown = () => {
  const { user, signOut } = useAuth();
  const { profile, stats, loading } = useUserProfile();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  if (!user) return null;

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRiskLevel = (score: number | null) => {
    if (!score) return { level: 'Unknown', color: 'bg-gray-500' };
    if (score >= 80) return { level: 'High Risk', color: 'bg-red-500' };
    if (score >= 60) return { level: 'Medium Risk', color: 'bg-orange-500' };
    return { level: 'Low Risk', color: 'bg-green-500' };
  };

  const riskLevel = getRiskLevel(stats?.average_risk_score || 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
            <AvatarFallback className="bg-trustlens-blue text-white">
              {getInitials(profile?.full_name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
                <AvatarFallback className="bg-trustlens-blue text-white">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium leading-none">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground mt-1">
                  {profile?.email || user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className={`${riskLevel.color} text-white text-xs`}>
                <Shield className="h-3 w-3 mr-1" />
                {riskLevel.level}
              </Badge>
              {stats && stats.total_analyses > 0 && (
                <Badge variant="outline" className="text-xs">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  {stats.total_analyses} analyses
                </Badge>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {loading ? (
          <DropdownMenuItem disabled>
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-pulse bg-gray-300 rounded"></div>
              <span>Loading stats...</span>
            </div>
          </DropdownMenuItem>
        ) : stats ? (
          <>
            <div className="px-2 py-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Your Privacy Stats
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="h-3 w-3 text-blue-600" />
                    <span className="text-xs text-blue-600 font-medium">Total</span>
                  </div>
                  <p className="text-sm font-bold text-blue-700">{stats.total_analyses}</p>
                </div>
                <div className="bg-red-50 p-2 rounded-lg">
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="h-3 w-3 text-red-600" />
                    <span className="text-xs text-red-600 font-medium">High Risk</span>
                  </div>
                  <p className="text-sm font-bold text-red-700">{stats.high_risk_analyses}</p>
                </div>
                <div className="bg-green-50 p-2 rounded-lg">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">Avg Score</span>
                  </div>
                  <p className="text-sm font-bold text-green-700">{stats.average_risk_score}%</p>
                </div>
                <div className="bg-purple-50 p-2 rounded-lg">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3 text-purple-600" />
                    <span className="text-xs text-purple-600 font-medium">Decisions</span>
                  </div>
                  <p className="text-sm font-bold text-purple-700">{stats.consent_decisions_count}</p>
                </div>
              </div>
              {stats.last_active && (
                <div className="mt-2 flex items-center space-x-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>Last active: {new Date(stats.last_active).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            <DropdownMenuSeparator />
          </>
        ) : (
          <>
            <div className="px-2 py-2">
              <p className="text-xs text-gray-500 text-center">
                Start analyzing documents to see your privacy stats!
              </p>
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileDropdown;
