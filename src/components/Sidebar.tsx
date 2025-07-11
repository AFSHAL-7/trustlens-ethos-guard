
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Calendar, Info, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { user } = useAuth();
  
  // Check if user has admin role
  const { data: userRoles } = useQuery({
    queryKey: ['userRoles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user?.id,
  });

  const isAdmin = userRoles?.some(role => role.role === 'admin') || false;

  const menuItems = [
    { name: 'Home', icon: <Home className="h-5 w-5" />, path: '/' },
    { name: 'Consent Analyzer', icon: <Search className="h-5 w-5" />, path: '/analyzer' },
    { name: 'Risk Report', icon: <Info className="h-5 w-5" />, path: '/report' },
    { name: 'Dashboard', icon: <Calendar className="h-5 w-5" />, path: '/dashboard' },
    // Only show Admin Panel for admin users
    ...(isAdmin ? [{ name: 'Admin Panel', icon: <Settings className="h-5 w-5" />, path: '/admin' }] : []),
  ];

  return (
    <div 
      className={`bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-0 md:w-16'
      } overflow-hidden`}
    >
      <div className="flex flex-col h-full py-6">
        <div className="px-4 mb-6">
          <h2 className={`text-xl font-semibold ${isOpen ? 'opacity-100' : 'opacity-0 md:opacity-100'} transition-opacity duration-300`}>
            Menu
          </h2>
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center py-3 px-3 rounded-2xl transition-all duration-300 ${
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50'
                    }`
                  }
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span 
                    className={`ml-3 transition-opacity duration-300 ${
                      isOpen ? 'opacity-100' : 'opacity-0 md:opacity-0'
                    } whitespace-nowrap`}
                  >
                    {item.name}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="px-4 mt-6">
          <div className={`text-xs text-sidebar-foreground/70 ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
            TrustLens v1.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
