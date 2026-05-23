'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './DashboardLayout.module.css';

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
    <div className={styles.wrapper}>
      {/* Background retro scanline overlay */}
      <div className="scanline" />

      {/* Sidebar navigation */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={closeMobileSidebar}
      />

      {/* Main content wrapper */}
      <div className={`${styles.main} ${isSidebarCollapsed ? styles.mainCollapsed : ''}`}>
        <Header 
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={toggleSidebar}
          onToggleMobileSidebar={toggleMobileSidebar}
        />
        
        {/* Page Content area */}
        <main className={`${styles.content} fade-in pb-24 md:pb-8 pt-20 md:pt-24`}>
          {children}
        </main>
      </div>

      {/* Bottom Nav (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-surface-variant/80 backdrop-blur-md border-t border-white/10 rounded-t-xl flex justify-around items-center h-16 pb-safe shadow-lg">
        {menuItems.map((item, idx) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={idx}
              href={item.href}
              className={`flex flex-col items-center justify-center transition-all duration-200 cursor-pointer flex-1 py-1
                ${isActive 
                  ? 'text-primary-container font-bold scale-105' 
                  : 'text-[#474746] dark:text-[#b7b5b4] hover:bg-white/5'
                }
              `}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
