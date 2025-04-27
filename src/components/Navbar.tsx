
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from './Logo';

interface NavbarProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar, sidebarOpen }) => {
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-shrink-0">
              <NavLink to="/" className="flex items-center">
                <Logo size="sm" className="mr-2" />
                <span className="ml-2 text-xl font-poppins font-semibold text-trustlens-charcoal">
                  TrustLens
                </span>
              </NavLink>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-4">
            <NavLink to="/" 
              className={({ isActive }) => 
                isActive 
                  ? "px-3 py-2 text-trustlens-blue font-medium" 
                  : "px-3 py-2 text-gray-600 hover:text-trustlens-blue transition-colors duration-300"
              }
            >
              Home
            </NavLink>
            <NavLink to="/analyzer" 
              className={({ isActive }) => 
                isActive 
                  ? "px-3 py-2 text-trustlens-blue font-medium" 
                  : "px-3 py-2 text-gray-600 hover:text-trustlens-blue transition-colors duration-300"
              }
            >
              Consent Analyzer
            </NavLink>
            <NavLink to="/dashboard" 
              className={({ isActive }) => 
                isActive 
                  ? "px-3 py-2 text-trustlens-blue font-medium" 
                  : "px-3 py-2 text-gray-600 hover:text-trustlens-blue transition-colors duration-300"
              }
            >
              Dashboard
            </NavLink>
            <NavLink to="/admin" 
              className={({ isActive }) => 
                isActive 
                  ? "px-3 py-2 text-trustlens-blue font-medium" 
                  : "px-3 py-2 text-gray-600 hover:text-trustlens-blue transition-colors duration-300"
              }
            >
              Admin
            </NavLink>
          </nav>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-gray-600">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-600">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
