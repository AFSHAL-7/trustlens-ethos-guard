
import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  React.useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <div className="flex flex-1 w-full">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar isOpen={sidebarOpen} />
        </div>

        {/* Mobile Drawer */}
        <Sheet open={isMobile && sidebarOpen} onOpenChange={(open) => isMobile && setSidebarOpen(open)}>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar isOpen={true} />
          </SheetContent>
        </Sheet>

        <main className="flex-1 w-full p-4 md:p-6 lg:p-8 transition-all duration-300 page-transition overflow-x-hidden">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
