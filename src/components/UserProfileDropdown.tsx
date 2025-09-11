
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
  Calendar,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

const UserProfileDropdown = () => {
  const { user, signOut } = useAuth();
  const { profile, stats, loading } = useUserProfile();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  if (!user) return null;

  const getInitials = (name: string | null) => {
    if (!name) return user.email?.charAt(0).toUpperCase() || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRiskLevel = (score: number | null) => {
    if (!score && score !== 0) return { level: 'No Data', color: 'bg-gray-500' };
    if (score >= 80) return { level: 'High Risk', color: 'bg-red-500' };
    if (score >= 60) return { level: 'Medium Risk', color: 'bg-orange-500' };
    return { level: 'Low Risk', color: 'bg-green-500' };
  };

  const riskLevel = getRiskLevel(stats?.average_risk_score || null);
  const displayName = profile?.full_name || user.user_metadata?.full_name || 'User';
  const displayEmail = profile?.email || user.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-accent">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={profile?.avatar_url || user.user_metadata?.avatar_url || ''} 
              alt={displayName} 
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage 
                  src={profile?.avatar_url || user.user_metadata?.avatar_url || ''} 
                  alt={displayName} 
                />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium leading-none text-foreground">
                  {displayName}
                </p>
                <p className="text-xs leading-none text-muted-foreground mt-1">
                  {displayEmail}
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
              <div className="h-4 w-4 animate-pulse bg-muted rounded"></div>
              <span>Loading stats...</span>
            </div>
          </DropdownMenuItem>
        ) : stats ? (
          <>
            <div className="px-2 py-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Privacy Analytics
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                  <div className="flex items-center space-x-1 mb-1">
                    <BarChart3 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total</span>
                  </div>
                  <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                    {stats.total_analyses}
                  </p>
                </div>
                
                <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                  <div className="flex items-center space-x-1 mb-1">
                    <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" />
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">High Risk</span>
                  </div>
                  <p className="text-sm font-bold text-red-700 dark:text-red-300">
                    {stats.high_risk_analyses}
                  </p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                  <div className="flex items-center space-x-1 mb-1">
                    <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">Avg Score</span>
                  </div>
                  <p className="text-sm font-bold text-green-700 dark:text-green-300">
                    {stats.average_risk_score}%
                  </p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg">
                  <div className="flex items-center space-x-1 mb-1">
                    <CheckCircle className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Decisions</span>
                  </div>
                  <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
                    {stats.consent_decisions_count}
                  </p>
                </div>
              </div>
              
              {stats.last_active && (
                <div className="mt-3 flex items-center space-x-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Last active: {new Date(stats.last_active).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            <DropdownMenuSeparator />
          </>
        ) : (
          <>
            <div className="px-2 py-3">
              <div className="text-center py-4">
                <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  Start analyzing documents to see your privacy stats!
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem disabled className="text-muted-foreground">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings (Coming Soon)</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleSignOut} 
          className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileDropdown;
