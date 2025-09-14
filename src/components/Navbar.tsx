
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from './Logo';
import UserProfileDropdown from './UserProfileDropdown';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';

interface NavbarProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar, sidebarOpen }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-background dark:bg-background shadow-sm z-10 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-shrink-0">
              <NavLink to="/" className="flex items-center">
                <Logo size="sm" className="mr-2" />
              </NavLink>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-4">
            <NavLink to="/" 
              className={({ isActive }) => 
                isActive 
                  ? "px-3 py-2 text-primary font-medium" 
                  : "px-3 py-2 text-muted-foreground hover:text-primary transition-colors duration-300"
              }
            >
              Home
            </NavLink>
            <NavLink to="/analyzer" 
              className={({ isActive }) => 
                isActive 
                  ? "px-3 py-2 text-primary font-medium" 
                  : "px-3 py-2 text-muted-foreground hover:text-primary transition-colors duration-300"
              }
            >
              Consent Analyzer
            </NavLink>
            <NavLink to="/dashboard" 
              className={({ isActive }) => 
                isActive 
                  ? "px-3 py-2 text-primary font-medium" 
                  : "px-3 py-2 text-muted-foreground hover:text-primary transition-colors duration-300"
              }
            >
              Dashboard
            </NavLink>
            <NavLink to="/admin" 
              className={({ isActive }) => 
                isActive 
                  ? "px-3 py-2 text-primary font-medium" 
                  : "px-3 py-2 text-muted-foreground hover:text-primary transition-colors duration-300"
              }
            >
              Admin
            </NavLink>
          </nav>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/admin')}
            >
              <Settings className="h-5 w-5" />
            </Button>
            
            {loading ? (
              <div className="h-10 w-10 bg-muted rounded-full animate-pulse"></div>
            ) : user ? (
              <UserProfileDropdown />
            ) : (
              <Button onClick={() => navigate('/auth')} variant="outline">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
