
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from './Logo';
import UserProfileDropdown from './UserProfileDropdown';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavbarProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar, sidebarOpen }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/analyzer', label: 'Consent Analyzer' },
    { to: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <header className="bg-background shadow-sm z-50 border-b border-border sticky top-0">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 md:gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar} 
              className="flex-shrink-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-shrink-0">
              <NavLink to="/" className="flex items-center">
                <Logo size="sm" />
              </NavLink>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => 
                  isActive 
                    ? "px-3 py-2 text-primary font-medium" 
                    : "px-3 py-2 text-muted-foreground hover:text-primary transition-colors duration-300"
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Navigation Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-6">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => 
                      isActive 
                        ? "px-4 py-2 text-primary font-medium rounded-lg bg-primary/10" 
                        : "px-4 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors duration-300"
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {loading ? (
              <div className="h-10 w-10 bg-muted rounded-full animate-pulse"></div>
            ) : user ? (
              <UserProfileDropdown />
            ) : (
              <Button onClick={() => navigate('/auth')} variant="outline" size="sm" className="hidden sm:flex">
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
