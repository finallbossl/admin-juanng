'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && pathname !== '/login') {
      window.location.href = '/login';
    } else {
      setAuthorized(true);
    }
  }, [pathname]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (!authorized) {
    return null;
  }

  const menuItems = [
    { label: 'Overview', href: '/', icon: 'dashboard' },
    { label: 'Movies', href: '/products', icon: 'movie' },
    { label: 'Users', href: '/users', icon: 'group' },
    { label: 'Analytics', href: '/analytics', icon: 'analytics' }
  ];

  return (
    <div className="flex min-h-screen bg-background text-on-background relative">
      {/* Background retro scanline overlay */}
      <div className="scanline" />

      {/* Sidebar navigation */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={closeMobileSidebar}
      />

      {/* Main content wrapper */}
      <div className={`flex flex-col flex-1 min-w-0 min-h-screen transition-all duration-300 pl-0 ${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
        <Header 
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={toggleSidebar}
          onToggleMobileSidebar={toggleMobileSidebar}
        />
        
        {/* Page Content area */}
        <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 md:gap-8 max-w-[1600px] w-full mx-auto overflow-y-auto fade-in pb-24 md:pb-8 pt-20 md:pt-24">
          {children}
        </main>
      </div>

      {/* Bottom Nav (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-surface-variant/80 backdrop-blur-md border-t border-white/10 rounded-t-xl flex justify-around items-center h-16 px-gutter-mobile pb-safe shadow-lg">
        {menuItems.map((item, idx) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={idx}
              href={item.href}
              className={`flex flex-col items-center justify-center transition-all duration-200 cursor-pointer flex-1 py-1 active:scale-90
                ${isActive 
                  ? 'text-primary-container font-bold' 
                  : 'text-on-secondary-fixed-variant hover:bg-white/5'
                }
              `}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-sm text-label-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
