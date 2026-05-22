'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
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

  return (
    <div className={styles.wrapper}>
      {/* Sidebar navigation */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={closeMobileSidebar}
      />

      {/* Main content wrapper */}
      <div className={`${styles.main} ${isSidebarCollapsed ? styles.mainCollapsed : ''}`}>
        <Header 
          onToggleSidebar={toggleSidebar}
          onToggleMobileSidebar={toggleMobileSidebar}
        />
        
        {/* Page Content area */}
        <main className={`${styles.content} fade-in`}>
          {children}
        </main>
      </div>
    </div>
  );
}
